import { NextResponse } from "next/server"
import { getLeadsFromSheet } from "@/lib/google-sheets"

export async function GET() {
  try {
    const leads = await getLeadsFromSheet()
    return NextResponse.json({ leads })
  } catch (error) {
    console.error("[v0] Error en API de leads:", error)
    return NextResponse.json({ error: "Error al obtener los leads" }, { status: 500 })
  }
}
