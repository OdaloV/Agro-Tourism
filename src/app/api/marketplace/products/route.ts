import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/marketplace/products - List products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    
    let whereClause = "WHERE status = 'active'";
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (search) {
      whereClause += ` AND (product_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    const result = await pool.query(
      `SELECT * FROM marketplace_products 
       ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );
    
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM marketplace_products ${whereClause}`,
      params
    );
    
    return NextResponse.json({
      products: result.rows,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

// POST /api/marketplace/products - Create product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_name,
      category,
      price,
      quantity,
      unit_type,
      description,
      photos,
      location,
      latitude,
      longitude,
      phone,
      email,
      farmer_id
    } = body;
    
    const result = await pool.query(
      `INSERT INTO marketplace_products 
       (farmer_id, product_name, category, price, quantity, unit_type, 
        description, photos, location, latitude, longitude, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [farmer_id, product_name, category, price, quantity, unit_type,
       description, photos, location, latitude, longitude, phone, email]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
