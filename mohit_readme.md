# Mohit's Build Guide & Progress Log

This file tracks all the exact commands and setup steps executed during the construction of the **Smart Learning** platform.

---

## 🛠️ Step 1: Scaffold React Frontend (`/frontend`)

### 1.1: Initialize Vite React Project
Run the following commands in the project root:
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
```
*Status: Completed*

### 1.2: Install Frontend Dependencies
Run the following command inside the `frontend` directory:
```bash
npm install react-router-dom axios react-hook-form framer-motion react-icons jspdf
```
*Status: Completed*

### 1.3: Install & Configure Tailwind CSS (v4)
Run the following commands inside the `frontend` directory:
```bash
# 1. Install Tailwind CSS v4 and the official Vite plugin
npm install tailwindcss @tailwindcss/vite
```
*(Note: Since you have Tailwind v4, we use the official `@tailwindcss/vite` plugin instead of PostCSS. `vite.config.js` and `src/index.css` have been configured accordingly. You can safely delete `tailwind.config.js` and `postcss.config.js` as they are no longer needed in v4.)*

*Status: Completed*

*Status: Completed*

---

## ⚙️ Step 2: Initialize Django Backend (`/backend`)

### 2.1: Setup Virtual Environment & Install Django
Run the following commands in the project root (`smart_learning`):
```bash
# 1. Create and navigate to the backend folder
mkdir backend
cd backend

# 2. Create a Python virtual environment
python -m venv venv

# 3. Activate the virtual environment (Windows PowerShell)
venv\Scripts\Activate.ps1

# 4. Install packages using requirements.txt (already created in backend/ folder)
pip install -r requirements.txt
```
*Status: Completed*

### 2.2: Create Django Project and API App
Run the following commands inside the `backend` folder (make sure virtual environment is active):
```bash
# 1. Create the core Django project structure in the current directory
django-admin startproject core .

# 2. Create the api app folder
python manage.py startapp api
```
*Status: Completed*

*(Note: `core/settings.py` has been configured with CORS, REST Framework, Simple JWT, and custom AUTH_USER_MODEL. `api/models.py` has been updated with a Custom User model.)*

*Status: Completed*

### 2.4: Run Initial Migrations & Start Server
Run the following commands inside the `backend` folder (virtual environment active):
```bash
# 1. Create migrations for our custom User model
python manage.py makemigrations

# 2. Apply migrations to create the database tables
python manage.py migrate

# 3. Run the development server
python manage.py runserver
```
*Status: Completed*

---

## 🐳 Step 3: Configure Docker & Database (`docker-compose.yml`)

### 3.1: Verify Docker Configurations
I have created the configuration files:
- **`docker-compose.yml`** (root): Runs PostgreSQL (`db`), Django (`backend`), and React Vite (`frontend`).
- **`backend/Dockerfile`**: Configures the python runtime environment.
- **`frontend/Dockerfile`**: Configures the Node runtime environment.
- **`backend/core/settings.py`**: Updated to automatically detect the PostgreSQL container database when running in Docker.

### 3.2: Run the Docker Stack
Run the following command in the **project root directory** (`smart_learning`):
```bash
# Build and run all containers in the foreground
docker-compose up --build
```
*Status: Pending*






