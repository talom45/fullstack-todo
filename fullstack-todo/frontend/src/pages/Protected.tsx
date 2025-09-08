import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/Spinner";

export default function Protected() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProtected = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/protected", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const message = res.data.message;
        const name = message.replace("Hello ", "").split(",")[0];
        setUsername(name);
      } catch {
        setError("Unauthorized or server error");
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProtected();
  }, [navigate]);

  if (loading) return <Spinner />;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="form-container">
      <h2>Welcome, {username}!</h2>
      <p>This is your protected page before seeing your tasks.</p>
    </div>
  );
}
