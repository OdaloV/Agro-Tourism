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
    
    // Get the user ID from the request (if logged in)
    const searchParams = request.nextUrl.searchParams;
    const viewerId = searchParams.get("userId");
    
    // Get product details first
    const result = await pool.query(
      `SELECT 
        p.*, 
        u.name as farmer_name,
        fp.farm_name,
        u.email,
        u.phone
       FROM marketplace_products p
       JOIN users u ON p.farmer_id = u.id
       JOIN farmer_profiles fp ON u.id = fp.user_id
       WHERE p.id = $1`,
      [productId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Only increment view count if the viewer is NOT the owner
    const product = result.rows[0];
    const isOwner = viewerId && parseInt(viewerId) === product.farmer_id;
    
    if (!isOwner) {
      await pool.query(
        `UPDATE marketplace_products SET views = views + 1 WHERE id = $1`,
        [productId]
      );
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }
    
    await pool.query(`DELETE FROM marketplace_products WHERE id = $1`, [productId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();
    const {
      product_name,
      category,
      price,
      quantity,
      unit_type,
      description,
      photos,
    } = body;
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }
    
    const result = await pool.query(
      `UPDATE marketplace_products 
       SET product_name = $1, category = $2, price = $3, quantity = $4, 
           unit_type = $5, description = $6, photos = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [product_name, category, price, quantity, unit_type, description || null, photos || [], productId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
