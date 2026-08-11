// User & Auth Types
export enum UserRole {
  USER = "USER",
  DRIVER = "DRIVER",
  ADMIN = "ADMIN",
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
}

// Driver Types
export enum DriverStatus {
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE",
  BUSY = "BUSY",
}

export interface Driver {
  id: string;
  userId: string;
  vehicleId: string | null;
  status: DriverStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  vehicle?: Vehicle;
}

export interface UpdateDriverStatusRequest {
  status: DriverStatus;
}

// Vehicle Types
export enum VehicleType {
  MINIBUS = "MINIBUS",
  VAN = "VAN",
  BUS = "BUS",
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: VehicleType;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

// Location Types
export enum LocationType {
  GATE = "GATE",
  TERMINAL = "TERMINAL",
  WAREHOUSE = "WAREHOUSE",
  WORKSHOP = "WORKSHOP",
  OFFICE = "OFFICE",
  OTHER = "OTHER",
}

export interface Location {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLocationRequest {
  code: string;
  name: string;
  type: LocationType;
  latitude: number;
  longitude: number;
  isActive?: boolean;
}

export interface UpdateLocationRequest {
  code?: string;
  name?: string;
  type?: LocationType;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

// Booking Types
export enum BookingStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  DRIVER_ARRIVED = "DRIVER_ARRIVED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum BookingDriverAttemptStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  pickupLocationId: string;
  destinationLocationId: string;
  passengerCount: number;
  notes: string | null;
  status: BookingStatus;
  driverId: string | null;
  requestedAt: Date;
  assignedAt: Date | null;
  driverArrivedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  driver?: Driver;
  pickupLocation?: Location;
  destinationLocation?: Location;
}

export interface CreateBookingRequest {
  pickupLocationId: string;
  destinationLocationId: string;
  passengerCount: number;
  notes?: string;
}

export interface BookingDriverAttempt {
  id: string;
  bookingId: string;
  driverId: string;
  status: BookingDriverAttemptStatus;
  respondedAt: Date | null;
  createdAt: Date;
  driver?: Driver;
}

// WebSocket Event Types
export enum WebSocketEventType {
  BOOKING_CREATED = "booking.created",
  BOOKING_ASSIGNED = "booking.assigned",
  BOOKING_DRIVER_ARRIVED = "booking.driver_arrived",
  BOOKING_STARTED = "booking.started",
  BOOKING_COMPLETED = "booking.completed",
  BOOKING_CANCELLED = "booking.cancelled",
  DRIVER_STATUS_CHANGED = "driver.status_changed",
}

export interface WebSocketEvent<T = any> {
  event: WebSocketEventType;
  data: T;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
}

// Dashboard Types
export interface DashboardStats {
  activeDrivers: number;
  pendingRequests: number;
  activeTrips: number;
  completedToday: number;
  cancelledToday: number;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
