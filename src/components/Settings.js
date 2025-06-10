import React, { useState } from "react";

export default function Settings({ onLogout }) {
   const [notificationsEnabled, setNotificationsEnabled] = useState(true);

   return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md h-full flex flex-col justify-between">
         <div>
            <div className="flex flex-col items-center space-y-4 mb-8">
               <div className="w-28 h-28 rounded-full bg-green-500 flex items-center justify-center text-white text-4xl font-bold shadow-md">
                  U
               </div>
               <h2 className="text-xl font-semibold text-gray-900">User Name</h2>
               <p className="text-gray-600">user.email@example.com</p>
            </div>

            <div className="space-y-6">
               <button
                  onClick={() => alert("Redirecting to Help & Support...")}
                  className="w-full py-3 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md shadow-md transition">
                  Help & Support
               </button>

               <div className="flex items-center justify-between border rounded-md p-4">
                  <div>
                     <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                     <p className="text-gray-500 text-sm">Enable or disable app notifications.</p>
                  </div>
                  <label className="inline-flex relative items-center cursor-pointer">
                     <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                        className="sr-only peer"
                     />
                     <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-600 transition"></div>
                     <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md peer-checked:translate-x-5 transition"></div>
                  </label>
               </div>

               <div className="border rounded-md p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">About the App</h3>
                  <p className="text-gray-600 text-sm">
                     This app helps you manage operations and track installation statistics with
                     ease and efficiency. Version 1.0.0.
                  </p>
               </div>
            </div>
         </div>

         <button
            onClick={onLogout}
            className="w-full py-3 px-6 mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition">
            Log Out
         </button>
      </div>
   );
}
