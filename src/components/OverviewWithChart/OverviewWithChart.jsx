"use client";

import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Budgets, Expenses } from "../../../utils/schema";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../utils/dbConfig";
import { eq, sql } from "drizzle-orm";
import { Spinner } from "../spinner/spinner";
import ChartDashboard from "../barChart/chart";

export default function OverviewWithChart({ refreshKey }) {
  const [TotalIncome, setTotalIncome] = useState(0);
  const [TotalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [budgetList, setBudgetList] = useState([]);
   const [skeleton,setSkeleton]=useState(true);

  const { user } = useUser();

  const fetchOverview = async () => {
    if (!user) return;
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
      const totalspend = expensesRes
        .filter((e) => e.budgetId === b.id)
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

      return {
        name: b.name,
        amount: Number(b.amount),
        totalspend,
      };
    });

    setBudgetList(budgetsWithSpent);

    const totalIncomeRes = await db
      .select({
        totalIncome: sql`SUM(${Budgets.amount}::numeric)`.mapWith(Number),
      })
      .from(Budgets)
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));

    setTotalIncome(totalIncomeRes[0]?.totalIncome || 0);

    const totalExpenseRes = await db
      .select({
        totalExpense: sql`SUM(${Expenses.amount}::numeric)`.mapWith(Number),
      })
      .from(Expenses)
      .where(eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress));

    setTotalExpense(totalExpenseRes[0]?.totalExpense || 0);

    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchOverview();
  }, [user, refreshKey]);

  return (
   <div
  className="
    flex flex-col lg:flex-row
    justify-center items-center  
    gap-6 lg:gap-12 relative
    p-4 lg:mt-5
  "
>

  <div className="w-full max-w-[382px]">
    <h2 className="font-bold text-white text-xl mb-3 font-roboto tracking-wide text-center lg:text-left">
      Overview
    </h2>

    <div className="flex bg-white flex-col gap-3 shadow-md p-5 rounded-xl w-full">
 
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-gray-700 text-sm font-medium">
          <Wallet className="w-4 h-4 text-green-600" />
          Total Balance
        </div>
        {loading ? (
          <Spinner size="small" />
        ) : (
          <span className="text-base font-semibold text-green-600">
            Rs {TotalIncome}
          </span>
        )}
      </div>

 
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-gray-700 text-sm font-medium">
          <ArrowUpRight className="w-4 h-4 text-red-500" />
          Total Expense
        </div>
        {loading ? (
          <Spinner size="small" />
        ) : (
          <span className="text-base font-semibold text-red-500">
            Rs {TotalExpense}
          </span>
        )}
      </div>

    
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-gray-700 text-sm font-medium">
          <ArrowDownRight className="w-4 h-4 text-blue-500" />
          Available Balance
        </div>
        <span className="text-base font-semibold text-blue-500">
          Rs {TotalIncome - TotalExpense}
        </span>
      </div>
    </div>
  </div>

<div className="w-full max-w-lg flex justify-center items-center">
  {loading ? (
    <div className="lg:w-full w-[382px] h-[250px] bg-slate-300 flex items-center justify-center rounded-xl animate-pulse">
      <h2 className=" text-gray-700 text-sm font-medium">Bar Chart...</h2>
    </div>
  ) : budgetList.length > 0 ? (
    <ChartDashboard budgetData={budgetList} />
  ) : (
    <p className="text-gray-400">No data available</p>
  )}
</div>

</div>

  );
}
