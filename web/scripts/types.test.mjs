import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const typesPath = path.resolve(__dirname, "../src/types/blade-model.ts");

test("generated blade-model.ts exists and exports all schema types", () => {
  const source = fs.readFileSync(typesPath, "utf8");
  for (const name of [
    "SCHEMA_VERSION = 1",
    "export type Design =",
    "export type Rotor =",
    "export type Distributions =",
    "export type CurveSource =",
    "export type AirfoilStation =",
    "export type AirfoilSpec =",
    "export type StationOverride =",
    "export type Hub =",
    "export type Manufacturing =",
    "export type ValidationIssue =",
  ]) {
    assert.ok(source.includes(name), `missing ${name} in blade-model.ts`);
  }
});
