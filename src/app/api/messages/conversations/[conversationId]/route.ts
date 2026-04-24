import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { id: payload.id as number };
  } catch {
    return null;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await params;
    const convId = parseInt(conversationId);

    // Verify the user belongs to this conversation
    const check = await pool.query(
      `SELECT visitor_id, farmer_id FROM conversations WHERE id = $1`,
      [convId]
    );
    if (check.rows.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    const { visitor_id, farmer_id } = check.rows[0];
    if (user.id !== visitor_id && user.id !== farmer_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete all messages first (foreign key cascade will handle if set)
    await pool.query(`DELETE FROM messages WHERE conversation_id = $1`, [convId]);
    await pool.query(`DELETE FROM conversations WHERE id = $1`, [convId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 });
  }
}
