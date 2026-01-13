# Task Management API - FastAPI Backend

## Setup

### 1. Create virtual environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env with your database credentials and secret key
```

### 4. Create PostgreSQL database
```sql
CREATE DATABASE taskdb;
```

### 5. Run the server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Profiles
- `GET /api/profiles` - List all profiles
- `GET /api/profiles/{id}` - Get profile by ID
- `PUT /api/profiles/{id}` - Update profile

### Users & Roles
- `GET /api/users` - List users with roles
- `GET /api/users/user-roles/{user_id}` - Get user role
- `PUT /api/users/user-roles/{user_id}` - Update user role (admin only)

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project with members
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/projects/{id}/members` - Add member
- `DELETE /api/projects/{id}/members/{user_id}` - Remove member

### Tasks
- `GET /api/tasks` - List tasks (optional: ?project_id=)
- `POST /api/tasks` - Create task
- `GET /api/tasks/{id}` - Get task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Comments
- `GET /api/tasks/{task_id}/comments` - List comments
- `POST /api/tasks/{task_id}/comments` - Create comment
- `DELETE /api/comments/{id}` - Delete comment

### Audit Logs (Admin only)
- `GET /api/audit-logs` - List audit logs (optional: ?limit=&task_id=)

## Database Schema

The API automatically creates all tables on startup. Tables include:
- `users` - Authentication credentials
- `profiles` - User profile information
- `user_roles` - User roles (admin/user)
- `projects` - Projects
- `project_members` - Project membership
- `tasks` - Tasks with status, priority, assignments
- `comments` - Task comments
- `audit_logs` - Activity tracking

## Frontend Configuration

Set in your frontend `.env.local`:
```
VITE_API_URL=http://localhost:8000/api
```
