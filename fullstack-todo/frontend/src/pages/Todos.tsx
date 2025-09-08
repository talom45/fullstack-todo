import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

interface Todo {
  id: string;
  title: string;
  done: boolean;
}

export default function Todos() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTodos = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchTodos();
    }
  }, [token]);

  const addTodo = async () => {
    if (!newTodo.trim() || !token) return;
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/todos",
        { title: newTodo, done: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTodos([...todos, res.data]);
      setNewTodo("");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDone = async (todo: Todo) => {
    if (!token) return;
    try {
      const updatedTodo = { ...todo, done: !todo.done };
      await axios.put(`http://127.0.0.1:8000/todos/${todo.id}`, updatedTodo, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTodo = async (id: string) => {
    if (!token) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="todo-container">
      <h2>My Todos</h2>
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Add new todo"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          style={{ flex: 1, marginRight: "0.5rem", padding: "0.5rem" }}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      {loading ? <Spinner /> : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id}>
              <span
                className={todo.done ? "done" : ""}
                onClick={() => toggleDone(todo)}
              >
                {todo.title}
              </span>
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
