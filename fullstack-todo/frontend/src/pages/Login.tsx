import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/Spinner";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/login", { username, password });
      localStorage.setItem("token", res.data.token);
      navigate("/todos");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container min-h-screen bg-gray-100 flex flex-col items-center justify-start pt-24">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="form-box">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? <Spinner /> : "Login"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
