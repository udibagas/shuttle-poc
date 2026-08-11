import { serve } from "bun";
import { resolve } from "path";

const PORT = process.env.PORT || 3000;
const distPath = resolve(import.meta.dir, "dist");

console.log(`Serving static files from: ${distPath}`);
console.log(`Server starting on port: ${PORT}`);

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let filePath = url.pathname;

    // Serve index.html for root path
    if (filePath === "/" || filePath === "") {
      filePath = "/index.html";
    }

    // Try to serve the requested file
    const file = Bun.file(resolve(distPath, filePath.slice(1)));

    if (await file.exists()) {
      return new Response(file);
    }

    // For SPA routing - serve index.html for non-file paths
    if (!filePath.includes(".")) {
      const indexFile = Bun.file(resolve(distPath, "index.html"));
      return new Response(indexFile);
    }

    // 404 for missing assets
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
