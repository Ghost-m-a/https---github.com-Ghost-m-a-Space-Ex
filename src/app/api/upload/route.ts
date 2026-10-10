import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED = [
   "image/jpeg",
   "image/png",
   "image/webp",
   "image/gif",
   "video/mp4",
   "video/webm",
];

export async function POST(req: Request) {
   try {
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
         return NextResponse.json({ error: "No file" }, { status: 400 });
      }

      if (file.size > MAX_SIZE) {
         return NextResponse.json(
            { error: "File exceeds 10 MB" },
            { status: 400 },
         );
      }

      if (!ALLOWED.includes(file.type)) {
         return NextResponse.json(
            { error: `Unsupported type: ${file.type}` },
            { status: 400 },
         );
      }

      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const key = `campaigns/${userId}/${Date.now()}-${safeName}`;

      const blob = await put(key, file, {
         access: "public",
         contentType: file.type,
         addRandomSuffix: false,
      });

      return NextResponse.json({
         url: blob.url,
         type: file.type.startsWith("video") ? "video" : "image",
         name: file.name,
         size: file.size,
      });
   } catch (err) {
      console.error("[POST /api/upload]", err);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
   }
}
