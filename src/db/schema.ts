import { pgTable, uuid, varchar, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  color: varchar("color", { length: 7 }).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  userId: uuid("user_id"), // NULL for global system categories
});

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").notNull(), // Ties expense to a Supabase auth user
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));
