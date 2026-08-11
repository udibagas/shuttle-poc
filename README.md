# Shuttle POC - Port Transportation Management System

A Proof of Concept (POC) for a simple shuttle transportation management system designed for port operations. This system enables users to request shuttle services, drivers to accept and manage trips, and administrators to monitor operations in real-time.

## 🎯 Overview

This is **NOT a consumer ride-hailing application** like Uber or Grab. It's designed specifically for controlled port environments where users request shuttle transportation between predefined locations such as gates, terminals, warehouses, workshops, and offices.

## 🏗️ Architecture

### Technology Stack

**Frontend:**

- React 18
- Vite
- TypeScript
- React Router
- Tailwind CSS
- TanStack Query (React Query)
- WebSocket client

**Backend:**

- ElysiaJS
- Bun runtime
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- WebSocket for real-time events

**Infrastructure:**

- Docker & Docker Compose
- PostgreSQL 16

**Package Manager:**

- pnpm (monorepo)

### Project Structure

```
shuttle-poc/
├── apps/
│   ├── api/              # Backend API (ElysiaJS + Bun)
│   │   ├── src/
│   │   │   ├── routes/   # API route handlers
│   │   │   ├── utils/    # Utilities (auth, db, errors)
│   │   │   ├── middleware/
│   │   │   ├── tests/    # Business logic tests
│   │   │   ├── websocket.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── web/              # Frontend (React + Vite)
│       ├── src/
│       │   ├── components/
│       │   ├── contexts/
│       │   ├── hooks/
│       │   ├── lib/
│       │   ├── pages/
│       │   │   ├── user/
│       │   │   ├── driver/
│       │   │   └── admin/
│       │   └── App.tsx
│       └── package.json
│
├── packages/
│   └── types/            # Shared TypeScript types
│
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## 👥 User Roles

### 1. USER (Passenger)

- Login to the system
- View available locations
- Create shuttle booking requests
- View current active booking
- View booking history
- Cancel pending bookings

### 2. DRIVER

- Login to the system
- Change availability status (OFFLINE/ONLINE)
- Receive available shuttle requests in real-time
- Accept or reject booking requests
- View assigned bookings
- Mark arrival at pickup location
- Start trip
- Complete trip
- View trip history

### 3. ADMIN (Operations)

- Login to the system
- View operations dashboard with statistics
- Monitor all bookings
- View driver status and availability
- View all users
- View vehicles
- Manage predefined locations

## 🔄 Booking State Machine

### Booking Statuses

```
PENDING → ASSIGNED → DRIVER_ARRIVED → IN_PROGRESS → COMPLETED
   ↓
CANCELLED
```

### Valid State Transitions

- **PENDING** → ASSIGNED (when driver accepts)
- **PENDING** → CANCELLED (when user cancels)
- **ASSIGNED** → DRIVER_ARRIVED (when driver marks arrival)
- **DRIVER_ARRIVED** → IN_PROGRESS (when driver starts trip)
- **IN_PROGRESS** → COMPLETED (when driver completes trip)

### Driver Rejection Handling

When a driver rejects a booking:

- The booking status remains **PENDING**
- A record is created in `booking_driver_attempts` table with status `REJECTED`
- The booking remains available for other drivers
- This creates an audit trail of all driver responses

Example:

```
Booking #SH-000123
├── Driver A → REJECTED
├── Driver B → REJECTED
└── Driver C → ACCEPTED ✓
```

## 📊 Database Models

### User

- Stores user credentials and role
- Roles: USER, DRIVER, ADMIN
- Passwords are hashed using bcrypt

### Driver

- Links user to driver profile
- Tracks driver status (OFFLINE/ONLINE/BUSY)
- Associates with vehicle

### Vehicle

- Vehicle information (plate number, type, capacity)
- Types: MINIBUS, VAN, BUS

### Location

- Predefined operational locations
- Types: GATE, TERMINAL, WAREHOUSE, WORKSHOP, OFFICE, OTHER
- Includes coordinates (for future GPS integration)

### Booking

- Main booking record
- Human-readable booking number (SH-000001)
- Tracks all timestamps (requested, assigned, arrived, started, completed)
- Links to user, driver, and locations

### BookingDriverAttempt

- Audit trail of driver responses
- Tracks which drivers accepted/rejected each booking
- Prevents duplicate assignments

## 🔐 Authentication

### JWT-based Authentication

- Login endpoint: `POST /auth/login`
- Token stored in localStorage
- Token sent in Authorization header: `Bearer <token>`

### Role-based Authorization

- Middleware validates user role for protected endpoints
- Users can only access endpoints for their role
- Example: USER cannot access DRIVER or ADMIN endpoints

## 🌐 API Endpoints

### Authentication

```
POST /auth/login          # Login with username/password
GET  /auth/me             # Get current user info
```

### Locations

```
GET  /locations           # List all active locations
GET  /locations/:id       # Get location by ID
POST /locations           # Create location (ADMIN only)
PUT  /locations/:id       # Update location (ADMIN only)
DELETE /locations/:id     # Delete location (ADMIN only)
```

### Bookings (User)

```
POST /bookings            # Create new booking
GET  /bookings            # List user's bookings
GET  /bookings/:id        # Get booking details
POST /bookings/:id/cancel # Cancel pending booking
```

### Driver Operations

```
GET  /driver/profile                      # Get driver profile
POST /driver/status                       # Update driver status
GET  /driver/bookings/available           # List available bookings
POST /driver/bookings/:id/accept          # Accept booking
POST /driver/bookings/:id/reject          # Reject booking
POST /driver/bookings/:id/arrived         # Mark arrival
POST /driver/bookings/:id/start           # Start trip
POST /driver/bookings/:id/complete        # Complete trip
```

### Admin Operations

```
GET /admin/dashboard      # Dashboard statistics
GET /admin/bookings       # All bookings
GET /admin/drivers        # All drivers
GET /admin/users          # All users
GET /admin/vehicles       # All vehicles
```

## 🔌 WebSocket Events

Real-time events are broadcast via WebSocket at `ws://localhost:3000/ws`

