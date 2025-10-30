# Black Dynasty Forum

Full-stack forum with Node/Express + MongoDB (Atlas) and static frontend.

## Project Structure
- backend/ — Express API, Mongo/Mongoose, email, auth
- frontend/ — static HTML/CSS/JS (Netlify/Vercel friendly)

## Local Setup
1. Backend
   - cd backend
   - npm install
   - Create a .env file (do not commit!):
     - MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority
     - JWT_SECRET=<strong-secret>
     - FRONTEND_URL=http://localhost:5500
     - RECAPTCHA_BYPASS=true
     - (Optional SMTP) EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
   - npm start
2. Frontend
   - Serve frontend/ with any static server or use Netlify/Vercel

## Core Endpoints
- Auth: POST /api/auth/register, /login, GET /verify/:token, POST /resend-verification, /forgot-password, /reset-password
- Forum: categories, topics, comments CRUD; search, pagination, like, subscribe/bookmark
- Users: GET/PUT /api/users/me
- Admin: GET /api/admin/users, PUT /api/admin/users/:userId/role (admin only)

## Deployment (recommended)
- DB: MongoDB Atlas (free M0)
- Backend: Render or Railway (Web Service from backend/)
  - Env: MONGO_URI, JWT_SECRET, FRONTEND_URL, (SMTP or Ethereal fallback), (RECAPTCHA_BYPASS=true in dev or RECAPTCHA_SECRET_KEY in prod)
- Frontend: Netlify/Vercel (deploy frontend/)
  - Ensure fetch calls point to your backend origin (or define a simple API_BASE)

## Notes
- Email: falls back to Ethereal in dev; preview URL is printed in backend logs
- CORS: enabled; restrict origins in production
- Roles: set your user role to admin/moderator in MongoDB to enable moderation and admin panel (admin.html)
