//! Spike runner for T-009: boolean-union the fixture blade STL with a hub
//! built as a hollow cylinder, using the Manifold kernel inside a container.
//!
//! Used by the `deploy/manifold/` Dockerfile. Not a workspace member — it is
//! compiled inside the container so the image is fully self-contained.

use std::collections::HashMap;
use std::env;
use std::fs;

use manifold3d::Manifold;

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();
    if args.len() != 2 {
        eprintln!("usage: manifold-union <input.stl> <output.stl>");
        std::process::exit(2);
    }
    let (input, output) = (&args[0], &args[1]);

    let failed = run_selfcheck();

    let blade = match load_stl(input) {
        Ok(manifold) => manifold,
        Err(error) => {
            eprintln!("FAIL: cannot load {input}: {error}");
            std::process::exit(1);
        }
    };

    // Hub geometry matches the fixture: hollow cylinder along +z, length 50 mm,
    // outer diameter 120 mm, bore 12 mm, shifted along +z so the top 2 mm of the
    // hub overlaps the blade root at z = 60 mm (T-203: unified watertight solid).
    let hub_outer = Manifold::cylinder(50.0, 60.0, 60.0, 64, false).translate(0.0, 0.0, 12.0);
    let hub_inner = Manifold::cylinder(50.0, 6.0, 6.0, 64, false).translate(0.0, 0.0, 12.0);
    let hub = hub_outer.difference(&hub_inner);

    let union_ = blade.union(&hub);
    if union_.is_empty() {
        eprintln!("FAIL: union is empty");
        std::process::exit(1);
    }
    let write_res = if output.to_ascii_lowercase().ends_with(".3mf") {
        write_3mf(&union_, output)
    } else {
        write_stl(&union_, output)
    };
    if let Err(error) = write_res {
        eprintln!("FAIL: cannot write {output}: {error}");
        std::process::exit(1);
    }

    println!();
    println!("blade volume = {:.3} mm^3", blade.volume());
    println!("hub volume   = {:.3} mm^3", hub.volume());
    println!("union volume = {:.3} mm^3", union_.volume());
    println!("union verts  = {}", union_.num_vert());
    println!("union tris   = {}", union_.num_tri());
    println!("union genus  = {}", union_.genus());
    println!("status code  = {:?}", union_.raw_status());
    println!("output       = {output}");

    if failed > 0 {
        std::process::exit(1);
    }
}

/// Deterministic boolean engine check: contained sub-volume, subtraction, and
/// a real overlapping union. Returns the number of failed assertions.
fn run_selfcheck() -> i32 {
    // b is fully inside a: union must stay exactly a, difference must hollow it.
    let a = Manifold::cube(20.0, 20.0, 20.0, true);
    let b = Manifold::cube(10.0, 10.0, 10.0, true);
    let contained = a.union(&b).volume();
    let hollow = a.difference(&b).volume();

    // Two equal boxes shifted so their intersection is x∈[-5,10] → 15 × 20 × 20.
    let p = Manifold::cube(20.0, 20.0, 20.0, true);
    let q = Manifold::cube(20.0, 20.0, 20.0, true).translate(5.0, 0.0, 0.0);
    let overlapped = p.union(&q).volume();

    let mut failed = 0;
    if (contained - 8000.0).abs() > 1e-6 {
        eprintln!("FAIL selfcheck contained-union = {contained}");
        failed += 1;
    }
    if (hollow - 7000.0).abs() > 1e-6 {
        eprintln!("FAIL selfcheck subtract = {hollow}");
        failed += 1;
    }
    if (overlapped - 10000.0).abs() > 1e-6 {
        eprintln!("FAIL selfcheck overlap-union = {overlapped}");
        failed += 1;
    }
    println!(
        "selfcheck: contained-union={contained:.3} subtract={hollow:.3} overlap-union={overlapped:.3}"
    );
    println!(
        "selfcheck: {}",
        if failed == 0 { "PASS" } else { "FAIL" }
    );
    failed
}

