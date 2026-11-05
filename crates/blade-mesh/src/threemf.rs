//! 3MF (3D Manufacturing Format) package serialisation.
//!
//! A `.3mf` file is an Open Packaging Conventions (OPC) ZIP archive containing:
//! - `[Content_Types].xml`
//! - `_rels/.rels`
//! - `3D/3dmodel.model` (UTF-8 XML in `millimeter` units)
//!
//! This module implements a self-contained, zero-dependency ZIP (`STORE`,
//! method `0`) + 3MF Core v1.2/1.3 writer so `blade-mesh` remains 100% pure
//! Rust, I/O-free and `wasm32-unknown-unknown`-compatible (`plan.md` §6.1).

use std::fmt::Write as _;

use crate::mesh::Mesh;

const CONTENT_TYPES_XML: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/>
</Types>
"#;

const RELS_XML: &[u8] = br#"<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/>
</Relationships>
"#;

/// Serialises a [`Mesh`] into a complete `.3mf` archive in `millimeter` units.
///
/// Like [`crate::write_stl`], this function is infallible and I/O-free: non-finite
/// vertex coordinates are sanitised to `0.0` and out-of-range triangle indices
/// are skipped. Call [`crate::check_mesh`] beforehand to verify that the mesh is
/// a watertight solid with positive volume.
#[must_use]
pub fn write_3mf(mesh: &Mesh) -> Vec<u8> {
    let model_xml = build_model_xml(mesh);
    let entries = [
        ("[Content_Types].xml", CONTENT_TYPES_XML),
        ("_rels/.rels", RELS_XML),
        ("3D/3dmodel.model", model_xml.as_bytes()),
    ];
    build_store_zip(&entries)
}

fn build_model_xml(mesh: &Mesh) -> String {
    let mut xml = String::with_capacity(
        512 + mesh.vertices.len().saturating_mul(64) + mesh.triangles.len().saturating_mul(48),
    );
    xml.push_str(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<model unit="millimeter" xml:lang="en-US" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">
  <metadata name="Application">BladeLab</metadata>
  <resources>
    <object id="1" name="blade" type="model">
      <mesh>
        <vertices>
"#,
    );

    for vertex in &mesh.vertices {
        let x = sanitize_coord(vertex.x);
        let y = sanitize_coord(vertex.y);
        let z = sanitize_coord(vertex.z);
        let _ = writeln!(
            xml,
            "          <vertex x=\"{x:.6}\" y=\"{y:.6}\" z=\"{z:.6}\"/>"
        );
    }

    xml.push_str(
        r#"        </vertices>
        <triangles>
"#,
    );

    let vertex_count = mesh.vertices.len();
    for triangle in &mesh.triangles {
        let (a, b, c) = (
            triangle.a as usize,
            triangle.b as usize,
            triangle.c as usize,
        );
        if a < vertex_count && b < vertex_count && c < vertex_count {
            let _ = writeln!(
                xml,
                "          <triangle v1=\"{}\" v2=\"{}\" v3=\"{}\"/>",
                triangle.a, triangle.b, triangle.c
            );
        }
    }

    xml.push_str(
        r#"        </triangles>
      </mesh>
    </object>
  </resources>
  <build>
    <item objectid="1"/>
  </build>
</model>
"#,
    );

    xml
}

fn sanitize_coord(value: f64) -> f64 {
    if !value.is_finite() {
        return 0.0;
    }
    let limit = f64::from(f32::MAX);
    value.clamp(-limit, limit)
}

struct ZipCentralRecord<'a> {
    name: &'a [u8],
    crc32: u32,
    size: u32,
    local_header_offset: u32,
}

