import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Business from "@/models/Business";
import { getCurrentUserId } from "@/lib/auth";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      await connectDB();
      const userId = await getCurrentUserId();
      if (!userId) {
         return NextResponse.json({ balances: [], total: 0 }, { status: 401 });
      }

      const [user, businesses] = await Promise.all([
         User.findById(userId).lean<any>(),
         Business.find({ userId }).lean<any[]>(),
      ]);

      const personalBalance = user?.wallet?.balance ?? 0;

      const balances = [
         {
            id: "personal",
            name: "Personal",
            avatar: "P",
            amount: personalBalance,
            href: "/wallet",
         },
         ...businesses.map((b) => ({
            id: String(b._id),
            name: b.name,
            avatar: b.initial ?? (b.name?.[0] ?? "?").toUpperCase(),
            amount: b.balance ?? 0,
            href: `/business`,
         })),
      ];

      const total = balances.reduce((s, b) => s + (b.amount ?? 0), 0);

      return NextResponse.json({ balances, total });
   } catch (err) {
      logError("GET /api/personal/balances", err);
      return NextResponse.json({ balances: [], total: 0 }, { status: 500 });
   }
}
