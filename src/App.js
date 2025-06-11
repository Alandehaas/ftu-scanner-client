import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import ScanPage from "./components/ScanPage";
import OperationsPage from "./components/OperationsPage";
import Statistics from "./components/Statistics";
import Settings from "./components/Settings";

export default function App() {
   const [page, setPage] = useState("operations");
   const [isLoggedIn, setIsLoggedIn] = useState(false);

   useEffect(() => {
      const storedLogin = localStorage.getItem("isLoggedIn");
      if (storedLogin === "true") {
         setIsLoggedIn(true);
      }
   }, []);


   const handleLogin = () => {
      setIsLoggedIn(true);
      setPage("operations");
   };

   const handleLogout = () => {
      setIsLoggedIn(false);
      localStorage.removeItem("isLoggedIn");
      setPage("login");
   };

   if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />;
   }

   const renderPage = () => {
      switch (page) {
         case "operations":
            return (
               <OperationsPage
                  onNavigateToScan={() => setPage("scan")}
                  onNavigateToStatistics={() => setPage("statistics")}
                  onNavigateToSettings={() => setPage("settings")}
               />
            );
         case "scan":
            return <ScanPage onExit={() => setPage("operations")} />;
         case "statistics":
            return <Statistics />;
         case "settings":
            return <Settings onLogout={handleLogout} />;
         default:
            return <div>Page not found</div>;
      }
   };

   return <div className="p-6 min-h-screen bg-gray-100">{renderPage()}</div>;
}
