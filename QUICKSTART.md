# 🚀 Quick Start Guide

Get the Shuttle POC running in 5 minutes!

## Prerequisites

Install these tools first:

1. **Bun** (JavaScript runtime)

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **pnpm** (Package manager)

   ```bash
   npm install -g pnpm
   ```

3. **Docker Desktop** (for PostgreSQL)
   - Download from: https://www.docker.com/products/docker-desktop

## Installation

```bash
# 1. Navigate to project directory
cd /Volumes/UDIBAGAS/apps/mekar/shuttle-poc

# 2. Install all dependencies
pnpm install

# 3. Start PostgreSQL database
docker compose up -d

# 4. Wait for PostgreSQL to be ready (10-15 seconds)
# You can check with: docker compose ps

# 5. Run database migrations
pnpm db:migrate

# 6. Seed the database with demo data
pnpm db:seed

# 7. Start development servers
pnpm dev
```

## Access the Application

Once running, open these URLs:

- **Web App:** http://localhost:5173
- **API Server:** http://localhost:3000
- **WebSocket:** ws://localhost:3000/ws

## Login Credentials

### Admin

- Username: `admin`
- Password: `password`

### Users (Passengers)

- Username: `user01` | Password: `password`
- Username: `user02` | Password: `password`
- Username: `user03` | Password: `password`

### Drivers

- Username: `driver01` | Password: `password` ⭐ (ONLINE)
- Username: `driver02` | Password: `password` (OFFLINE)
- Username: `driver03` | Password: `password` ⭐ (ONLINE)

⚠️ **Note:** These are demo credentials for POC purposes only!

## Test the Application

### Scenario: Complete Booking Flow

**Step 1: Create Booking (as User)**

1. Login as `user01` / `password`
2. Click **"Request Shuttle"**
3. Select Pickup: **"Gate 1 - Main Entrance"**
4. Select Destination: **"Warehouse A - Dry Cargo"**
5. Passengers: **2**
6. Click **"Request Shuttle"**
7. See booking status: **PENDING**

**Step 2: Accept Booking (as Driver)**

1. Open a new browser window (or use incognito)
2. Login as `driver01` / `password`
3. See the new booking request appear in real-time
4. Click **"Accept"**
5. See booking status change to **ASSIGNED**

**Step 3: Complete Trip (as Driver)**

1. Click **"Arrived"** → Status: **DRIVER_ARRIVED**
2. Click **"Start Trip"** → Status: **IN_PROGRESS**
3. Click **"Complete Trip"** → Status: **COMPLETED**

**Step 4: Monitor Operations (as Admin)**

1. Open a third browser window
2. Login as `admin` / `password`
3. See live statistics update in real-time:
   - Active Drivers
   - Pending Requests
   - Active Trips
   - Completed Today

## Common Commands

```bash
# Start everything
pnpm dev

# Stop database
docker compose down

# View database data
pnpm db:studio      # Opens at http://localhost:5555

# Reset database (clean slate)
cd apps/api
bunx prisma migrate reset
pnpm db:seed

# Run tests
cd apps/api
bun test

# Individual services
cd apps/api && bun dev      # Backend only
cd apps/web && pnpm dev     # Frontend only
```

## Troubleshooting

### PostgreSQL won't start

```bash
# Check if port 5432 is already in use
lsof -i :5432

# Stop other PostgreSQL instances
docker compose down

# Remove volumes and restart
docker compose down -v
docker compose up -d
```

### Migration fails

```bash
# Delete and recreate database
docker compose down -v
docker compose up -d

# Wait 15 seconds, then try again
pnpm db:migrate
```

### Port 3000 or 5173 already in use

```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Frontend can't connect to API

1. Check API is running: http://localhost:3000
2. Check browser console for CORS errors
3. Verify `.env` file exists in root directory

### WebSocket not connecting

1. Check API is running
2. Browser console should show: "WebSocket connected"
3. Check firewall isn't blocking port 3000

## Project Structure

```
shuttle-poc/
├── apps/
│   ├── api/              # Backend (ElysiaJS + Bun)
│   └── web/              # Frontend (React + Vite)
├── packages/
│   └── types/            # Shared TypeScript types
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── docker-compose.yml    # PostgreSQL container
├── package.json          # Root package.json
├── pnpm-workspace.yaml   # Monorepo config
└── README.md             # Full documentation
```

## Key Features to Test

✅ **Real-time Updates**

- Create booking as user
- Watch it appear on driver dashboard instantly
- Accept booking and see user dashboard update

✅ **State Machine**

- Try to complete trip without starting it (should fail)
- Try to start trip without arriving (should fail)
- Follow correct sequence: Assign → Arrive → Start → Complete

✅ **Role-Based Access**

- Users cannot access driver or admin pages
- Drivers cannot access admin pages
- Admins can view all data

✅ **Driver Rejection**

- Driver can reject booking
- Booking remains PENDING
- Other drivers can still accept it

✅ **Booking History**

- View past bookings as user
- View completed trips as driver
- View all bookings as admin

## Next Steps

1. **Read the full README:** [README.md](README.md)
2. **Review architecture:** [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
3. **Check database schema:** `prisma/schema.prisma`
4. **Explore API routes:** `apps/api/src/routes/`
5. **Review frontend pages:** `apps/web/src/pages/`

## Need Help?

- Check the comprehensive [README.md](README.md)
- Review code comments in source files
- Check console logs for errors
- Verify all prerequisites are installed

## Stop the Application

```bash
# Stop dev servers (Ctrl+C in terminal)

# Stop PostgreSQL
docker compose down

# Keep data: Just stop
docker compose down

# Remove data: Stop and remove volumes
docker compose down -v
```

---

**Happy Testing! 🎉**
