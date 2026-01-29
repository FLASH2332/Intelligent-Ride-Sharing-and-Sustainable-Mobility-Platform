# Intelligent Ride Sharing and Sustainable Mobility Platform

## Setup

1. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd backend && npm install
   ```

2. **Environment variables**

   Create `.env` in `backend/` with:
     ```
     PORT=5000
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     EMAIL_USER=your_gmail_address
     EMAIL_PASS=your_gmail_app_password
     ```

## Development

**Branch workflow:**
- Use `dev` branch for development
- Push final changes to `main`

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
npm run dev
```

## Linting

**Run manually:**
```bash
npm --prefix frontend run lint
npm --prefix backend run lint
```

**Auto-fix:**
```bash
npm --prefix frontend run lint:fix
npm --prefix backend run lint:fix
```

**Pre-push hook:** Linting runs automatically before every `git push`.

## Project Structure

```
├── frontend/          # React + Vite
├── backend/           # Node.js + Express
└── .github/workflows/ # CI/CD
```