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
    free(): void;
  }

  export function build_mesh(design_json: string, overrides_json: string): MeshData;
  export default function init(module_or_path?: string | URL | Request | Response | BufferSource | WebAssembly.Module): Promise<unknown>;
}
