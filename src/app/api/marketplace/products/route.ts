import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser, requireRole } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const category = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    
    let sql = `
      SELECT p.*, u.id as farmer_id, u.name as farmer_name
      FROM marketplace_products p
      JOIN farmer_profiles fp ON p.farmer_id = fp.user_id
      JOIN users u ON fp.user_id = u.id
      WHERE p.status = 'active'
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      sql += ` AND p.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (search) {
      sql += ` AND (p.product_name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.location ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    sql += ` ORDER BY p.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
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
    const user = await getUser(request);
    const authErr = requireRole(user, "farmer");
    if (authErr) return authErr;

    const farmerId = user!.id;
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
      email
    } = body;

    // Validate required fields
    if (!product_name || !category || price === undefined || quantity === undefined || !unit_type || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const priceValue = parseFloat(price);
    const quantityValue = parseInt(quantity);
    if (isNaN(priceValue) || isNaN(quantityValue)) {
      return NextResponse.json({ error: "Price and quantity must be valid numbers" }, { status: 400 });
    }

    const latitudeValue = latitude && latitude !== "" ? parseFloat(latitude) : null;
    const longitudeValue = longitude && longitude !== "" ? parseFloat(longitude) : null;

    const result = await pool.query(
      `INSERT INTO marketplace_products 
       (farmer_id, product_name, category, price, quantity, unit_type, 
        description, photos, location, latitude, longitude, phone, email)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        farmerId,
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
