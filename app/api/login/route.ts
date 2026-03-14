import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/login?error=1", request.url));
  }

  const cookieStore = cookies();
  cookieStore.set("admin_auth", "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.redirect(new URL("/admin", request.url));
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url));
}