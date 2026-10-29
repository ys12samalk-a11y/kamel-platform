import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let query = supabase
      .from("qureo_accounts")
      .select("*")
      .order("student_name", { ascending: true });

    if (search && search.trim()) {
      const s = search.trim();
      query = query.or(`student_name.ilike.%${s}%,student_code.ilike.%${s}%`);
    }

    // حد أعلى كبير بدل 100 (Supabase بيرجّع 1000 كحد أقصى افتراضيًا)
    const { data, error } = await query.range(0, 999);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      accounts: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}