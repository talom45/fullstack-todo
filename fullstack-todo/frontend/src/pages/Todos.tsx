// src/pages/Todos.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

const Todos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Fetch todos from backend
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


  // Redirect to login if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchTodos(); // only fetch if token exists
    }
  }, [token]);

  // Add a new todo
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

  // Toggle todo done/undone
  const toggleDone = async (todo: Todo) => {
    if (!token) return;
    try {
      const updatedTodo = { ...todo, done: !todo.done };
      await axios.put(`http://127.0.0.1:8000/todos/${todo.id}`, updatedTodo, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTodos(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  // Delete a todo
  const deleteTodo = async (id: number) => {
    if (!token) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTodos(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Todos</h1>

      {/* Add todo */}
      <div className="flex mb-4">
        <input
          type="text"
          className="border p-2 flex-1 mr-2"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Loading */}
      {loading && <p>Loading todos...</p>}

      {/* List todos */}
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="border p-2 mb-2 flex justify-between items-center"
          >
            <span
              style={{
                textDecoration: todo.done ? "line-through" : "none",
                cursor: "pointer",
              }}
              onClick={() => toggleDone(todo)}
            >
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Todos;

