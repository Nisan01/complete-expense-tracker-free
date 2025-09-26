"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../../utils/dbConfig";
import { Expenses, Budgets } from "../../../../utils/schema";
import { Spinner } from "../../../components/spinner/spinner";
import { desc, eq } from "drizzle-orm";
import { Toast } from "@/components/toastMes/toast";

export default function ViewExpenses() {
  const { user } = useUser();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (user) fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
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

    setExpenses(res);
    setLoading(false);
  };

  const deleteExpense = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    await db.delete(Expenses).where(eq(Expenses.id, id));
    setToast("Expense removed successfully!");
    
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const grouped = expenses.reduce((acc, exp) => {
    const date = new Date(exp.createdAt);
    const key = date.toLocaleString("default", { month: "long", year: "numeric" });

    if (!acc[key]) acc[key] = { total: 0, items: [] };

    acc[key].items.push(exp);
    acc[key].total += Number(exp.amount);

    return acc;
  }, {});

  return (
    <>
      {toast && <Toast message={toast} duration={1500} onClose={() => setToast("")} />}

      <div className="p-6 relative">
        <h2 className="text-2xl text-gray-50 font-bold mb-2 mt-1 text-center">All Expenses</h2>

        {!loading && expenses.length === 0 && (
          <p className="text-center text-gray-100 mt-10">No expenses found.</p>
        )}

        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <Spinner size="large" />
          </div>
        ) : (
          <div className="space-y-10">
            {Object.keys(grouped).map((month) => (
              <div key={month} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[15px]  text-gray-100">{month}</h3>
                  <p className="text-lg font-bold text-gray-200">
                    Total: Rs {grouped[month].total}
                  </p>
                </div>

              
                <div className="bg-white shadow rounded-lg divide-y relative">
                  {grouped[month].items.map((exp) => (
                    <div key={exp.id} className="flex justify-between items-center p-4 relative">
               
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="absolute cursor-pointer top-1.5 right-3 text-red-500 font-bold hover:text-red-700"
                      >
                        ✕
                      </button>

                      <div>
                        <p className="font-medium text-gray-900">{exp.name}</p>
                        <p className="text-sm text-gray-500">
                          [ {exp.category || "Uncategorized"} ]
                        </p>
                      </div>
                      <span className="font-semibold mr-4 text-gray-700">
                        Rs {exp.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
