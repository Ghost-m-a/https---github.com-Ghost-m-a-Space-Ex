import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import Business from "@/app/lib/models/Business";
import TeamMember from "@/app/lib/models/TeamMember";
import User from "@/app/lib/models/User";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/app/lib/auth";

async function requireUser(req: NextRequest) {
   const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
   if (!token) return null;
   return await verifySessionToken(token);
}

export async function GET(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session) return NextResponse.json({ members: [] });

      const url = new URL(req.url);
      const businessId = url.searchParams.get("businessId");

      await connectDB();
      let business;
      if (businessId)
         business = await Business.findOne({
            _id: businessId,
            userId: session.userId,
         }).lean();
      else
         business = await Business.findOne({ userId: session.userId })
            .sort({ createdAt: 1 })
            .lean();
      if (!business) return NextResponse.json({ members: [] });

      let members = await TeamMember.find({ businessId: business._id })
         .sort({ addedAt: 1 })
         .lean();

      // Auto-create owner as team member if empty
      if (members.length === 0) {
         const owner = await User.findById(session.userId).lean();
         if (owner) {
            await TeamMember.create({
               businessId: business._id,
               userId: owner._id,
               name: owner.name,
               email: owner.email,
               avatar: owner.name.charAt(0).toUpperCase(),
               role: "owner",
               auth: "one-step",
               pay: "pay",
               status: "active",
            });
            members = await TeamMember.find({ businessId: business._id })
               .sort({ addedAt: 1 })
               .lean();
         }
      }

      return NextResponse.json({
         members: members.map((m) => ({
            id: m._id.toString(),
            name: m.name,
            email: m.email,
            avatar: m.avatar,
            role: m.role,
            auth: m.auth,
            pay: m.pay,
            status: m.status,
            addedAt: m.addedAt,
         })),
      });
   } catch {
      return NextResponse.json({ members: [] });
   }
}

export async function POST(req: NextRequest) {
   try {
      const session = await requireUser(req);
      if (!session)
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      const { businessId, email, role } = await req.json();
      if (!businessId || !email)
         return NextResponse.json({ error: "Missing fields" }, { status: 400 });

      await connectDB();
      const business = await Business.findOne({
         _id: businessId,
         userId: session.userId,
      });
      if (!business)
         return NextResponse.json(
            { error: "Business not found" },
            { status: 404 },
         );

      const user = await User.findOne({ email: email.toLowerCase() }).lean();
      if (!user)
         return NextResponse.json(
            { error: "No user with that email" },
            { status: 404 },
         );

      const exists = await TeamMember.exists({
         businessId: business._id,
         userId: user._id,
      });
      if (exists)
         return NextResponse.json(
            { error: "Already a team member" },
            { status: 409 },
         );

      const tm = await TeamMember.create({
         businessId: business._id,
         userId: user._id,
         name: user.name,
         email: user.email,
         avatar: user.name.charAt(0).toUpperCase(),
         role: role || "viewer",
         status: "invited",
      });

      return NextResponse.json({ member: { id: tm._id.toString() } });
   } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
   }
}
