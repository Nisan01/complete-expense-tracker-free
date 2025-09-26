import React from "react";

export default function RecentsCard({ amt, expenseTitle, category, date, time }) {
  return (
    <div className="w-fit flex flex-col relative items-center">
      <div className="bg-gray-300 flex flex-col items-start py-3 px-4 rounded-xl shadow-sm w-[382px] ">
        
        <span className="text-red-500 font-bold w-full text-center text-base leading-tight tracking-wide">
          -Rs {amt}
        </span>

        <span className="text-gray-800 font-semibold text-sm mt-2 leading-snug">
          {expenseTitle}
        </span>

        <div className="flex gap-2 items-center mt-2">
          <span className="text-gray-600 text-xs font-medium">Category:</span>
          <span className="text-white text-xs font-semibold bg-indigo-500 px-2 py-0.5 rounded-md shadow-sm">
            {category}
          </span>
        </div>

        <div className="flex gap-2 mt-2">
          <span className="text-gray-500 text-[11px]">{date}</span>
          <span className="text-gray-500 text-[11px]">{time}</span>
        </div>
      </div>
    </div>
  );
}
