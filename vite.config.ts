// Settings for Vite, the tool that runs the local development server.
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    // Port 5173 (Vite's default) is used by another project on this
    // computer, so this game always runs at http://localhost:5180.
    port: 5180,
    // Stop with a clear error instead of quietly picking another port.
    strictPort: true,
  },
});
