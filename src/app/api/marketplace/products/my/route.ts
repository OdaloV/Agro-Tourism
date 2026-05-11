import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser, requireAuth } from "@/lib/auth-middleware";

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

export async function POST(request: NextRequest) {
  const user = await getUser(request);
  const err = requireAuth(user);
  if (err) return err;

  // Assert user is not null after requireAuth check
  const authenticatedUser = user as NonNullable<typeof user>;

  const data = await request.json();
  const { name, description, price, image } = data;

  if (!name || !description || !price || !image) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  const result = await pool.query(
    `INSERT INTO marketplace_products (name, description, price, image, farmer_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [name, description, price, image, authenticatedUser.id]
  );

  return NextResponse.json({ message: "Product created successfully" }, { status: 201 });
}
