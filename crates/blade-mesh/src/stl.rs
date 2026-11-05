//! Binary STL serialisation.
//!
//! The writer is allocation-only and I/O-free: callers receive the STL bytes
//! and decide where to store them (server download, wasm file export). Units
//! are millimetres, matching the rest of the kernel; STL itself is unitless,
//! so slicers must be told the model is in mm.
//!
//! Layout: 80-byte header, little-endian `u32` triangle count, then 50 bytes
//! per triangle (`f32` normal, three `f32` vertices, `u16` attribute).

use blade_geom::Point3;

use crate::mesh::Mesh;

/// Bytes per binary STL triangle: 12 floats plus the attribute word.
const TRIANGLE_BYTES: usize = 50;
/// Fixed prefix: 80-byte header plus the `u32` count.
const HEADER_BYTES: usize = 84;

/// Serialises a mesh as a binary STL.
///
/// Triangles are written in buffer order. Normals are recomputed from the
/// winding; degenerate triangles get a zero normal, which slicers tolerate
/// (they re-derive normals from the vertices). Coordinates are clamped to the
/// finite `f32` range and non-finite values become `0.0`, so the output never
/// contains `NaN` or infinity even if the caller skipped [`crate::check_mesh`].
///
/// Run [`crate::check_mesh`] first: an open or non-manifold mesh still
/// serialises, but the slicer will reject it.
#[must_use]
pub fn write_stl(mesh: &Mesh) -> Vec<u8> {
    let triangle_count = mesh.triangles.len().min(u32::MAX as usize) as u32;
    let capacity = stl_len(mesh).min(64 * 1024 * 1024);
    let mut bytes = Vec::with_capacity(capacity);

    let mut header = [0u8; 80];
    let banner = b"BladeLab binary STL - units: mm";
    header[..banner.len()].copy_from_slice(banner);
    bytes.extend_from_slice(&header);
    bytes.extend_from_slice(&triangle_count.to_le_bytes());

    for index in 0..triangle_count as usize {
        let [a, b, c] = mesh.triangle_vertices(index).unwrap_or_else(zero_triangle);
        let normal = unit_normal(a, b, c);
        for value in [
            normal.x, normal.y, normal.z, a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z,
        ] {
            bytes.extend_from_slice(&to_f32(value).to_le_bytes());
        }
        bytes.extend_from_slice(&0_u16.to_le_bytes());
    }

    bytes
}

/// Counterpart of [`write_stl`] that reports the number of bytes it will write.
///
/// Useful for sizing a download before allocating the buffer. Saturates
/// instead of overflowing on 32-bit targets.
#[must_use]
pub fn stl_len(mesh: &Mesh) -> usize {
    HEADER_BYTES.saturating_add(TRIANGLE_BYTES.saturating_mul(mesh.triangles.len()))
}

fn zero_triangle() -> [Point3; 3] {
    let origin = Point3 {
        x: 0.0,
        y: 0.0,
        z: 0.0,
    };
    [origin, origin, origin]
}

fn unit_normal(a: Point3, b: Point3, c: Point3) -> Point3 {
    let u = subtract(b, a);
    let v = subtract(c, a);
    let cross = Point3 {
        x: u.y * v.z - u.z * v.y,
        y: u.z * v.x - u.x * v.z,
        z: u.x * v.y - u.y * v.x,
    };
    let length = (cross.x * cross.x + cross.y * cross.y + cross.z * cross.z).sqrt();
    if !length.is_finite() || length <= f64::EPSILON {
        return Point3 {
            x: 0.0,
            y: 0.0,
            z: 0.0,
        };
    }
    Point3 {
        x: cross.x / length,
        y: cross.y / length,
        z: cross.z / length,
    }
}

fn subtract(a: Point3, b: Point3) -> Point3 {
    Point3 {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z,
    }
}

/// Converts to `f32`, clamping to the finite range and mapping non-finite
/// values to zero.
fn to_f32(value: f64) -> f32 {
    if !value.is_finite() {
        return 0.0;
    }
    let limit = f32::MAX as f64;
    value.clamp(-limit, limit) as f32
}
