#!/usr/bin/env python3
"""Headless STEP solid validation for BladeLab, powered by FreeCAD's OCCT kernel.

Run it with the Python interpreter that ships with FreeCAD so that the
`FreeCAD` / `Import` / `Part` modules are importable:

    <FreeCAD>\\bin\\python.exe tests\\step_check.py <step-file> [flags]

Flags (path may also come from BLADELAB_STEP):

    --solids N     require exactly N solids in the shape
    --z-min Z      lower bound (mm) on the shape bounding-box Z min
    --z-max Z      upper bound (mm) on the shape bounding-box Z max

Because FreeCADCmd reorders/inspects command-line arguments oddly (its own exe
lands on argv[0], and `--pass` is needed to forward values), the checker skips
the script/FreeCAD binary tokens and the `--pass` barrier, so either runner
works. A one-line PASS/FAIL record is appended to the file named by
BLADELAB_RESULT_FILE (default step_check_result.txt) so logs survive even when
FreeCAD's own console banner is noisy.

Exit code is 0 (PASS) only when the file imports as at least one valid,
closed solid (and passes any requested bounds); every failure exits 1 so a CI
job can treat the export as broken. See plan.md F-geom1-011 / L-geom1-008.
"""

import os
import sys
import traceback

import FreeCAD
import Import
import Part


def report(message, tag):
    line = "%s %s" % (tag, message)
    print(line)
    result_path = os.environ.get("BLADELAB_RESULT_FILE", "step_check_result.txt")
    try:
        with open(result_path, "a", encoding="utf-8") as result:
            result.write(line + os.linesep)
    except OSError:
        pass


def die(message):
    report(message, "FAIL")
    sys.exit(1)


def main(argv):
    # FreeCADCmd prepends its own executable at argv[0] and keeps the script at
    # argv[1] (unlike plain python), so never treat the script or the FreeCAD
    # binary as the STEP file, and skip the `--pass` barrier token.
    ignore = {
        os.path.abspath(a)
        for a in sys.argv
        if os.path.isfile(a)
        and (
            a.lower().endswith(".py")
            or "freecadcmd" in a.lower()
            or "freecad.exe" in a.lower()
        )
    }

    path = None
    flags = []
    for token in argv:
        if path is None and not token.startswith("-") and token != "--pass":
            if os.path.isfile(token) and os.path.abspath(token) not in ignore:
                path = token
                continue
        flags.append(token)
    if path is None:
        path = os.environ.get("BLADELAB_STEP")

    expect_solids = os.environ.get("BLADELAB_EXPECT_SOLIDS")
    z_min = os.environ.get("BLADELAB_Z_MIN")
    z_max = os.environ.get("BLADELAB_Z_MAX")

    while flags:
        flag = flags.pop(0)
        if flag == "--solids":
            expect_solids = flags.pop(0)
        elif flag == "--z-min":
            z_min = flags.pop(0)
        elif flag == "--z-max":
            z_max = flags.pop(0)
        else:
            die("unknown flag %r" % flag)

    if not path:
        die("no STEP path given (pass an existing file or set BLADELAB_STEP)")
    if not os.path.isfile(path):
        die("no such file: %s" % path)
    expect_solids = int(expect_solids) if expect_solids else None
    z_min = float(z_min) if z_min else None
    z_max = float(z_max) if z_max else None

    doc = FreeCAD.newDocument("step_check")
    try:
        Import.insert(path, doc.Name)
    except Exception as exc:  # noqa: BLE001 - report and fail
        die("STEP import failed: %r\n%s" % (exc, traceback.format_exc()))

    shape = None
    for obj in doc.Objects:
        if hasattr(obj, "Shape") and obj.Shape is not None:
            shape = obj.Shape
            break
    if shape is None:
        die("no shape recovered from %s" % path)

    if not shape.isValid():
        die("shape is not valid")

    solids = shape.Solids
    if len(solids) < 1:
        die("no solid found (only shells/wires)")
    if expect_solids is not None and len(solids) != expect_solids:
        die("expected %d solids, got %d" % (expect_solids, len(solids)))

    for index, solid in enumerate(solids):
        if not solid.isValid():
            die("solid %d is not valid" % index)
        if not solid.isClosed():
            die("solid %d is not closed" % index)

    bb = shape.BoundBox
    if z_min is not None and bb.ZMin < z_min:
        die("bounding box ZMin %.3f < %.3f mm (units or span off)" % (bb.ZMin, z_min))
    if z_max is not None and bb.ZMax > z_max:
        die("bounding box ZMax %.3f > %.3f mm (units or span off)" % (bb.ZMax, z_max))

    volume = sum(s.Volume for s in solids)
    report(
        "step=%s valid=%s solids=%d volume=%.1f mm^3 bbox=%.3fx%.3fx%.3f mm"
        % (
            os.path.basename(path),
            shape.isValid(),
            len(solids),
            volume,
            bb.XLength,
            bb.YLength,
            bb.ZLength,
        ),
        "PASS",
    )
    sys.exit(0)


if __name__ == "__main__":
    main(sys.argv[1:])
