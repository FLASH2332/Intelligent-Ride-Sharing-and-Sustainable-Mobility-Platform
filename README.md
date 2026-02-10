# Intelligent Ride Sharing and Sustainable Mobility Platform

Multi-role carpooling platform with organization-based access control, driver matching, and real-time ride tracking.

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Socket.io (real-time tracking)
- Multer (file uploads)
- Nodemailer (email notifications)
- Jest (testing)

**Frontend:**
- React 19 + Vite
- React Router
- Tailwind CSS
- Leaflet + React Leaflet (maps)
- Lucide React (icons)
- Vitest (testing)

## Features

**Authentication & Authorization:**
- Multi-role system: Platform Admin, Organization Admin, Employee/Passenger, Driver
- JWT-based authentication
- Password reset via email
- Organization-based access control

**User Management:**
- Employee registration and approval workflow
- Profile completion
- Driver registration with document upload
- Admin approval for driver access

**Trip & Ride Management:**
- Trip creation by drivers
- Location-based trip search
- Ride request and matching system
- Driver approval/rejection of ride requests
- Real-time trip status updates
- Passenger pickup and dropoff tracking

**Real-time Features:**
- Live driver location tracking
- Socket.io integration for real-time updates

## API Routes

**Authentication (`/auth`)**
- `POST /register` - Employee registration
- `POST /login` - User login
- `POST /forgot-password` - Request password reset
- `POST /reset-password/:token` - Reset password

**Platform Admin (`/platform`)**
- `POST /organizations` - Create organization
- `POST /org-admins` - Create organization admin

**Organization Admin (`/org-admin`)**
- `GET /pending-users` - List pending employees
- `POST /approve-user` - Approve employee
- `GET /driver-requests` - List driver requests
- `POST /driver-requests/:id/approve` - Approve driver
- `POST /driver-requests/:id/reject` - Reject driver

**User (`/api/users`)**
- `GET /me` - Get user profile
- `PUT /complete-profile` - Complete profile
- `POST /driver-intent` - Request driver access

**Driver (`/driver`)**
- `POST /upload-documents` - Upload license and RC documents

**Trips (`/api/trips`)**
- `POST /trips` - Create trip (driver only)
- `GET /trips/search` - Search trips by location
- `GET /trips/:id` - Get trip details
- `GET /trips/driver/trips` - Get driver's trips
- `POST /trips/:id/start` - Start trip
- `POST /trips/:id/complete` - Complete trip
- `POST /trips/:id/cancel` - Cancel trip
- `POST /trips/:id/location` - Update driver location

**Rides (`/api/rides`)**
- `POST /rides/request` - Request ride
- `GET /rides/trip/:tripId` - Get ride requests for trip (driver)
- `GET /rides/passenger/rides` - Get passenger's rides
- `POST /rides/:id/approve` - Approve ride request (driver)
- `POST /rides/:id/reject` - Reject ride request (driver)
- `POST /rides/:id/pickup` - Mark passenger as picked up
- `POST /rides/:id/dropoff` - Mark passenger as dropped off

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

## Testing

**Backend (Jest):**
```bash
cd backend
npm test
npm run test:watch
npm run test:coverage
```

**Frontend (Vitest):**
```bash
cd frontend
npm test
npm run test:ui
npm run test:coverage
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