/// Loads a **binary** STL, weld-identical vertices, returns a Manifold.
fn load_stl(path: &str) -> Result<Manifold, String> {
    let bytes = fs::read(path).map_err(|error| error.to_string())?;
    if bytes.len() < 84 {
        return Err("not a binary STL (file too short)".to_string());
    }
    let count = u32::from_le_bytes(
        bytes[80..84]
            .try_into()
            .map_err(|_| "truncated triangle count".to_string())?,
    ) as usize;
    if bytes.len() != 84 + 50 * count {
        return Err(format!(
            "binary STL size mismatch: {} bytes, expected 84 + 50*{count}",
            bytes.len()
        ));
    }

    let mut vertices: Vec<f64> = Vec::with_capacity(count * 9);
    let mut triangles: Vec<u64> = Vec::with_capacity(count * 3);
    // STL stores duplicated per-triangle vertices; weld on exact f32 bits
    // (the writer emits identical bits for shared vertices — F-geom1-007).
    let mut weld: HashMap<(u32, u32, u32), u32> = HashMap::new();

    for triangle in 0..count {
        let base = 84 + 50 * triangle;
        let mut tri = [0u32; 3];
        for vertex in 0..3 {
            let off = base + 12 + vertex * 12;
            let norm = |v: f32| if v == 0.0 { 0.0_f32 } else { v };
            let x = norm(f32::from_le_bytes(bytes[off..off + 4].try_into().unwrap()));
            let y = norm(f32::from_le_bytes(bytes[off + 4..off + 8].try_into().unwrap()));
            let z = norm(f32::from_le_bytes(bytes[off + 8..off + 12].try_into().unwrap()));
            let id = *weld.entry((x.to_bits(), y.to_bits(), z.to_bits())).or_insert_with(|| {
                let id = (vertices.len() / 3) as u32;
                vertices.push(x as f64);
                vertices.push(y as f64);
                vertices.push(z as f64);
                id
            });
            tri[vertex] = id;
        }
        triangles.extend(tri.iter().map(|&index| u64::from(index)));
    }

    Manifold::from_mesh_f64(&vertices, 3, &triangles)
        .map_err(|error| format!("from_mesh_f64 rejected the mesh: {error}"))
}

/// Writes a **binary** STL from the manifold (unit normals, f32 coordinates).
fn write_stl(manifold: &Manifold, path: &str) -> Result<(), String> {
    let (props, n_props, triangles) = manifold.to_mesh_f64();
    let count = triangles.len() / 3;
    let mut out = Vec::with_capacity(84 + 50 * count);
    out.extend_from_slice(&[0u8; 80]);
    out.extend_from_slice(&(count as u32).to_le_bytes());

    for triangle in triangles.chunks_exact(3) {
        let v: Vec<[f64; 3]> = triangle
            .iter()
            .map(|&index| {
                let base = index as usize * n_props;
                [props[base], props[base + 1], props[base + 2]]
            })
            .collect();
        let normal = face_normal(&v[0], &v[1], &v[2]);
        for component in normal {
            out.extend_from_slice(&(component as f32).to_le_bytes());
        }
        for point in &v {
            for component in *point {
                out.extend_from_slice(&(component as f32).to_le_bytes());
            }
        }
        out.extend_from_slice(&[0u8, 0]);
    }
    fs::write(path, &out).map_err(|error| error.to_string())
}

/// Writes a valid OPC ZIP 3MF archive from the manifold (`T-203`).
fn write_3mf(manifold: &Manifold, path: &str) -> Result<(), String> {
    use std::fmt::Write as _;
    let (props, n_props, triangles) = manifold.to_mesh_f64();
    let vert_count = props.len() / n_props;
    let mut xml = String::from(
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n\
         <model unit=\"millimeter\" xml:lang=\"en-US\" xmlns=\"http://schemas.microsoft.com/3dmanufacturing/core/2015/02\">\n\
         <resources><object id=\"1\" name=\"assembly\" type=\"model\"><mesh><vertices>\n",
    );
    for idx in 0..vert_count {
        let base = idx * n_props;
        let _ = writeln!(
            xml,
            "<vertex x=\"{:.6}\" y=\"{:.6}\" z=\"{:.6}\"/>",
            props[base],
            props[base + 1],
            props[base + 2]
        );
    }
    xml.push_str("</vertices><triangles>\n");
    for tri in triangles.chunks_exact(3) {
        let _ = writeln!(
            xml,
            "<triangle v1=\"{}\" v2=\"{}\" v3=\"{}\"/>",
            tri[0], tri[1], tri[2]
        );
    }
    xml.push_str("</triangles></mesh></object></resources><build><item objectid=\"1\"/></build></model>\n");

    const CONTENT_TYPES: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>
"#;
    const RELS: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>
"#;

    let zip_bytes = build_store_zip(&[
        ("[Content_Types].xml", CONTENT_TYPES),
        ("_rels/.rels", RELS),
        ("3D/3dmodel.model", xml.as_bytes()),
    ]);
    fs::write(path, &zip_bytes).map_err(|error| error.to_string())
}

