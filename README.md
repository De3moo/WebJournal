# Web Journal System

A simple journal application where users can create, view, and manage their personal journal entries with image uploads.

## What's Built

✅ User Registration & Login
✅ Create Journal Entries
✅ View All Journals
✅ Delete Journals
✅ Upload Images (via Cloudinary)
✅ Date-based Journal Organization

## Tech Stack

**Backend:**
- Laravel 11
- PostgreSQL (Supabase)
- Laravel Sanctum (Authentication)
- Cloudinary (Image Storage)

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

### Step 4: Setup Cloudinary

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Create account / Login
3. Get credentials from Dashboard
4. Update `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
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

### Step 8: Open Application

Go to: **http://localhost:5173**

## How to Use

1. **Register** - Create a new account
2. **Login** - Sign in with your credentials
3. **Create Journal** - Fill in title, content, date, and optionally upload an image
4. **View Journals** - See all your journal entries below the form
5. **Delete Journal** - Remove journals you no longer want
6. **Logout** - Sign out when done

## Project Structure
```
web-journal-system/
│
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   ├── Auth/
│   │   │   │   └── AuthController.php
│   │   │   └── Api/
│   │   │       └── JournalController.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   └── Journal.php
│   │   └── Services/
│   │       └── CloudinaryService.php
│   └── routes/
│       └── api.php
│
└── frontend/                   # React App
    └── src/
        ├── components/
        │   ├── auth/
        │   │   ├── LoginForm.jsx
        │   │   └── RegisterForm.jsx
        │   └── journal/
        │       ├── JournalForm.jsx
        │       └── JournalList.jsx
        └── services/
            ├── api.js
            ├── authService.js
            └── journalService.js
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/me` - Get current user

### Journals
- `GET /api/journals` - Get all user journals
- `POST /api/journals` - Create new journal
- `GET /api/journals/{id}` - Get single journal
- `PUT /api/journals/{id}` - Update journal
- `DELETE /api/journals/{id}` - Delete journal

## Common Issues

### Issue: Database Connection Failed
**Solution:**
- Check Supabase credentials in `.env`
- Make sure Supabase project is active (not paused)
- Verify internet connection
```bash
# Test connection
cd backend
php artisan migrate:status
```

### Issue: Image Upload Failed
**Solution:**
- Verify Cloudinary credentials in `.env`
- Check image size (max 5MB)
- Ensure image format is jpeg, png, jpg, or gif

### Issue: Can't Register/Login
**Solution:**
```bash
# Clear caches
cd backend
php artisan config:clear
php artisan cache:clear

# Restart server
php artisan serve
```

### Issue: Frontend Not Loading
**Solution:**
```bash
# Reinstall dependencies
cd frontend
rm -rf node_modules
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```env
# Database
DB_CONNECTION=pgsql
DB_HOST=your_supabase_host
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
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

## Features to Add (Future)

- [ ] Edit journal entries
- [ ] Search journals
- [ ] Filter by date range
- [ ] Calendar view
- [ ] Tags/categories
- [ ] Export journals
- [ ] Rich text editor

## Notes

- This is a development setup
- No password reset functionality yet
- Images stored in Cloudinary
- Session-based authentication with Sanctum tokens

## Support

If you encounter issues:
1. Check console for errors (F12 in browser)
2. Verify both servers are running
3. Check `.env` files are configured correctly
4. Clear browser cache and try again

---

**Created:** February 2024
**Stack:** Laravel 11 + React 18 + Supabase + Cloudinary