fn build_store_zip(entries: &[(&str, &[u8])]) -> Vec<u8> {
    let mut out = Vec::new();
    let mut central = Vec::with_capacity(entries.len());

    for &(name_str, data) in entries {
        let name = name_str.as_bytes();
        let crc = crc32_ieee(data);
        let size = u32::try_from(data.len()).unwrap_or(u32::MAX);
        let name_len = u16::try_from(name.len()).unwrap_or(u16::MAX);
        let local_header_offset = u32::try_from(out.len()).unwrap_or(u32::MAX);

        // Local file header (PK\x03\x04)
        out.extend_from_slice(&0x0403_4b50_u32.to_le_bytes());
        out.extend_from_slice(&20_u16.to_le_bytes()); // version needed (2.0)
        out.extend_from_slice(&0_u16.to_le_bytes()); // general purpose bit flag
        out.extend_from_slice(&0_u16.to_le_bytes()); // compression method: 0 (STORE)
        out.extend_from_slice(&0_u16.to_le_bytes()); // last mod time
        out.extend_from_slice(&0_u16.to_le_bytes()); // last mod date
        out.extend_from_slice(&crc.to_le_bytes());
        out.extend_from_slice(&size.to_le_bytes()); // compressed size
        out.extend_from_slice(&size.to_le_bytes()); // uncompressed size
        out.extend_from_slice(&name_len.to_le_bytes());
        out.extend_from_slice(&0_u16.to_le_bytes()); // extra field length
        out.extend_from_slice(name);
        out.extend_from_slice(data);

        central.push(ZipCentralRecord {
            name,
            crc32: crc,
            size,
            local_header_offset,
        });
    }

    let central_dir_offset = u32::try_from(out.len()).unwrap_or(u32::MAX);
    for record in &central {
        let name_len = u16::try_from(record.name.len()).unwrap_or(u16::MAX);
        // Central directory file header (PK\x01\x02)
        out.extend_from_slice(&0x0201_4b50_u32.to_le_bytes());
        out.extend_from_slice(&20_u16.to_le_bytes()); // version made by
        out.extend_from_slice(&20_u16.to_le_bytes()); // version needed
        out.extend_from_slice(&0_u16.to_le_bytes()); // general purpose bit flag
        out.extend_from_slice(&0_u16.to_le_bytes()); // compression method: 0 (STORE)
        out.extend_from_slice(&0_u16.to_le_bytes()); // last mod time
        out.extend_from_slice(&0_u16.to_le_bytes()); // last mod date
        out.extend_from_slice(&record.crc32.to_le_bytes());
        out.extend_from_slice(&record.size.to_le_bytes());
        out.extend_from_slice(&record.size.to_le_bytes());
        out.extend_from_slice(&name_len.to_le_bytes());
        out.extend_from_slice(&0_u16.to_le_bytes()); // extra field length
        out.extend_from_slice(&0_u16.to_le_bytes()); // file comment length
        out.extend_from_slice(&0_u16.to_le_bytes()); // disk number start
        out.extend_from_slice(&0_u16.to_le_bytes()); // internal file attributes
        out.extend_from_slice(&0_u32.to_le_bytes()); // external file attributes
        out.extend_from_slice(&record.local_header_offset.to_le_bytes());
        out.extend_from_slice(record.name);
    }

    let central_dir_size = u32::try_from(out.len())
        .unwrap_or(u32::MAX)
        .saturating_sub(central_dir_offset);
    let entry_count = u16::try_from(central.len()).unwrap_or(u16::MAX);

    // End of central directory record (PK\x05\x06)
    out.extend_from_slice(&0x0605_4b50_u32.to_le_bytes());
    out.extend_from_slice(&0_u16.to_le_bytes()); // number of this disk
    out.extend_from_slice(&0_u16.to_le_bytes()); // disk with start of central directory
    out.extend_from_slice(&entry_count.to_le_bytes());
    out.extend_from_slice(&entry_count.to_le_bytes());
    out.extend_from_slice(&central_dir_size.to_le_bytes());
    out.extend_from_slice(&central_dir_offset.to_le_bytes());
    out.extend_from_slice(&0_u16.to_le_bytes()); // comment length

    out
}

fn crc32_ieee(bytes: &[u8]) -> u32 {
    let mut crc = 0xffff_ffff_u32;
    for &byte in bytes {
        crc ^= u32::from(byte);
        for _ in 0..8 {
            let mask = (crc & 1).wrapping_neg();
            crc = (crc >> 1) ^ (0xedb8_8320 & mask);
        }
    }
    !crc
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::mesh::Triangle;
    use blade_geom::Point3;

    #[test]
    fn crc32_matches_standard_check_value() {
        // IEEE 802.3 standard check value for "123456789" is 0xCBF43926.
        assert_eq!(crc32_ieee(b"123456789"), 0xcbf4_3926);
    }

    #[test]
    fn writes_valid_3mf_zip_container_with_millimeter_model() {
        let mesh = Mesh {
            vertices: vec![
                Point3 {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0,
                },
                Point3 {
                    x: 10.0,
                    y: 0.0,
                    z: 0.0,
                },
                Point3 {
                    x: 0.0,
                    y: 10.0,
                    z: 0.0,
                },
                Point3 {
                    x: 0.0,
                    y: 0.0,
                    z: 10.0,
                },
            ],
            triangles: vec![
                Triangle::new(0, 2, 1),
                Triangle::new(0, 1, 3),
                Triangle::new(1, 2, 3),
                Triangle::new(2, 0, 3),
            ],
        };

        let archive = write_3mf(&mesh);
        // Starts with ZIP local header signature PK\x03\x04 and ends with EOCD.
        assert_eq!(&archive[..4], b"PK\x03\x04");
        let text = String::from_utf8_lossy(&archive);
        assert!(text.contains("[Content_Types].xml"));
        assert!(text.contains("_rels/.rels"));
        assert!(text.contains("3D/3dmodel.model"));
        assert!(text.contains("<model unit=\"millimeter\""));
        assert!(text.contains("<vertex x=\"10.000000\" y=\"0.000000\" z=\"0.000000\"/>"));
        assert!(text.contains("<triangle v1=\"0\" v2=\"2\" v3=\"1\"/>"));
    }
}
