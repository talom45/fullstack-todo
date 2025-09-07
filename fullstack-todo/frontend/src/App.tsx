import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Protected from "./pages/Protected";
import Todos from "./pages/Todos";
import React from "react";

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <nav style={{ padding: "1rem" }}>
        {!token && (
          <>
            <Link to="/register" style={{ marginRight: "1rem" }}>Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
        {token && <button onClick={handleLogout}>Logout</button>}
      </nav>

      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/protected" element={<Protected />} />
        <Route path="/todos" element={<Todos />} />
      </Routes>
    </div>
  );
}

export default App;


