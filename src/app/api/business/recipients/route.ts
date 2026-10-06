import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/lib/models/User";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
   try {
      const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
      if (!token) return NextResponse.json({ users: [] });
      const session = await verifySessionToken(token);
      if (!session) return NextResponse.json({ users: [] });

      const url = new URL(req.url);
      const q = url.searchParams.get("q") || "";

      await connectDB();

      const query: any = { _id: { $ne: session.userId } };

      if (q) {
         query.$or = [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
            { username: { $regex: q, $options: "i" } },
         ];
      }

      const users = await User.find(query)
         .limit(10)
         .select("name email username")
         .lean();

      return NextResponse.json({
         users: users.map((u) => ({
            id: u._id.toString(),
            name: u.name,
            email: u.email,
            username: u.username || "",
            avatar: u.name.charAt(0).toUpperCase(),
         })),
      });
   } catch (err) {
      console.error("[Recipients]", err);
      return NextResponse.json({ users: [] });
   }
}
