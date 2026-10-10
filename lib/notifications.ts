import { supabase } from "./supabase";

// إنشاء إشعار لمستخدم واحد
export async function createNotification(
  userCode: string,
  title: string,
  message: string,
  type: string = "info",
  link?: string
) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_code: userCode,
      title,
      message,
      type,
      link: link || null,
    });

    if (error) {
      console.error("Create notification error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Create notification error:", err);
    return false;
  }
}

// إنشاء إشعار لمجموعة مستخدمين
export async function createBulkNotifications(
  userCodes: string[],
  title: string,
  message: string,
  type: string = "info",
  link?: string
) {
  try {
    if (userCodes.length === 0) return true;

    const notifications = userCodes.map((code) => ({
      user_code: code,
      title,
      message,
      type,
      link: link || null,
    }));

    // نرفع في دفعات (100 كل مرة)
    const batchSize = 100;
    for (let i = 0; i < notifications.length; i += batchSize) {
      const batch = notifications.slice(i, i + batchSize);
      const { error } = await supabase.from("notifications").insert(batch);

      if (error) {
        console.error("Bulk notification error:", error);
      }
    }

    return true;
  } catch (err) {
    console.error("Bulk notification error:", err);
    return false;
  }
}

// إشعار لكل الطلاب في صف معين
export async function notifyGrade(
  grade: string,
  title: string,
  message: string,
  type: string = "info",
  link?: string
) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("code")
      .eq("role", "student")
      .eq("grade", grade)
      .eq("status", "active");

    if (error || !data) return false;

    const codes = data.map((u) => u.code);
    return await createBulkNotifications(codes, title, message, type, link);
  } catch (err) {
    console.error("Notify grade error:", err);
    return false;
  }
}

// إشعار لكل الطلاب في صف وفصل معين
export async function notifyClass(
  grade: string,
  className: string,
  title: string,
  message: string,
  type: string = "info",
  link?: string
) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("code")
      .eq("role", "student")
      .eq("grade", grade)
      .eq("class", className)
      .eq("status", "active");

    if (error || !data) return false;

    const codes = data.map((u) => u.code);
    return await createBulkNotifications(codes, title, message, type, link);
  } catch (err) {
    console.error("Notify class error:", err);
    return false;
  }
}

// إشعار لكل الطلاب في المدرسة
export async function notifyAllStudents(
  title: string,
  message: string,
  type: string = "info",
  link?: string
) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("code")
      .eq("role", "student")
      .eq("status", "active");

    if (error || !data) return false;

    const codes = data.map((u) => u.code);
    return await createBulkNotifications(codes, title, message, type, link);
  } catch (err) {
    console.error("Notify all students error:", err);
    return false;
  }
}