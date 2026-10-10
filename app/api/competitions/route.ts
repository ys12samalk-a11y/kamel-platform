import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET: جلب المسابقات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const id = searchParams.get("id");

    // جلب مسابقة واحدة + اشتراكاتها
    if (id) {
      const { data: competition, error } = await supabase
        .from("competitions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const { data: entries } = await supabase
        .from("competition_entries")
        .select("*")
        .eq("competition_id", id)
        .order("created_at", { ascending: false });

      return NextResponse.json({
        success: true,
        competition,
        entries: entries || [],
      });
    }

    // جلب كل المسابقات
    let query = supabase
      .from("competitions")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // نجيب عدد المشتركين لكل مسابقة
    const competitionsWithCounts = await Promise.all(
      (data || []).map(async (comp) => {
        const { count } = await supabase
          .from("competition_entries")
          .select("*", { count: "exact", head: true })
          .eq("competition_id", comp.id);

        return { ...comp, entries_count: count || 0 };
      })
    );

    return NextResponse.json({
      success: true,
      competitions: competitionsWithCounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// POST: إنشاء مسابقة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, prize, deadline, created_by } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("competitions")
      .insert({
        title: title.trim(),
        description: description.trim(),
        category: category || null,
        prize: prize?.trim() || null,
        deadline: deadline || null,
        status: "open",
        created_by: created_by || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, competition: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// PATCH: تحديث مسابقة (إغلاق، إعلان فائز، إلخ)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("competitions")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, competition: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}

// DELETE: حذف مسابقة
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "المعرّف مطلوب" }, { status: 400 });
    }

    const { error } = await supabase
      .from("competitions")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "حدث خطأ" },
      { status: 500 }
    );
  }
}
