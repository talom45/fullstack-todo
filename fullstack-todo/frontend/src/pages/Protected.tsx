import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Protected() {
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

        // Extract username from backend message: "Hello lom, you have accessed a protected route!"
        const message = res.data.message;
        const name = message.replace("Hello ", "").split(",")[0];
        setUsername(name);
      } catch (err: any) {
        setError("Unauthorized or server error");
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProtected();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Welcome, {username}!</h2>
      <p>This is your protected page before seeing your tasks.</p>
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>Logout</button>
    </div>
  );
}

export default Protected;

