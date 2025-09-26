export default function ExpItem({ expense }) {
  return (
    <div className="p-5 border rounded-lg  w-full">
      <div className="flex w-full justify-between">
      <div className="flex gap-2 items-center">
        <h2 className="text-2xl px-4 bg-slate-100 p-2 rounded-full">
          {expense?.icon}
        </h2>
        <div>
          <h2>{expense?.name}</h2>
          <h2>{expense?.totalItem} Item</h2>
        </div>

      
      </div>
        <div>
          <h2 className="font-bold">{expense?.amount}</h2>
        </div>
      </div>
      <div className="mt-4">
        <div className="bg-slate-300 w-full h-2 rounded-full">
           <div className="bg-purple-800 w-[40%] h-2 rounded-full"></div>
        </div>
       
</div>
    </div>
  );
}
