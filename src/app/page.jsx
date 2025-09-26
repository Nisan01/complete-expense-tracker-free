"use client";

import OverviewWithChart from "@/components/OverviewWithChart/OverviewWithChart";
import RecentsCard from "@/components/RecentsCard/RecentsCard";
import ExpButton from "@/components/expbutton/expbutton";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { db } from "../../utils/dbConfig";
import { Budgets, Expenses } from "../../utils/schema";
import { useEffect, useState } from "react";
import { eq, desc } from "drizzle-orm";
import { Toast } from "@/components/toastMes/toast";
import { Spinner } from "../components/spinner/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";




export default function Home() {
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [message, setMessage] = useState("");
  const [showForm, setshowForm] = useState(false);
  const [toast, setToast] = useState(""); 
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [budgetId, setBudgetId] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const[loading,setloading]=useState(false);
  const [skeleton,setSkeleton]=useState(true);
  
  


  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    
    if (user) {
      setSkeleton(false);
      const fetchBudgets = async () => {
        const res = await db
          .select()
          .from(Budgets)
          .where(
            eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress)
          );
        setBudgets(res);
      };
      fetchBudgets();
    }

  }, [user]);

  const createExpense = async (e) => {
    e.preventDefault();

    if (!budgetId) {
      setToast("Please select a valid category."); 
      return;
    }

    const insertExpense = await db.insert(Expenses).values({
      name,
      amount,
      budgetId,
      createdBy: user?.primaryEmailAddress?.emailAddress,
    });

    if (insertExpense) {
      setToast("Expense Added Successfully!"); // ✅
      setName("");
      setAmount("");
      setBudgetId(null);
      setshowForm(false);
      fetchExpenses();
      setRefreshKey((prev) => prev + 1);
    }
  };

  const AddExpenseHandler = (route) => {
    if (!isSignedIn) {
      alert("Please sign in to continue");
      return;
    }
    router.push(route);
  };

  useEffect(() => {
    user && fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    if (!user)
      
      return;
setloading(true);

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
setloading(false);



    if (res.length === 0) {
      setMessage("Please Create an Expense !!");
     
    } else {
      setMessage("");
    }
    setRecentExpenses(res.slice(0, 5));
  };

  const handleClick = async (route) => {
    if (!isSignedIn) {
      alert("Please sign in to continue");
      return;
    }
    router.push(route);
  };



   if (!isSignedIn) {
    return (
      <div className="flex items-center relative justify-center min-h-[410px]">
        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md text-center">
          <p className="text-lg font-semibold">
            Please sign in to continue
          </p>
          <button
            onClick={() => router.push("/sign-in")} 
            className="bg-purple-600 hover:bg-purple-700 px-4 mt-4 cursor-pointer py-2 rounded text-white"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <OverviewWithChart refreshKey={refreshKey} />

      {toast && (
        <Toast message={toast} duration={1500} onClose={() => setToast("")} />
      )}

<div className="flex flex-col items-center relative gap-2 w-full min-h-[190px]">
  <h2 className="text-2xl font-bold text-white">Recents</h2>
  <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-6 w-full px-4">
    {skeleton && ([1,2,3,4].map((item,index)=>(
      <div key={index} className="lg:w-[300px] w-[382px] bg-slate-300 rounded-lg h-[122px]  animate-pulse"></div>
    )))}

    {message &&
    <div className="w-100% flex h-[150px] border p-16 items-center text-center justify-center">

     <p className="text-gray-300 ">{message}
     
     </p>
     </div>
     }

    {loading && (
      <div className="min-h-[120px] flex items-center">
        <Spinner size="small" />
      </div>
    )}

    {recentExpenses.map((expense) => (
      <RecentsCard key={expense.id} amt={expense.amount} expenseTitle={expense.name} category={expense.category || "Uncategorized"} date={new Date(expense.createdAt).toLocaleDateString()} time={new Date(expense.createdAt).toLocaleTimeString()} />
    ))}
  </div>
</div>


      <div className="w-full flex gap-4 relative  justify-center items-center mt-2 mb-7">
        <ExpButton
          onClick={() => {
            budgets.length > 0
              ? setshowForm(true)
              : setToast("Please make a budget first!");
          }}
          text="Add Expense"
          className="bg-gray-900 relative lg:mt-1 mt-4 cursor-pointer "
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)]">
          <form
            className="relative bg-white flex flex-col justify-center shadow-md rounded-2xl lg:p-8 p-6 lg:w-full w-[350px] mt-10 max-w-md space-y-6"
            onSubmit={createExpense}
          >
            <button
              type="button"
              onClick={() => setshowForm(false)}
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
              className={`w-full py-2 px-4 font-semibold rounded-lg shadow-md transition cursor-pointer duration-200
                ${
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
    </>
  );
}
