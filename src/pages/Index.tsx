
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "../components/Login";
import Register from "../components/Register";
import Dashboard from "../components/Dashboard";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userUID, setUserUID] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      <Routes>
        <Route 
          path="/login" 
          element={
            isLoggedIn ? 
            <Navigate to="/dashboard" /> : 
            <Login setIsLoggedIn={setIsLoggedIn} setUserUID={setUserUID} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isLoggedIn ? 
            <Navigate to="/dashboard" /> : 
            <Register />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isLoggedIn ? 
            <Dashboard userUID={userUID} setIsLoggedIn={setIsLoggedIn} /> : 
            <Navigate to="/login" />
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </div>
  );
};

export default Index;
