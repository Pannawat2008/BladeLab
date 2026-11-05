//! Chordwise point distributions.
//!
//! The cosine distribution clusters samples near both the leading and the
//! trailing edge, which keeps the finite trailing edge of a 4-digit NACA
//! profile well resolved and avoids the sharp-pressure spike artefacts of a
//! uniform distribution.

use std::f64::consts::PI;

use crate::error::GeomError;

/// Smallest sample count accepted by [`cosine_spacing`].
///
/// Two samples are enough to describe a straight chord line (`0` and `1`).
pub const MIN_SAMPLES: usize = 2;

/// Returns `n` cosine-spaced chordwise stations over `[0, 1]`.
///
/// Station `0` is exactly `0.0` (leading edge) and station `n - 1` is exactly
/// `1.0` (trailing edge). The result is strictly increasing.
///
/// # Errors
///
/// Returns [`GeomError::TooFewSamples`] when `n < 2`.
///
/// # Examples
///
/// ```
/// # use blade_geom::cosine_spacing;
/// let stations = cosine_spacing(5).unwrap();
/// assert_eq!(stations[0], 0.0);
/// assert_eq!(stations[4], 1.0);
/// ```
pub fn cosine_spacing(n: usize) -> Result<Vec<f64>, GeomError> {
    if n < MIN_SAMPLES {
        return Err(GeomError::TooFewSamples {
            min: MIN_SAMPLES,
            got: n,
        });
    }

    let last = (n - 1) as f64;
    let mut stations: Vec<f64> = (0..n)
        .map(|i| 0.5 * (1.0 - (PI * i as f64 / last).cos()))
        .collect();

    // `cos` returns 1.0 and -1.0 exactly for these endpoints, but pin them so
    // downstream code can rely on bit-exact bounds.
    stations[0] = 0.0;
    stations[n - 1] = 1.0;

    for (index, pair) in stations.windows(2).enumerate() {
        if pair[1].partial_cmp(&pair[0]) != Some(std::cmp::Ordering::Greater) {
            return Err(GeomError::SpacingNotMonotonic { index });
        }
    }

    Ok(stations)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn endpoints_are_exact() {
        let stations = cosine_spacing(33).expect("valid sample count");
        assert_eq!(stations.first().copied(), Some(0.0));
        assert_eq!(stations.last().copied(), Some(1.0));
    }

    #[test]
    fn stations_are_strictly_increasing_and_bounded() {
        for n in [2_usize, 3, 5, 17, 65, 257] {
            let stations = cosine_spacing(n).expect("valid sample count");
            assert_eq!(stations.len(), n);
            for pair in stations.windows(2) {
                assert!(pair[1] > pair[0], "not increasing for n = {n}");
            }
            for &x in &stations {
                assert!((0.0..=1.0).contains(&x));
            }
        }
    }

    #[test]
    fn samples_cluster_at_both_edges() {
        let stations = cosine_spacing(21).expect("valid sample count");
        let leading_gap = stations[1] - stations[0];
        let trailing_gap = stations[20] - stations[19];
        let middle_gap = stations[11] - stations[10];
        assert!(leading_gap < middle_gap);
        assert!(trailing_gap < middle_gap);
    }

    #[test]
    fn rejects_too_few_samples() {
        for n in 0..MIN_SAMPLES {
            assert!(matches!(
                cosine_spacing(n),
                Err(GeomError::TooFewSamples { .. })
            ));
        }
    }
}
