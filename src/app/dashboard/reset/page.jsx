"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../../utils/dbConfig";
import { Expenses, Budgets } from "../../../../utils/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/toastMes/toast";

export default function ResetDataPage() {
  const { user } = useUser();
  const [toast, setToast] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const showToast = (message) => setToast(message);

  const handleReset = async (type) => {
    if (!user) {
      showToast("You must be signed in to reset data.");
      return;
    }

    try {
      if (type === "income") {
        await db.delete(Budgets).where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
        showToast("All income reset successfully!");
      } else if (type === "expense") {
        await db.delete(Expenses).where(eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress));
        showToast("All expenses reset successfully!");
      } else if (type === "all") {
        await db.delete(Expenses).where(eq(Expenses.createdBy, user?.primaryEmailAddress?.emailAddress));
        await db.delete(Budgets).where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
        showToast("All data reset successfully!");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong!");
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div className="px-8 py-3 flex flex-col lg:mt-10 items-center justify-center gap-8 relative">
      {toast && <Toast message={toast} duration={2000} onClose={() => setToast("")} />}

      <h1 className="text-3xl font-bold text-center text-gray-200">Reset Data</h1>

      <div className="w-full flex items-center flex-col gap-4">
        <Button onClick={() => setConfirmAction("income")} className="bg-yellow-500 hover:bg-yellow-600 w-3/4  sm:w-40 cursor-pointer">
          Reset Income
        </Button>

        <Button onClick={() => setConfirmAction("expense")} className="bg-red-500 w-3/4  sm:w-40 hover:bg-red-600 cursor-pointer">
          Reset Expense
        </Button>

        <Button onClick={() => setConfirmAction("all")} className="bg-gray-700 w-3/4  sm:w-40 hover:bg-gray-800 cursor-pointer">
          Reset All
        </Button>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] z-50">
          <div className="bg-white p-6 mt-15 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Are you sure you want to reset {confirmAction}?
            </h2>
            <div className="flex justify-around gap-4">
              <Button
                onClick={() => handleReset(confirmAction)}
                className="bg-green-500 hover:bg-green-600 cursor-pointer"
              >
                Yes
              </Button>
              <Button
                onClick={() => setConfirmAction(null)}
                className="bg-red-500 hover:bg-red-600 cursor-pointer"
              >
                No
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
