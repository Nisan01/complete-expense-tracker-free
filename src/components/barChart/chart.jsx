import React from "react";
import {
  Bar,
  BarChart,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer, // ✅ import this
} from "recharts";

function ChartDashboard({ budgetData }) {
  return (
    <div className="w-full h-[250px] p-2">
      <ResponsiveContainer width="98%" height="100%">
        <BarChart
          data={budgetData}
          margin={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <XAxis dataKey="name" stroke="#FFFFFF"/>
          <YAxis stroke="#FFFFFF" />
          <Tooltip />
          <Legend />

        
          <Bar dataKey="totalspend" stackId="a" fill="#FF9A00" name="Spent" />
          <Bar dataKey="amount" stackId="a" fill="#DBDBDB" name="Budget" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartDashboard;
