//! `bladelab` command-line entry point.

use std::process::ExitCode;

fn main() -> ExitCode {
    let args = match blade_cli::parse_args(std::env::args().skip(1)) {
        Ok(args) => args,
        Err(err) => {
            eprintln!("error: {err}");
            return ExitCode::FAILURE;
        }
    };

    match blade_cli::run_export(&args) {
        Ok(path) => {
            println!("exported {:?} to {}", args.format, path.display());
            ExitCode::SUCCESS
        }
        Err(err) => {
            eprintln!("error: {err}");
            ExitCode::FAILURE
        }
    }
}
