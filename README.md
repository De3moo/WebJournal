# Web Journal System

A simple journal application where users can create, view, and manage their personal journal entries with image uploads.



## Tech Stack

**Backend:**
- Laravel 11
- PostgreSQL (Supabase)
- Laravel Sanctum (Authentication)

**Frontend:**
- React 18 + Vite
- Axios
- Basic CSS

## Prerequisites

Before you start, make sure you have:

- PHP 8.2 or higher
- Composer
- Node.js 18 or higher
- npm

## Installation Guide

### Step 1: Clone the Project
```bash
git clone <your-repo-url>
cd web-journal-system
```

### Step 2: Backend Setup
```bash
# Go to backend folder
cd backend

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 3: Setup Database (Supabase)

1. Go to [https://supabase.com](https://supabase.com)
2. Create new project
3. Get your database credentials from **Settings → Database**
4. Update `backend/.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your_password
```



### Step 5: Run Database Migrations
```bash
# Still in backend folder
php artisan migrate
```

### Step 6: Frontend Setup
```bash
# Go to frontend folder
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env
```

### Step 7: Start the Application

Open **two terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```
Backend runs on: `http://localhost:8000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173`




## Environment Variables

### Backend (.env)
```env
# Database

DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=
DB_SSLMODE=require
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=
APP_DEBUG=true
APP_ENV=local

```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## Development Commands

### Backend
```bash
# Start server
php artisan serve

# Run migrations
php artisan migrate

# Clear caches
php artisan config:clear
php artisan cache:clear

# View routes
php artisan route:list
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build
```

## Full Summary Table

| Requirement | Problem | Solution in Your Code |
|---|---|---|
| SQL Injection | Raw SQL manipulation via input | Use Eloquent ORM and PDO prepared statements; avoid concatenating user input into raw queries |
| XSS | Malicious scripts stored and executed | Server-side sanitization (e.g. `HTMLPurifier` in `JournalController`) + React's default escaping on the frontend |
| Weak Credential Storage | Plain/weak password hashes | Use `Hash::make()` when storing passwords and ensure secure hashing driver (`Bcrypt`/`Argon2id`) via `config/hashing.php` |
| File Handling | Malicious files disguised as images | Validate uploads with `mimes:`/`image:` rules and size limits; offload to Cloudinary or Supabase Storage which serve files with safe `Content-Type` headers |
| Transport Encryption | Plaintext data over HTTP | Force HTTPS (e.g. in `AppServiceProvider`) and set secure cookie flags (`secure`, `same_site`) in `config/session.php`/`config/cookie.php` for production |
| Session Control / Token Revocation | Tokens persist after logout allowing reuse | Revoke server-side tokens on logout (Sanctum token deletion), clear client `localStorage`, and implement a `401` response interceptor to force re-authentication |