import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.TST_SITE_BASE || "/T-Spin-Traveler/",
  plugins: [react()],
});
