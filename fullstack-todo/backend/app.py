from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# In-memory store for users
users_db = {}
# In-memory store for tokens
tokens_db = {}
#In-memory store for todos per user
todos_db = {}

@app.get("/")
def home():
    return {"message": "Hello FastAPI backend is running!"}


# Pydantic models
class User(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    token: str

# Register endpoint
@app.post("/register")
def register(user: User):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    users_db[user.username] = user.password
    return {"message": "User registered successfully"}

# Login endpoint
@app.post("/login", response_model=TokenResponse)
def login(user: User):
    stored_password = users_db.get(user.username)
    if not stored_password or stored_password != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Create a mock token (just username reversed + 'token')
    token = user.username[::-1] + "_token"
    tokens_db[token] = user.username
    return {"token": token}

# Protected endpoint
@app.get("/protected")
def protected(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.replace("Bearer ", "")
    username = tokens_db.get(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"message": f"Hello {username}, you have accessed a protected route!"}

class TodoIteam(BaseModel):
    title: str
    done: bool = False
    
class TodoResponse(TodoIteam):
    id: int
    
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorisation header")
    token = authorization.replace("Bearer", "")
    username = tokens_db.get(token)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    return username

@app.post("/todos", response_model=TodoResponse)
def create_todo(todo: TodoIteam, username: str = Depends(get_current_user)):
    todos_db.setdefault(username, [])
    todo_id = len(todos_db[username]) + 1
    todo_data = {"id": todo_id, "title": todo.title, "done": todo.done}
    todos_db[username].append(todo_data)
    return todo_data

@app.get("/todos" , response_model=list[TodoResponse])
def get_todos(username: str = Depends(get_current_user)):
    return todos_db.get(username, [])

@app.get("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, todo: TodoIteam, username: str = Depends(get_current_user)):
    user_todos = todos_db.get(username, [])
    for t in user_todos:
        if t["id"] == todo_id:
            t["title"] = todo.title
            t["done"] = todo.done
            return t
        raise HTTPException(status_code=404, detail="To-Do not found")

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, username: str = Depends(get_current_user)):
    user_todos = todos_db.get(username, [])
    for i, t in enumerate(user_todos):
        if t["id"] == todo_id:
            user_todos.pop(i)
            return{"message": "To-Do deleted"}
        raise HTTPException(status_code=404, detail = "To-Do not found")
    
    
