/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import File from "@/models/Files";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("cypher-session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    await connectDB();

    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get("skip") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const quality =
      searchParams.get("quality")?.split(",").filter(Boolean) || [];
    const language =
      searchParams.get("language")?.split(",").filter(Boolean) || [];

    const query: any = {};
    if (search) {
      query.file_name = { $regex: search, $options: "i" };
    }
    if (quality.length > 0) {
      query.quality = { $in: quality };
    }
    if (language.length > 0) {
      if (language.includes("multi")) {
        query.language = { $regex: /,/ };
      } else {
        query.language = { $in: language };
      }
    }

    const files = await File.find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(files);
  } catch (error) {
    console.error("GET /api/files error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
