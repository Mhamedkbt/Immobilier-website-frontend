import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children }) {
  const [isAuth, setIsAuth] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkTokenExpiration = () => {
      const currentToken = localStorage.getItem("token");
      
      if (!currentToken) {
        setIsAuth(false);
        return;
      }

      try {
        const decoded = jwtDecode(currentToken);
        const now = Date.now() / 1000;

        if (decoded.exp < now) {
          console.log("Token expired. Logging out...");
          localStorage.removeItem("token");
          setIsAuth(false);
        }
      } catch (err) {
        localStorage.removeItem("token");
        setIsAuth(false);
      }
    };

    // 1. Check immediately when the component mounts
    checkTokenExpiration();

    // 2. Set an interval to check every 10 seconds (The "Auto-Fix")
    // This detects expiration without a page refresh
    const interval = setInterval(checkTokenExpiration, 10000);

    return () => clearInterval(interval); // Cleanup timer on unmount
  }, []);

  // If the state changes to false, React re-renders and hits this Navigate line
  if (!token || !isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}