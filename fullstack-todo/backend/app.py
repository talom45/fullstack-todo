from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for users
users_db = {}
# In-memory store for tokens
tokens_db = {}
# In-memory store for todos per user
todos_db = {}

@app.get("/")
def home():
    return {"message": "Hello FastAPI backend is running!"}

# Auth models

class User(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    token: str

# Register/Login
@app.post("/register")
def register(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    users_db[user.username] = user.password
    return {"message": "User registered successfully"}

@app.post("/login", response_model=TokenResponse)
def login(user: User):
    stored_password = users_db.get(user.username)
    if not stored_password or stored_password != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = user.username[::-1] + "_token"
    tokens_db[token] = user.username
    return {"token": token}

@app.get("/protected")
def protected(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.replace("Bearer ", "")
    username = tokens_db.get(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"message": f"Hello {username}, you have accessed a protected route!"}

# To-Do models
class TodoItem(BaseModel):
    title: str
    done: bool = False
    due_date: Optional[datetime] = None  # Added field

class TodoResponse(TodoItem):
    id: int

# Helpers
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.replace("Bearer ", "")
    username = tokens_db.get(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    return username

# To-Do endpoints
@app.post("/todos", response_model=TodoResponse)
def create_todo(todo: TodoItem, username: str = Depends(get_current_user)):
    todos_db.setdefault(username, [])
    todo_id = len(todos_db[username]) + 1
    todo_data = {
        "id": todo_id,
        "title": todo.title,
        "done": todo.done,
        "due_date": todo.due_date
    }
    todos_db[username].append(todo_data)
    return todo_data

@app.get("/todos", response_model=list[TodoResponse])
def get_todos(username: str = Depends(get_current_user)):
    return todos_db.get(username, [])

@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo: TodoItem, username: str = Depends(get_current_user)):
    user_todos = todos_db.get(username, [])
    for t in user_todos:
        if t["id"] == todo_id:
            t["title"] = todo.title
            t["done"] = todo.done
            t["due_date"] = todo.due_date
            return t
    raise HTTPException(status_code=404, detail="To-Do not found")

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, username: str = Depends(get_current_user)):
    user_todos = todos_db.get(username, [])
    for i, t in enumerate(user_todos):
        if t["id"] == todo_id:
            user_todos.pop(i)
            return {"message": "To-Do deleted"}
    raise HTTPException(status_code=404, detail="To-Do not found")