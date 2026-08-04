/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the girija API, e.g. http://localhost:4000/api */
  readonly VITE_API_URL?: string;
  /** Optional password for the offline demo editor. Unset = offline login disabled. */
  readonly VITE_ADMIN_DEMO_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
