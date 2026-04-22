import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farmerId = searchParams.get("farmerId");
    
    if (!farmerId) {
      return NextResponse.json({ error: "Farmer ID required" }, { status: 400 });
    }
    
    const result = await pool.query(
      `SELECT * FROM marketplace_products 
       WHERE farmer_id = $1 
       ORDER BY created_at DESC`,
      [farmerId]
    );
    
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching farmer products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
