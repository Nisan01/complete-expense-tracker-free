"use client";

import Header from "../header/header";
import ExpButton from "../expbutton/expbutton";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { db } from "../../../utils/dbConfig";
import { Expenses, Budgets } from "../../../utils/schema";
import { eq, desc } from "drizzle-orm";
import { Toast } from "../toastMes/toast";
import { Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Spinner } from "../spinner/spinner";

export default function HeaderNav() {
  const { user, isSignedIn } = useUser();
  const [toast, setToast] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Add Expense state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [budgetId, setBudgetId] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState([]);

  const router = useRouter();
  const pathname = usePathname();

  // Fetch user's budgets
  useEffect(() => {
    if (!user) return;
    const fetchBudgets = async () => {
      const res = await db
        .select()
        .from(Budgets)
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
      setBudgets(res);
    };
    fetchBudgets();
  }, [user]);

  // Fetch user's recent expenses
  const fetchExpenses = async () => {
    if (!user) return;
    setLoading(true);
    const res = await db
      .select({
        id: Expenses.id,
        name: Expenses.name,
        amount: Expenses.amount,
        createdAt: Expenses.createdAt,
        category: Budgets.name,
      })
      .from(Expenses)
      .leftJoin(Budgets, eq(Expenses.budgetId, Budgets.id))
      .where(eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(Expenses.createdAt));
    setLoading(false);
    setRecentExpenses(res.slice(0, 5));
  };

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user]);

  const handleClick = (route) => {
    if (!isSignedIn) {
      alert("Please sign in to continue");
      return;
    }
    router.push(route);
    setMenuOpen(false);
  };

  const getButtonClass = (route) => {
    return pathname === route
      ? "bg-black text-white"
      : "bg-gray-500 hover:bg-blue-100 text-white";
  };

  const handleAddExpenseClick = () => {
    if (!isSignedIn) {
      alert("Please sign in to continue");
      return;
    }
    if (budgets.length === 0) {
      setToast("Please make a budget first!");
      return;
    }
    setShowForm(true);
    setMenuOpen(false);
  };

  const createExpense = async (e) => {
    e.preventDefault();
    if (!budgetId) {
      setToast("Please select a valid category.");
      return;
    }

    setLoading(true);
    const insertExpense = await db.insert(Expenses).values({
      name,
      amount,
      budgetId,
      createdBy: user?.primaryEmailAddress?.emailAddress,
    });
    setLoading(false);

    if (insertExpense) {
      setToast("Expense Added Successfully!");
      setName("");
      setAmount("");
      setBudgetId(null);
      setCategory("");
      setShowForm(false);
      fetchExpenses(); // ✅ Refresh recent expenses
    }
  };

  return (
    <>
      {/* Add Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]">
          <form
            className="relative bg-white flex flex-col justify-center shadow-md rounded-2xl lg:p-8 p-6 lg:w-full w-[350px] mt-10 max-w-md space-y-6"
            onSubmit={createExpense}
          >
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-4 font-bold text-2xl cursor-pointer text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-purple-800 text-center">
              Add Expense
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expense Name
              </label>
              <input
                type="text"
                placeholder="e.g. Grocery Shopping"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <div className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <DropdownMenu>
                  <DropdownMenuTrigger className="w-full text-left">
                    {category || "Select Category"}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {budgets.map((budget) => (
                      <DropdownMenuItem
                        key={budget.id}
                        onClick={() => {
                          setCategory(budget.name);
                          setBudgetId(budget.id);
                        }}
                      >
                        {budget.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <button
              disabled={!(name && category && amount)}
              type="submit"
              className={`w-full py-2 px-4 font-semibold rounded-lg shadow-md transition cursor-pointer duration-200 ${
                name && category && amount
                  ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                  : "bg-purple-400 text-gray-300 cursor-not-allowed"
              }`}
            >
              Add Expense
            </button>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="cursor-pointer mt-3 px-4 sm:px-6 relative lg:px-8">
        <Header />

        {/* Mobile Menu Toggle */}
        <div className="sm:hidden flex absolute left-8 z-10">
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-md bg-gray-500 text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden sm:flex flex-wrap gap-4 items-center justify-center mt-4">
          <ExpButton
            text="Home"
            className={`w-3/4 sm:w-40 ${getButtonClass("/")}`}
            onClick={() => handleClick("/")}
          />
          <ExpButton
            text="View Expense"
            className={`w-3/4 sm:w-40 ${getButtonClass("/dashboard/view-expense")}`}
            onClick={() => handleClick("/dashboard/view-expense")}
          />
          <ExpButton
            text="Add Expense"
            className="w-3/4 sm:w-40 bg-gray-500"
            onClick={handleAddExpenseClick}
          />
          <ExpButton
            text="Budgets"
            className={`w-3/4 sm:w-40 ${getButtonClass("/dashboard/Income")}`}
            onClick={() => handleClick("/dashboard/Income")}
          />
          <ExpButton
            text="Reset Data"
            className={`w-3/4 sm:w-40 ${getButtonClass("/dashboard/reset")}`}
            onClick={() => handleClick("/dashboard/reset")}
          />
        </div>

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-gray-400 bg-opacity-70 backdrop-blur-md z-50 transform transition-transform duration-300 ease-in-out
            ${menuOpen ? "translate-x-0" : "-translate-x-full"} sm:hidden`}
        >
          <div className="flex justify-end p-4">
            <button onClick={() => setMenuOpen(false)} className="text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col gap-4 mt-6 px-4">
            <ExpButton
              text="Home"
              className={`w-full ${getButtonClass("/")}`}
              onClick={() => handleClick("/")}
            />
            <ExpButton
              text="View Expense"
              className={`w-full ${getButtonClass("/dashboard/view-expense")}`}
              onClick={() => handleClick("/dashboard/view-expense")}
            />
            <ExpButton
              text="Add Expense"
              className="w-full bg-gray-500"
              onClick={handleAddExpenseClick}
            />
            <ExpButton
              text="Budgets"
              className={`w-full ${getButtonClass("/dashboard/Income")}`}
              onClick={() => handleClick("/dashboard/Income")}
            />
            <ExpButton
              text="Reset Data"
              className={`w-full ${getButtonClass("/dashboard/reset")}`}
              onClick={() => handleClick("/dashboard/reset")}
            />
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} duration={1000} onClose={() => setToast("")} />}
    </>
  );
}
