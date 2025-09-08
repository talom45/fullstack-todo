import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";

interface Todo {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string | null; // optional due date
}

export default function Todos() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔔 Check reminders and show notifications
  const checkReminders = (todos: Todo[]) => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    todos.forEach((todo) => {
      if (!todo.dueDate) return;
      const due = new Date(todo.dueDate);
      const diff = due.getTime() - now.getTime();

      if (diff > 0 && diff < oneDay) {
        showNotification(`Reminder: "${todo.title}" is tomorrow!`);
      } else if (due.toDateString() === now.toDateString()) {
        showNotification(`Reminder: "${todo.title}" is today!`);
      }
    });
  };

  // 🔔 Helper: show browser notification
  const showNotification = (message: string) => {
    if (!("Notification" in window)) {
      alert(message); // fallback if browser doesn’t support notifications
      return;
    }
    if (Notification.permission === "granted") {
      new Notification(message);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(message);
        }
      });
    }
  };

  const fetchTodos = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/todos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(res.data);

      // ✅ Run reminders immediately after login/fetch
      checkReminders(res.data);
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

  // Background reminder loop (every 1 min)
  useEffect(() => {
    const interval = setInterval(() => checkReminders(todos), 60 * 1000);
    return () => clearInterval(interval);
  }, [todos]);

  // Parse @date when adding todos
  const addTodo = async () => {
    if (!newTodo.trim() || !token) return;

    let title = newTodo;
    let dueDate: string | null = null;

    const match = newTodo.match(/@(.*)/);
    if (match) {
      const parsed = new Date(match[1].trim());
      if (!isNaN(parsed.getTime())) {
        dueDate = parsed.toISOString();
        title = newTodo.replace(match[0], "").trim();
      }
    }

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/todos",
        { title, done: false, dueDate },
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="todo-container">
      <h2>My Tasks</h2>
      <div className="inputbx">
        <input
          id="new-todo"
          type="text"
          placeholder='Add new todo (e.g. "Birthday @6 September 2024")'
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id}>
              <span
                className={todo.done ? "done" : ""}
                onClick={() => toggleDone(todo)}
              >
                {todo.title}
              </span>
              {todo.dueDate && (
                <span className="task-date">
                  {new Date(todo.dueDate).toLocaleDateString()}
                </span>
              )}
              <button onClick={() => deleteTodo(todo.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleLogout} className="logout">
        Logout
      </button>
    </div>
  );
}
