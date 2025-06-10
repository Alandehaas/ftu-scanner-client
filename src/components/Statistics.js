import React, { useState } from "react";

export default function Statistics() {
   const [year, setYear] = useState(2025);

   const initialData = {
      2025: {
         Jan: { good: 20, bad: 5 },
         Feb: { good: 98, bad: 2 },
         Mar: { good: 84, bad: 12 },
         Apr: { good: 90, bad: 20 },
         May: { good: 0, bad: 0 },
         Jun: { good: 0, bad: 0 },
         Jul: { good: 0, bad: 0 },
         Aug: { good: 0, bad: 0 },
         Sep: { good: 0, bad: 0 },
         Oct: { good: 0, bad: 0 },
         Nov: { good: 0, bad: 0 },
         Dec: { good: 0, bad: 0 },
      },
   };

   const [data, setData] = useState(initialData);

   const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
   ];

   const getYearData = (year) => {
      if (!data[year]) {
         const emptyYearData = {};
         months.forEach((month) => {
            emptyYearData[month] = { good: 0, bad: 0 };
         });
         setData((prev) => ({ ...prev, [year]: emptyYearData }));
         return emptyYearData;
      }

      const filledData = { ...data[year] };
      months.forEach((month) => {
         if (!filledData[month]) {
            filledData[month] = { good: 0, bad: 0 };
         }
      });
      return filledData;
   };

   const currentYearData = getYearData(year);

   return (
      <div className="p-6 h-full text-gray-900 flex flex-col items-center">
         <h1 className="text-3xl font-bold mb-2">Statistics</h1>

         <div className="flex items-center space-x-4 mb-4">
            <button
               onClick={() => setYear((prev) => prev - 1)}
               className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
               ◀ Prev
            </button>
            <span className="text-lg font-semibold">{year}</span>
            <button
               onClick={() => setYear((prev) => prev + 1)}
               className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
               Next ▶
            </button>
         </div>

         <div className="w-full max-w-5xl flex justify-center items-end h-80 space-x-3 mb-4">
            {months.map((month) => (
               <div key={month} className="flex flex-col items-center">
                  <div className="flex flex-col justify-end h-56 w-8 space-y-1 relative">
                     <div
                        className="bg-green-500 w-8 rounded-t"
                        style={{ height: `${currentYearData[month].good * 2}px` }}
                        title={`Good: ${currentYearData[month].good}`}></div>
                     <div
                        className="bg-red-500 w-8 rounded-b"
                        style={{ height: `${currentYearData[month].bad * 2}px` }}
                        title={`Bad: ${currentYearData[month].bad}`}></div>
                  </div>
                  <span className="mt-1 text-sm">{month}</span>
               </div>
            ))}
         </div>

         <div className="text-sm text-gray-600 flex gap-6 mt-2">
            <div className="flex items-center gap-2">
               <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
               Good Installations
            </div>
            <div className="flex items-center gap-2">
               <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
               Bad Installations
            </div>
         </div>
      </div>
   );
}
