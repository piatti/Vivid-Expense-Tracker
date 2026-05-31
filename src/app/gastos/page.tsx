import MoneyTrackerClient from "./money-tracker-client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { getCategories, getExpenses } from "@/app/actions/money-tracker";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch data on the server
  const [categories, expenses] = await Promise.all([
    getCategories(),
    getExpenses(),
  ]);

  return (
    <MoneyTrackerClient
      initialCategories={categories}
      initialExpenses={expenses}
      user={user}
    />
  );
}
