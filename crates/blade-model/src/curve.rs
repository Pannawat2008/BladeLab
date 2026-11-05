//! Layer-2 Bézier and `evalexpr` formula evaluation (`T-201`).
//!
//! Both evaluators are pure, deterministic, and total: malformed formulas,
//! unknown variables, division by zero, and `NaN`/`±∞` outputs return
//! human-readable `Err(String)` descriptions and never panic.

use evalexpr::{
    ContextWithMutableFunctions, ContextWithMutableVariables, EvalexprError, Function,
    HashMapContext, Value,
};

use crate::schema::{BezierControlPoint, Rotor};

/// Evaluates a 2D Bézier curve defined by `points` at blade-normalised span
/// position `s ∈ [0, 1]`.
///
/// When the control points have monotonically non-decreasing `x` coordinates
/// spanning `[0, 1]`, this solves `x(t) = s` via 48 iterations of bisection
/// and returns `y(t)`.
#[must_use]
pub fn eval_bezier(points: &[BezierControlPoint], s: f64) -> f64 {
    if points.is_empty() {
        return 0.0;
    }
    if points.len() == 1 {
        return points[0].y;
    }
    let clamped_s = s.clamp(0.0, 1.0);
    if clamped_s <= 0.0 {
        return points[0].y;
    }
    if clamped_s >= 1.0 {
        return points[points.len() - 1].y;
    }

    // Solve x(t) = clamped_s on t ∈ [0, 1] by bisection.
    let mut lo = 0.0_f64;
    let mut hi = 1.0_f64;
    for _ in 0..48 {
        let mid = 0.5 * (lo + hi);
        let x_mid = de_casteljau_x(points, mid);
        if x_mid < clamped_s {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    let t = 0.5 * (lo + hi);
    de_casteljau_y(points, t)
}

fn de_casteljau_x(points: &[BezierControlPoint], t: f64) -> f64 {
    let mut work: Vec<f64> = points.iter().map(|p| p.x).collect();
    let n = work.len();
    for k in 1..n {
        for i in 0..(n - k) {
            work[i] = (1.0 - t) * work[i] + t * work[i + 1];
        }
    }
    work[0]
}

fn de_casteljau_y(points: &[BezierControlPoint], t: f64) -> f64 {
    let mut work: Vec<f64> = points.iter().map(|p| p.y).collect();
    let n = work.len();
    for k in 1..n {
        for i in 0..(n - k) {
            work[i] = (1.0 - t) * work[i] + t * work[i + 1];
        }
    }
    work[0]
}

/// Evaluates a Layer-2 formula string (`evalexpr`) at radial `span_ratio = r / R`
/// and blade-normalised span `s ∈ [0, 1]`.
///
/// Bound variables:
/// - `x`: radial station ratio `r / R` (`T-201` primary variable)
/// - `s`: blade-normalised span `(r - r_hub) / (R - r_hub) ∈ [0, 1]`
/// - `r`: radial position in mm (`x * R`)
/// - `R`: tip radius in mm (`rotor.radius_mm`)
/// - `r_hub`: hub radius in mm (`rotor.hub_radius_mm`)
/// - `B`: blade count (`rotor.blade_count`)
/// - `tsr`: design tip-speed ratio (`rotor.design_tsr`)
/// - `pi`: `π`
///
/// Built-in convenience functions (in addition to `evalexpr`'s `math::*`):
/// `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`, `sqrt`, `abs`, `exp`,
/// `ln`, `pow`, `deg`, `rad`.
///
/// # Errors
///
/// Returns a friendly human-readable error message when `expr` is empty, fails
/// to parse, references unknown variables/functions, divides by zero, or
/// evaluates to a non-finite number (`NaN` or `±∞`).
pub fn eval_formula(expr: &str, rotor: &Rotor, span_ratio: f64, s: f64) -> Result<f64, String> {
    let trimmed = expr.trim();
    if trimmed.is_empty() {
        return Err("formula expression must not be empty".to_string());
    }

    let mut ctx = build_formula_context(rotor, span_ratio, s)?;
    let value = evalexpr::eval_with_context_mut(trimmed, &mut ctx)
        .map_err(|err| format!("invalid formula `{trimmed}`: {err}"))?;

    let number = match value {
        Value::Float(f) => f,
        Value::Int(i) => i as f64,
        other => {
            return Err(format!(
                "formula `{trimmed}` must evaluate to a number, got {other:?}"
            ))
        }
    };

    if !number.is_finite() {
        return Err(format!(
            "formula `{trimmed}` evaluated to a non-finite number ({number}) at x = {span_ratio:.4}"
        ));
    }

    Ok(number)
}

fn as_f64(val: &Value) -> Result<f64, EvalexprError> {
    match val {
        Value::Float(f) => Ok(*f),
        Value::Int(i) => Ok(*i as f64),
        other => Err(EvalexprError::expected_number(other.clone())),
    }
}

fn unary_math(f: fn(f64) -> f64) -> Function {
    Function::new(move |arg| {
        let x = as_f64(arg)?;
        Ok(Value::Float(f(x)))
    })
}

fn binary_math(f: fn(f64, f64) -> f64) -> Function {
    Function::new(move |arg| {
        let tuple = arg.as_fixed_len_tuple(2)?;
        let a = as_f64(&tuple[0])?;
        let b = as_f64(&tuple[1])?;
        Ok(Value::Float(f(a, b)))
    })
}

type UnaryMathFn = fn(f64) -> f64;
type BinaryMathFn = fn(f64, f64) -> f64;

fn build_formula_context(rotor: &Rotor, span_ratio: f64, s: f64) -> Result<HashMapContext, String> {
    let mut ctx = HashMapContext::new();
    let vars = [
        ("x", span_ratio),
        ("s", s),
        ("r", span_ratio * rotor.radius_mm),
        ("R", rotor.radius_mm),
        ("r_hub", rotor.hub_radius_mm),
        ("B", f64::from(rotor.blade_count)),
        ("tsr", rotor.design_tsr),
        ("pi", std::f64::consts::PI),
    ];
    for (name, val) in vars {
        ctx.set_value(name.to_string(), Value::Float(val))
            .map_err(|err| format!("failed to bind variable `{name}`: {err}"))?;
    }

    let unary_fns: [(&str, UnaryMathFn); 12] = [
        ("sin", f64::sin),
        ("cos", f64::cos),
        ("tan", f64::tan),
        ("asin", f64::asin),
        ("acos", f64::acos),
        ("atan", f64::atan),
        ("sqrt", f64::sqrt),
        ("abs", f64::abs),
        ("exp", f64::exp),
        ("ln", f64::ln),
        ("deg", f64::to_degrees),
        ("rad", f64::to_radians),
    ];
    for (name, func) in unary_fns {
        ctx.set_function(name.to_string(), unary_math(func))
            .map_err(|err| format!("failed to register function `{name}`: {err}"))?;
    }

    let binary_fns: [(&str, BinaryMathFn); 2] = [("atan2", f64::atan2), ("pow", f64::powf)];
    for (name, func) in binary_fns {
        ctx.set_function(name.to_string(), binary_math(func))
            .map_err(|err| format!("failed to register function `{name}`: {err}"))?;
    }

    Ok(ctx)
}
