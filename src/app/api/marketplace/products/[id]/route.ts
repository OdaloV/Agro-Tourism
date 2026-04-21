import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    // Increment view count
    await pool.query(
      `UPDATE marketplace_products SET views = views + 1 WHERE id = $1`,
      [id]
    );
    
    const result = await pool.query(
      `SELECT p.*, u.name as farmer_name, u.farm_name 
       FROM marketplace_products p
       JOIN users u ON p.farmer_id = u.id
       WHERE p.id = $1`,
      [id]
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await pool.query(`DELETE FROM marketplace_products WHERE id = $1`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
