import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull(), // 'customer' or 'admin'
  name: text('name').notNull(),
  department: text('department').notNull(),
  designation: text('designation'),
  phone: text('phone'),
  createdAt: text('created_at').notNull(),
});

// Menu items table
export const menuItems = sqliteTable('menu_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  category: text('category').notNull(), // 'snacks', 'beverages', 'sweets'
  imageUrl: text('image_url'),
  available: integer('available', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
});

// Orders table
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  orderType: text('order_type').notNull(), // 'instant' or 'scheduled'
  scheduledDate: text('scheduled_date'),
  totalAmount: real('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull(), // 'bkash', 'nagad', 'card'
  paymentStatus: text('payment_status').notNull(), // 'pending', 'completed'
  orderStatus: text('order_status').notNull(), // 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
  department: text('department').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Order items table
export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id),
  menuItemId: integer('menu_item_id').references(() => menuItems.id),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  createdAt: text('created_at').notNull(),
});

// Payments table
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').references(() => orders.id),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  transactionId: text('transaction_id'),
  paymentStatus: text('payment_status').notNull(),
  createdAt: text('created_at').notNull(),
});