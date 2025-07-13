// Core types for the Healthcare Inventory Management System

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description?: string;
  batch: string;
  expirationDate: Date;
  minimumQuantity: number;
  currentQuantity: number;
  location?: string;
  supplier?: string;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  responsibleUser: string;
  timestamp: Date;
  notes?: string;
  invoiceNumber?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  productId: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

// Enums
export enum ProductCategory {
  MEDICATIONS = 'medications',
  MEDICAL_SUPPLIES = 'medical_supplies',
  ENDEMIC_CONTROL = 'endemic_control',
  LABORATORY = 'laboratory',
  PERSONAL_PROTECTIVE_EQUIPMENT = 'ppe',
  OTHER = 'other'
}

export enum ProductStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  INACTIVE = 'inactive'
}

export enum MovementType {
  ENTRY = 'entry',
  EXIT = 'exit',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer'
}

export enum AlertType {
  EXPIRING_SOON = 'expiring_soon',
  LOW_STOCK = 'low_stock',
  EXPIRED = 'expired',
  OUT_OF_STOCK = 'out_of_stock'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  NURSE = 'nurse',
  FIELD_WORKER = 'field_worker'
}

// Form types
export interface ProductFormData {
  name: string;
  category: ProductCategory;
  description?: string;
  batch: string;
  expirationDate: Date;
  minimumQuantity: number;
  currentQuantity: number;
  location?: string;
  supplier?: string;
}

export interface MovementFormData {
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  notes?: string;
  invoiceNumber?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Dashboard types
export interface DashboardStats {
  totalProducts: number;
  activeAlerts: number;
  lowStockProducts: number;
  expiringProducts: number;
  todayMovements: number;
  monthlyMovements: {
    entries: number;
    exits: number;
  };
}

// Filter types
export interface ProductFilters {
  search: string;
  category?: ProductCategory;
  status?: ProductStatus;
  expiringWithin?: number; // days
}

export interface MovementFilters {
  startDate?: Date;
  endDate?: Date;
  type?: MovementType;
  userId?: string;
  productId?: string;
}