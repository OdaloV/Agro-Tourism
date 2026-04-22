import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    
    let sql = "SELECT * FROM marketplace_products WHERE status = 'active'";
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (search) {
      sql += ` AND (product_name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(sql, params);
    
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM marketplace_products WHERE status = 'active'`
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
    
    // Convert empty strings to null for numeric fields
    const latitudeValue = latitude && latitude !== "" ? parseFloat(latitude) : null;
    const longitudeValue = longitude && longitude !== "" ? parseFloat(longitude) : null;
    const priceValue = parseFloat(price);
    const quantityValue = parseInt(quantity);
    const farmerIdValue = parseInt(farmer_id);
    
    const result = await pool.query(
      `INSERT INTO marketplace_products 
       (farmer_id, product_name, category, price, quantity, unit_type, 
        description, photos, location, latitude, longitude, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        farmerIdValue, 
        product_name, 
        category, 
        priceValue, 
        quantityValue, 
        unit_type,
        description || null, 
        photos || [], 
        location, 
        latitudeValue, 
        longitudeValue, 
        phone, 
        email
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
