# Full-Stack Todo Application

A sleek, modern, and fully functional **Todo application** built with **FastAPI** (backend) and **React + TypeScript** (frontend).  
Users can register, log in, manage tasks, and optionally set due dates with reminders.

---

## Features

- **User Authentication**
  - Register and login securely.
  - Passwords are hashed with bcrypt.
  - Token-based authorization for protected routes.

- **Todo Management**
  - Add, update, delete, and mark tasks as done.
  - Assign due dates using `@date` syntax (e.g., `Birthday @6 September 2024`).
  - Each user has a separate task list.

- **Task Reminders**
  - Frontend parses task due dates for reminders.
  - Optional pop-up notifications for tasks due today or tomorrow.
  - Future improvement: fully automatic reminders.

- **UI / UX**
  - Clean, minimalist design with Tailwind CSS.
  - Responsive layout for desktop and mobile.
  - Logout button at the bottom of the todo list.

---

## Tech Stack

- **Frontend**
  - React + TypeScript
  - Tailwind CSS for styling
  - Axios for API requests

- **Backend**
  - FastAPI
  - Pydantic for data validation
  - In-memory storage (can be upgraded to a database)
  - Passwords hashed with bcrypt
  - Logging requests and errors to `app.log`

- **Other**
  - CORS enabled for development ports
  - Optional browser notifications for reminders

---

## Security Considerations

The project follows basic security best practices:

- **Password Protection:** Passwords are hashed using bcrypt before storage.
- **Token Authentication:** Protected endpoints require a valid Bearer token.
- **Input Validation:** Pydantic models validate all inputs.
- **Logging:** Requests and errors are logged for auditing.
- **CORS:** Restricted to frontend development origins.

> ⚠️ Note: This is a demo project. For production:
> - Use a persistent database instead of in-memory storage.
> - Consider JWT tokens with expiration.
> - Serve over HTTPS.

---

## Setup Instructions

### Backend

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
````

2. Install dependencies:

```bash
pip install fastapi uvicorn pydantic passlib[bcrypt]
```

3. Run the server:

```bash
uvicorn app:app --reload
```

Backend runs at `http://127.0.0.1:8000`.

---

### Frontend

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm start
```

Frontend runs at `http://localhost:5173`.

---

## Usage

1. Register a new user.
2. Log in and receive a token.
3. Access the protected Todo page.
4. Add tasks using the input box; optionally include `@date` for due dates.
5. Mark tasks as done, delete tasks, or log out.
6. (Optional) Pop-up notifications alert you of tasks due today or tomorrow.

---

## Logging

* All user actions, requests, and errors are logged in `app.log`.
* Example log entries:

```
2025-09-09 14:23:45 - INFO - User john_doe created todo: Buy milk
2025-09-09 14:25:12 - WARNING - Invalid token attempt: fake_token
```

---

## Future Improvements

* Reliable, automatic reminders for tasks based on due dates.
* Persistent database storage (e.g., SQLite, PostgreSQL).
* JWT tokens with expiration and refresh support.
* Visual indicators for tasks due today/tomorrow.
* Calendar view and task filtering.

---

## License

MIT License
