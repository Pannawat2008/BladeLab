# T-009 spike: Manifold boolean in a container

Builds a minimal Docker image containing the [Manifold](https://manifoldcad.org/)
kernel (via the `manifold3d` Rust bindings) and `manifold-union`, a runner that
loads a binary STL, builds the hub as a hollow cylinder, and boolean-unions the
two into one watertight mesh.

Scope notes (D-geom1-008): this is a verification spike; the production API
living inside `blade-server` is T-203. Booleans are used on the server only
(D-lead1-005) and are intentionally absent from every wasm/STEP path.

## Build & run

```powershell
# from the repo root
.\deploy\manifold\run-demo.ps1
```

or by hand:

```powershell
docker build -t bladelab/manifold:spike deploy\manifold
docker run --rm -v "${PWD}\target:/work" bladelab/manifold:spike `
    /work/naca4412.blade.stl /work/union.blade+hub.stl
```

`manifold-union <input.stl> <output.stl>`:

1. runs a deterministic boolean self-check (contained union = 8000 mm³,
   subtract = 7000 mm³, overlapping union = 10 000 mm³) — proves the engine
   actually merges and removes overlap;
2. loads the blade STL (welded on exact f32 bits),
3. builds the hub (`Manifold::cylinder(50, 60, 60, 64)` minus a
   `cylinder(50, 6, 6, 64)` bore — 120 mm OD, 12 mm bore, 50 mm long),
4. writes `blade.union(hub)` to the output STL and prints volumes.

Expected (fixture blade + hub are disjoint, they share a 10 mm axial gap):
union volume ≈ 126 493.7 + 559 831.8 = **686 325.5 mm³**, genus 0, status 0.

Inspect the output, e.g. slice it in a slicer or open the generated
`target/union.blade+hub.stl`.