fn crc32_ieee(data: &[u8]) -> u32 {
    let mut crc = 0xffff_ffff_u32;
    for &byte in data {
        crc ^= u32::from(byte);
        for _ in 0..8 {
            let mask = (crc & 1).wrapping_neg();
            crc = (crc >> 1) ^ (0xedb8_8320 & mask);
        }
    }
    !crc
}

fn build_store_zip(entries: &[(&str, &[u8])]) -> Vec<u8> {
    let mut out = Vec::new();
    let mut central = Vec::new();
    for &(name, data) in entries {
        let offset = out.len() as u32;
        let name_bytes = name.as_bytes();
        let crc = crc32_ieee(data);
        let size = data.len() as u32;
        out.extend_from_slice(&0x0403_4b50_u32.to_le_bytes());
        out.extend_from_slice(&20_u16.to_le_bytes());
        out.extend_from_slice(&0_u16.to_le_bytes());
        out.extend_from_slice(&0_u16.to_le_bytes());
        out.extend_from_slice(&0_u16.to_le_bytes());
        out.extend_from_slice(&0_u16.to_le_bytes());
        out.extend_from_slice(&crc.to_le_bytes());
        out.extend_from_slice(&size.to_le_bytes());
        out.extend_from_slice(&size.to_le_bytes());
        out.extend_from_slice(&(name_bytes.len() as u16).to_le_bytes());
        out.extend_from_slice(&0_u16.to_le_bytes());
        out.extend_from_slice(name_bytes);
        out.extend_from_slice(data);

        central.extend_from_slice(&0x0201_4b50_u32.to_le_bytes());
        central.extend_from_slice(&20_u16.to_le_bytes());
        central.extend_from_slice(&20_u16.to_le_bytes());
        central.extend_from_slice(&0_u16.to_le_bytes());
        central.extend_from_slice(&0_u16.to_le_bytes());
        central.extend_from_slice(&0_u16.to_le_bytes());
        central.extend_from_slice(&0_u16.to_le_bytes());
        central.extend_from_slice(&crc.to_le_bytes());
        central.extend_from_slice(&size.to_le_bytes());
        central.extend_from_slice(&size.to_le_bytes());
        central.extend_from_slice(&(name_bytes.len() as u16).to_le_bytes());
        central.extend_from_slice(&0_u16.to_le_bytes());
        central.extend_from_slice(&0_u16.to_le_bytes());
        central.extend_from_slice(&0_u16.to_le_bytes());
        central.extend_from_slice(&0_u16.to_le_bytes());
        central.extend_from_slice(&0_u32.to_le_bytes());
        central.extend_from_slice(&offset.to_le_bytes());
        central.extend_from_slice(name_bytes);
    }
    let cd_offset = out.len() as u32;
    let cd_size = central.len() as u32;
    out.extend_from_slice(&central);
    out.extend_from_slice(&0x0605_4b50_u32.to_le_bytes());
    out.extend_from_slice(&0_u16.to_le_bytes());
    out.extend_from_slice(&0_u16.to_le_bytes());
    out.extend_from_slice(&(entries.len() as u16).to_le_bytes());
    out.extend_from_slice(&(entries.len() as u16).to_le_bytes());
    out.extend_from_slice(&cd_size.to_le_bytes());
    out.extend_from_slice(&cd_offset.to_le_bytes());
    out.extend_from_slice(&0_u16.to_le_bytes());
    out
}

fn face_normal(a: &[f64; 3], b: &[f64; 3], c: &[f64; 3]) -> [f64; 3] {
    let (abx, aby, abz) = (b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    let (acx, acy, acz) = (c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    let (nx, ny, nz) = (aby * acz - abz * acy, abz * acx - abx * acz, abx * acy - aby * acx);
    let length = (nx * nx + ny * ny + nz * nz).sqrt();
    if length > 0.0 {
        [nx / length, ny / length, nz / length]
    } else {
        [0.0, 0.0, 0.0]
    }
}
