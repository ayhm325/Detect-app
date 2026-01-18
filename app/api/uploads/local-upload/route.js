import fs from "fs";
import path from "path";

export async function PUT(req) {
  try {
    const url = new URL(req.url);
    const rel = url.searchParams.get("path");
    if (!rel)
      return new Response(JSON.stringify({ error: "missing path" }), {
        status: 400,
      });

    // normalize to avoid directory traversal
    const safeRel = path.normalize(rel).replace(/^([\.\/\\])+/, "");
    const abs = path.join(process.cwd(), "public", safeRel);
    await fs.promises.mkdir(path.dirname(abs), { recursive: true });
    const data = await req.arrayBuffer();
    await fs.promises.writeFile(abs, Buffer.from(data));
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
