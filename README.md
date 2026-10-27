# TaskFlow

TaskFlow is a full-stack task management application with a React/Vite client and an Express/MongoDB API. It supports cookie-based JWT authentication, user-owned task CRUD, dashboard statistics, search, sorting, status and priority management, responsive layouts, and validation.

## Stack

- **Client:** React, Vite, React Router, Axios, Lucide React, React Hot Toast, Tailwind CSS
- **Server:** Node.js, Express, Mongoose, JWT, bcryptjs, Zod, Helmet, CORS, rate limiting
- **Database:** MongoDB (local or Atlas)

## Prerequisites

- Node.js 20 LTS or newer
- MongoDB Community Server running locally, or a MongoDB Atlas connection string

## Windows PowerShell setup

From the project directory:

```powershell
npm install
npm run install:all
Copy-Item server\.env.example server\.env
```

Edit `server\.env` and set a long random `JWT_SECRET`. The default local MongoDB URI is ready to use. For Atlas, set `MONGODB_URI` to the connection string provided by Atlas and allow your IP in Atlas Network Access.

Start both applications:

```powershell
npm run dev
```

The client runs at `http://localhost:6100` and the API at `http://localhost:6000`. During development, Vite proxies `/api` requests from the client to port 6000, avoiding browser restrictions on direct requests to that port. To run individually, use `npm run dev --prefix server` and `npm run dev --prefix client`.

## Features

- Register, sign in, sign out, and refresh-safe authentication
- Secure HttpOnly JWT cookie; password hashes are never returned
- Create, edit, complete/reopen, and delete tasks
- Search title/description and sort by creation date, due date, or priority
- Dashboard counts and completion percentage calculated from MongoDB
- Upcoming, completed, and personal task views
- Responsive mobile navigation, empty states, loading states, and toast feedback
- Authentication rate limiting, Helmet, CORS, request size limits, and server-side validation

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET|POST /api/tasks`
- `GET|PUT|DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `GET /api/dashboard/stats`

All task and dashboard endpoints require the authenticated cookie. Ownership is always derived from the verified JWT, not from request input.

## Folder structure

```text
client/src/App.jsx             React routes and dashboard UI
client/src/context             Authentication state
client/src/services             Axios API client
server/src/models               Mongoose User and Task schemas
server/src/routes                REST endpoints
server/src/middleware            Auth, validation, and error handling
```

## Troubleshooting

- **MongoNetworkError:** confirm MongoDB is running or verify the Atlas URI and IP allowlist.
- **Missing required environment variable:** copy `.env.example` to `.env` and fill every value.
- **CORS error:** make sure `CLIENT_URL=http://localhost:6100` matches the URL in the browser.
- **Port in use:** change `PORT` in `server\.env` or the Vite port in `client\vite.config.js`.

For production, use HTTPS, set `NODE_ENV=production`, use a strong unique secret, use an allowlisted frontend origin, and keep the cookie `secure` setting enabled.

## Future improvements

Pagination controls, drag-and-drop ordering, email reminders, richer profile preferences, and authenticated real-time collaboration can be added without changing the ownership model.
