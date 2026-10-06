import type { Types } from "mongoose";

export type ObjectIdLike = Types.ObjectId | string;

export function toIdString(id: ObjectIdLike): string {
   return typeof id === "string" ? id : id.toString();
}

export function slugify(text: string, maxLen = 60): string {
   return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, maxLen);
}
