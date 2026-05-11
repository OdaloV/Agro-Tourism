import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT 
         p.*,
         u.id as farmer_id,
         u.name as farmer_name,
         fp.id as farm_profile_id
       FROM marketplace_products p
       JOIN farmer_profiles fp ON p.farmer_id = fp.user_id
       JOIN users u ON fp.user_id = u.id
       WHERE p.id = $1 AND p.status = 'active'`,
      [productId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}