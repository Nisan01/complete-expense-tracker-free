"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../../utils/dbConfig";
import { Expenses, Budgets } from "../../../../utils/schema";
import { eq } from "drizzle-orm";
import { Spinner } from "../../../components/spinner/spinner";
import { Button } from "@/components/ui/button";
import EmojiPicker from "emoji-picker-react";
import { Toast } from "@/components/toastMes/toast";
import { X } from "lucide-react"; 

export default function ViewExpense({ refreshData }) {
  const { user } = useUser();
  const [budget, setBudget] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setshowForm] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [emoji, setEmoji] = useState("😊");
  const [toast, setToast] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const showToast = (message) => setToast(message);

  useEffect(() => {
    if (user) fetchBudgets();
  }, [user]);

  const fetchBudgets = async () => {
    setLoading(true);

    const budgetsRes = await db
      .select()
      .from(Budgets)
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));

    const expensesRes = await db
      .select()
      .from(Expenses)
      .where(eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress));

    const budgetsWithSpent = budgetsRes.map((b) => {
      const spent = expensesRes
        .filter((e) => e.budgetId === b.id)
        .reduce((acc, curr) => acc + Number(curr.amount), 0);
      return {
        ...b,
        spent,
        remaining: b.amount - spent,
      };
    });

    setBudget(budgetsWithSpent);
    setLoading(false);
  };

  const onClickOpenForm = () => setshowForm(true);

  const createIncome = async (e) => {
    e.preventDefault();
    const insertBudget = await db
      .insert(Budgets)
      .values({
        name,
        category,
        icon: emoji,
        amount,
        createdBy: user?.primaryEmailAddress?.emailAddress,
      })
      .returning();

    if (insertBudget && insertBudget[0]) {
      setToast("Income Added Successfully!");
      setBudget((prev) => [...prev, insertBudget[0]]);
      setName("");
      setCategory("");
      setAmount("");
      setEmoji("😊");
      setshowForm(false);
    }
  };


  const deleteBudget = async (budgetId) => {
    await db.delete(Budgets).where(eq(Budgets.id, budgetId));

    setBudget((prev) => prev.filter((b) => b.id !== budgetId));
    setToast("Deleted successfully!");
  };

  return (
    <div className="mt-7 relative p-8">
      {toast && (
        <Toast message={toast} duration={1000} onClose={() => setToast("")} />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.4)]">
          <form
             className="relative bg-white flex flex-col justify-center shadow-md rounded-2xl lg:p-8 p-6 lg:w-full w-[350px] mt-26 lg:mt-0 max-w-md space-y-6"
            onSubmit={createIncome}
          >
            <button
              type="button"
              onClick={() => setshowForm(false)}
          className="absolute top-1.5 right-4 font-bold text-2xl cursor-pointer text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-purple-800 text-center">
              Add Budget
            </h2>

            <div className="relative mt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                {emoji}
              </Button>

              {showEmojiPicker && (
                <div className="absolute z-50 top-full mt-2 left-0">
                  <div className="h-85 overflow-hidden rounded-lg shadow-lg">
                    <EmojiPicker
                      value={emoji}
                      onEmojiClick={(emojiData) => {
                        setEmoji(emojiData.emoji);
                        setShowEmojiPicker(false);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Income Category
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
              disabled={!(name && amount)}
              type="submit"
              className={`w-full py-2 px-4 font-semibold rounded-lg shadow-md transition duration-200 ${
                name && amount
                  ? "bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                  : "bg-purple-400 text-gray-300  cursor-not-allowed"
              }`}
            >
              Add Income
            </button>
          </form>
        </div>
      )}

      
    
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <button
            onClick={onClickOpenForm}
            className="p-4 border flex flex-col justify-center h-27 items-center rounded-2xl shadow bg-gray-300 cursor-pointer hover:bg-gray-200 transition"
          >
            <h2 className="text-xl font-semibold">+</h2>
            <p className="text-gray-600">Add Budgets</p>
          </button>
            {loading ? (
             
                [1,2,3,4,5,6].map((item,index)=>(
                  <div key={index} className="w-full flex  bg-slate-300 rounded-lg h-27 animate-pulse"></div>
                ))
           

      
      ) : (

        <>
          {budget.map((b) => (
            <div
              key={b.id}
              className="relative py-4 px-8 border rounded-2xl shadow bg-white"
            >
         
              <button
                onClick={() => deleteBudget(b.id)}
                className="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-red-600"
              >
                <X size={18} />
              </button>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {b.icon && (
                    <p className="p-2 rounded-full bg-gray-200">{b.icon}</p>
                  )}
                  <div className="flex flex-col">
                    <h2 className="text-[16px] font-semibold">{b.name}</h2>
                    <h2 className="text-sm">{b.spent || 0} spent</h2>
                  </div>
                </div>
                <p className="text-gray-600 font-bold">Rs {b.amount}</p>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-xs text-slate-400">
                  Rs {b.spent || 0} spend
                </h2>
                <h2 className="text-xs text-slate-400">
                  Rs {b.remaining || b.amount} Remaining
                </h2>
              </div>

          <div className="w-full bg-gray-400 h-2 rounded-full mt-1.5 overflow-hidden">
  <div
    className={`h-2 rounded-full ${
      b.spent > b.amount ? "bg-red-500" : "bg-purple-500"
    }`}
    style={{
      width: `${Math.min((b.spent || 0) / (b.amount || 1) * 100, 100)}%`,
    }}
  ></div>
</div>
            </div>
          ))}
          </>
        )}
        </div>
      
    </div>
  );
}
