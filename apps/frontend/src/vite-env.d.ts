/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  // add more env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// CSS modules
declare module "*.css" {
  const content: any;
  export default content;
}

// Global test utilities
declare global {
  const vi: typeof import("vitest").vi;
}

export {};
