import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Protected() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
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
        setMessage(res.data.message);
      } catch (err: any) {
        setError("Unauthorized or server error");
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

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Protected Page</h2>
      {error ? <p style={{ color: "red" }}>{error}</p> : <p>{message}</p>}
      <button onClick={handleLogout} style={{ marginTop: "1rem" }}>Logout</button>
    </div>
  );
}

export default Protected;
