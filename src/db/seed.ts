import "dotenv/config";
import { db } from "./index";
import { categories } from "./schema";
import { eq } from "drizzle-orm";

const initialCategories = [
  { name: "comida", emoji: "🍔", color: "#416781", isDefault: true },
  { name: "salidas", emoji: "🍹", color: "#f2440f", isDefault: true },
  { name: "regalos", emoji: "🎁", color: "#ffd1c7", isDefault: true },
  { name: "suscripciones", emoji: "📺", color: "#3c4c50", isDefault: true },
  { name: "deporte", emoji: "🧗", color: "#ea580c", isDefault: true },
  { name: "tarjeta", emoji: "💳", color: "#2d4a5e", isDefault: true },
  { name: "compartidos", emoji: "👥", color: "#c23a0d", isDefault: true },
  { name: "ahorros", emoji: "🏦", color: "#547a96", isDefault: true },
  { name: "transporte", emoji: "🚕", color: "#ff6b3d", isDefault: true },
  { name: "ropa", emoji: "👕", color: "#6e91ab", isDefault: true },
];

async function main() {
  console.log("🌱 Seeding database with default categories...");

  for (const cat of initialCategories) {
    // Check if category already exists
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.name, cat.name));

    if (existing.length === 0) {
      console.log(`Adding category: ${cat.emoji} ${cat.name}`);
      await db.insert(categories).values(cat);
    } else {
      console.log(`Category already exists: ${cat.name}`);
    }
  }

  console.log("✅ Seeding completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
