import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Ensure this is imported

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      // Allow importing ABI JSONs directly from ../out
      allow: [".."],
    },
  },
});