### Event Types

- `booking.created` - New booking request created
- `booking.assigned` - Booking assigned to driver
- `booking.driver_arrived` - Driver arrived at pickup
- `booking.started` - Trip started
- `booking.completed` - Trip completed
- `booking.cancelled` - Booking cancelled
- `driver.status_changed` - Driver status updated

### Event Structure

```json
{
  "event": "booking.assigned",
  "data": {
    "bookingId": "...",
    "bookingNumber": "SH-000123",
    "driver": { ... }
  }
}
```

## 🚀 Getting Started

### Prerequisites

- **Bun** >= 1.0.0 ([Install Bun](https://bun.sh))
- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Docker** & **Docker Compose**

### Installation Steps

1. **Clone the repository**

   ```bash
   cd /path/to/shuttle-poc
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Copy environment file**

   ```bash
   cp .env.example .env
   ```

4. **Start PostgreSQL**

   ```bash
   docker compose up -d
   ```

5. **Run database migrations**

   ```bash
   pnpm db:migrate
   ```

6. **Seed the database**

   ```bash
   pnpm db:seed
   ```

7. **Start development servers**

   ```bash
   pnpm dev
   ```

   This will start:
   - API Server: http://localhost:3000
   - Web App: http://localhost:5173
   - WebSocket: ws://localhost:3000/ws

## 🔑 Demo Credentials

⚠️ **WARNING: These are demo credentials for POC purposes only. DO NOT use in production!**

### Admin

- Username: `admin`
- Password: `password`

### Users

- Username: `user01` / Password: `password`
- Username: `user02` / Password: `password`
- Username: `user03` / Password: `password`

### Drivers

- Username: `driver01` / Password: `password` (ONLINE)
- Username: `driver02` / Password: `password` (OFFLINE)
- Username: `driver03` / Password: `password` (ONLINE)

## 🧪 Testing

### Run Backend Tests

```bash
cd apps/api
bun test
```

### Test Coverage

Tests cover the following scenarios:

1. User can create booking
2. Driver can reject booking
3. Driver can accept booking
4. Second driver cannot accept already assigned booking
5. Driver can mark arrived
6. Driver can start trip
7. Driver can complete trip
8. User can cancel pending booking
9. Invalid state transitions are rejected
10. Booking number generation is sequential

## 📱 Using the Application

### As a User (Passenger)

1. **Login** as `user01` / `password`
2. Click **"Request Shuttle"**
3. Select **Pickup Location** (e.g., Gate 1)
4. Select **Destination** (e.g., Warehouse A)
5. Enter **Passenger Count**
6. Add optional **Notes**
7. Click **"Request Shuttle"**
8. View booking status in real-time
9. Receive updates when:
   - Driver is assigned
   - Driver arrives
   - Trip starts
   - Trip completes

### As a Driver

1. **Login** as `driver01` / `password`
2. Toggle status to **ONLINE**
3. View **Available Requests** in real-time
4. Click **"Accept"** to take a booking
5. Click **"Arrived"** when at pickup location
6. Click **"Start Trip"** when passenger boards
7. Click **"Complete Trip"** when journey ends
8. Status automatically returns to **ONLINE**

### As an Admin

1. **Login** as `admin` / `password`
2. View **Dashboard** with statistics:
   - Active Drivers
   - Pending Requests
   - Active Trips
   - Completed Today
   - Cancelled Today
3. Navigate to:
   - **Bookings** - View all booking records
   - **Drivers** - Monitor driver status
   - **Users** - View passenger list
   - **Vehicles** - View fleet
   - **Locations** - Manage locations

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Start all services in development mode
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Database commands
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed database
pnpm db:studio      # Open Prisma Studio

# Individual services
cd apps/api && bun dev          # API only
cd apps/web && pnpm dev         # Web only
```

## 🛠️ Database Management

### View Data with Prisma Studio

```bash
pnpm db:studio
```

Opens at http://localhost:5555

### Reset Database

```bash
cd apps/api
bunx prisma migrate reset
```

### Create New Migration

```bash
cd apps/api
bunx prisma migrate dev --name your_migration_name
```

## 📝 Business Rules & Validation

### Booking Creation

- Pickup and destination must be different
- Passenger count must be at least 1
- Both locations must exist and be active

### Driver Assignment

- Driver must be ONLINE to accept bookings
- Only one driver can accept a booking (race condition handled)
- Transaction ensures atomic assignment
- Driver status changes to BUSY when assigned

### State Transitions

- Enforced on backend (do not trust frontend)
- Invalid transitions return appropriate errors
- Examples of invalid transitions:
  - Cannot start trip from PENDING
  - Cannot complete trip before starting
  - Cannot cancel COMPLETED booking

### Cancellation

- Users can only cancel PENDING bookings
- Once assigned, cancellation is not allowed (for POC)

## 🎨 UI/UX Features

- **Responsive Design** - Works on desktop and tablets
- **Real-time Updates** - WebSocket integration for live data
- **Status Badges** - Color-coded booking statuses
- **Loading States** - Proper loading indicators
- **Error Handling** - User-friendly error messages
- **Empty States** - Helpful messages when no data
- **Toast Notifications** - Feedback for user actions (via WebSocket)

## 🚫 Out of Scope

This POC intentionally **does not include**:

- Payment processing
- Pricing engine
- Customer ratings
- Driver ratings
- Promotions/discounts
- In-app chat
- Google Maps integration
- GPS tracking
- Route optimization
- Geofencing
- Push notifications
- SMS notifications
- Email notifications
- Redis caching
- Kafka messaging
- Microservices
- Complex dispatch algorithms

## 🔮 Future Enhancements

The codebase is structured to support these future features:

- Real-time GPS tracking
- Automatic driver dispatch based on proximity
- Geofencing for location verification
- Google Maps integration
- Mobile driver application
- Multiple port locations
- Fleet management
- Vehicle maintenance tracking
- Shift management
- Comprehensive trip reports
- SLA monitoring
- Analytics dashboard
- Multi-language support

## 🐛 Known Limitations

1. **No authentication expiry** - JWT tokens don't expire (add token refresh in production)
2. **No password reset** - Users cannot reset passwords
3. **No pagination** - All lists load full data (add pagination for production)
4. **No search/filter** - Limited filtering capabilities in admin panel
5. **No file uploads** - No profile pictures or documents
6. **No audit logs** - Limited audit trail beyond booking attempts
7. **No rate limiting** - API has no rate limiting
8. **Basic error messages** - Could be more descriptive
9. **No graceful shutdown** - Servers don't handle shutdown gracefully
10. **Limited WebSocket authentication** - WS connections not fully authenticated

## 🔒 Security Considerations

⚠️ **This is a POC - Security is minimal!**

**For Production, Add:**

- Token expiration & refresh
- Rate limiting
- CSRF protection
- Input sanitization
- SQL injection prevention (Prisma helps)
- XSS protection
- CORS configuration
- HTTPS/WSS only
- Environment variable validation
- Secrets management
- API request logging
- Security headers
- Content Security Policy
- Password complexity rules
- Account lockout after failed attempts
- Two-factor authentication

## 📊 Performance Considerations

**Current Performance:**

- No caching (add Redis for production)
- No CDN (serve static assets via CDN)
- No database connection pooling optimization
- No query optimization
- No load balancing
- No horizontal scaling

**For Production:**

- Add Redis for session storage
- Implement database read replicas
- Add CDN for static assets
- Optimize database indexes
- Implement query result caching
- Add load balancer
- Horizontal scaling with multiple API instances

## 🤝 Contributing

This is a POC project. For improvements:

1. Focus on core functionality
2. Keep it simple
3. Don't over-engineer
4. Write tests for critical paths
5. Document new features

## 📄 License

This is a Proof of Concept project for demonstration purposes.

## 📞 Support

For questions or issues, please refer to the codebase documentation or create an issue in the repository.

---

**Built with ❤️ for Port Operations**
