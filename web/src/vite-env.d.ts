/// <reference types="vite/client" />

declare module "*blade_wasm.js" {
  export interface MeshData {
    readonly positions: Float32Array;
    readonly indices: Uint32Array;
    readonly vertex_count: number;
    readonly triangle_count: number;
    readonly volume_mm3: number;
    readonly span_min_mm: number;
    readonly span_max_mm: number;
    readonly tube_axis: Float64Array;
    free(): void;
  }

  export function build_mesh(design_json: string, overrides_json: string): MeshData;
  export function simulate_aero(design_json: string, options_json: string): string;
  export function export_stl_bytes(design_json: string): Uint8Array;
  export function export_fabricated_stl_bytes(design_json: string, overrides_json: string): Uint8Array;
  export function export_3mf_bytes(design_json: string): Uint8Array;
  export function export_fabricated_3mf_bytes(design_json: string, overrides_json: string): Uint8Array;
  export function fabrication_report(design_json: string, overrides_json: string): string;
  export function optimize_blade_wasm(design_json: string, config_json: string): string;
  export default function init(module_or_path?: string | URL | Request | Response | BufferSource | WebAssembly.Module): Promise<unknown>;
}
