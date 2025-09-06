from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional

app = FastAPI()

# In-memory store for users
users_db = {}
# In-memory store for tokens
tokens_db = {}

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
