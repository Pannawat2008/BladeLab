# Powershell demo for T-009: build the Manifold boolean image and union the
# fixture blade with the hub inside a container. Output lands in target/.
$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$blade = Join-Path $root 'target\naca4412.blade.stl'

if (-not (Test-Path $blade)) {
    Push-Location $root
    cargo run -p blade-mesh --example export_stl
    Pop-Location
}

docker build -t bladelab/manifold:spike $PSScriptRoot
if ($LASTEXITCODE -ne 0) { exit 1 }

docker run --rm -v "${root}\target:/work" bladelab/manifold:spike /work/naca4412.blade.stl /work/union.blade+hub.stl
exit $LASTEXITCODE
