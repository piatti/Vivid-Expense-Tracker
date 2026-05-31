"use server";

import { db } from "@/db";
import { expenses, categories } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { and, eq, or, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Secure arithmetic expression evaluator
function evaluateMathExpression(expr: string): number {
  if (typeof expr === "number") return expr;
  const sanitized = expr.toString().replace(/[^0-9+\-*/.()]/g, "");
  if (!sanitized) return 0;
  try {
    // Only execute if it strictly consists of valid math tokens
    const result = new Function(`return (${sanitized})`)();
    return typeof result === "number" && !isNaN(result) ? result : 0;
  } catch (err) {
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? 0 : parsed;
  }
}

// Get the authenticated user or throw
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// 1. Fetch all visible categories (default + user-created)
export async function getCategories() {
  try {
    const user = await getAuthenticatedUser();
    return await db
      .select()
      .from(categories)
      .where(or(eq(categories.isDefault, true), eq(categories.userId, user.id)));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// 2. Fetch expenses for the current user
export async function getExpenses() {
  try {
    const user = await getAuthenticatedUser();
    const result = await db
      .select({
        id: expenses.id,
        title: expenses.title,
        value: expenses.value,
        date: expenses.date,
        categoryId: expenses.categoryId,
        categoryName: categories.name,
        categoryEmoji: categories.emoji,
        categoryColor: categories.color,
      })
      .from(expenses)
      .innerJoin(categories, eq(expenses.categoryId, categories.id))
      .where(eq(expenses.userId, user.id));

    // Map numeric strings back to numbers and date to timestamp for JS frontend
    return result.map((e) => ({
      ...e,
      value: parseFloat(e.value as string) || 0,
      date: new Date(e.date).getTime(),
    }));
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

// 3. Save or update an expense
export async function saveExpense(payload: {
  id?: string;
  title: string;
  rawValue: string | number;
  categoryId: string;
  date?: number;
}) {
  try {
    const user = await getAuthenticatedUser();
    const value = evaluateMathExpression(payload.rawValue.toString());

    if (value <= 0) {
      throw new Error("El monto debe ser mayor a cero.");
    }

    const expenseData = {
      title: payload.title.trim() || "Gasto sin concepto",
      value: value.toFixed(2), // numeric type format
      categoryId: payload.categoryId,
      userId: user.id,
      date: payload.date ? new Date(payload.date) : new Date(),
    };

    if (payload.id) {
      // Update existing expense (verify ownership)
      await db
        .update(expenses)
        .set(expenseData)
        .where(and(eq(expenses.id, payload.id), eq(expenses.userId, user.id)));
    } else {
      // Create new expense
      await db.insert(expenses).values(expenseData);
    }

    revalidatePath("/gastos");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving expense:", error);
    return { success: false, error: error.message };
  }
}

// 4. Delete an expense
export async function deleteExpense(id: string) {
  try {
    const user = await getAuthenticatedUser();
    await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, user.id)));

    revalidatePath("/gastos");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting expense:", error);
    return { success: false, error: error.message };
  }
}

// 5. Create a new custom category
export async function createCustomCategory(payload: {
  name: string;
  emoji: string;
}) {
  try {
    const user = await getAuthenticatedUser();
    const name = payload.name.trim().toLowerCase();

    if (!name) throw new Error("El nombre de la categoría es obligatorio.");

    // Check if category already exists for this user or globally
    const existing = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.name, name),
          or(eq(categories.isDefault, true), eq(categories.userId, user.id))
        )
      );

    if (existing.length > 0) {
      throw new Error("Esta categoría ya existe.");
    }

    const colors = [
      "#416781",
      "#f2440f",
      "#5c84a0",
      "#ea580c",
      "#7da1ba",
      "#c23a0d",
      "#2d4a5e",
      "#547a96",
      "#ff6b3d",
      "#6e91ab",
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const result = await db.insert(categories).values({
      name,
      emoji: payload.emoji || "📁",
      color,
      isDefault: false,
      userId: user.id,
    }).returning();

    revalidatePath("/gastos");
    return { success: true, category: result[0] };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }
}

// 6. Delete a custom category
export async function deleteCustomCategory(id: string) {
  try {
    const user = await getAuthenticatedUser();
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, user.id)));

    revalidatePath("/gastos");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
}
