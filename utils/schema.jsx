import { timestamp } from "drizzle-orm/pg-core";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { integer,numeric } from "drizzle-orm/pg-core/columns";

export const Budgets = pgTable("Budgets", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  amount: varchar("amount").notNull(),
  icon: varchar("icon"),
  createdBy: varchar("createdBy").notNull(),
});




export const Expenses = pgTable("Expenses", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),           
  amount: numeric("amount").notNull(),       
  budgetId: integer("budgetId")             
    .references(() => Budgets.id, { onDelete: "cascade" })
    .notNull(),
  createdBy: varchar("createdBy").notNull(),  
  createdAt: timestamp("createdAt").defaultNow().notNull()
});