# Product Requirements Document (PRD)

## Project Name
Grainzz D2C E-commerce Website

## Prepared By
Velrix Digital

## Overview
Grainzz is a healthy snacks brand requiring a fully dynamic, scalable D2C e-commerce platform. The system includes a customer-facing website, backend APIs, and an admin dashboard to manage products, orders, offers, and coupons.

All UI will be built pixel-perfect from provided Figma designs.

---

## Objectives

- Build a high-performance e-commerce website
- Ensure all content is dynamically managed via admin panel
- Deliver a seamless shopping experience
- Enable business scalability

---

## Scope

### In Scope
- Frontend (Next.js)
- Backend APIs (Node.js + Express)
- Database (MongoDB)
- Admin Dashboard
- Payment Integration (PhonePe)

### Out of Scope
- Native mobile apps
- Advanced analytics (Phase 2)

---

## Tech Stack

### Frontend
- Next.js (App Router)
- Tailwind CSS
- Zustand (state management)

### Backend
- Node.js + Express
- MongoDB (Atlas)

### Integrations
- PhonePe (Payments)
- Cloudinary (Image Uploads)

---

## User Roles

### 1. Customer
- Browse products
- Add to cart
- Apply coupons
- Place orders
- Make payments

### 2. Admin
- Manage products
- Manage orders
- Create offers & coupons
- View dashboard stats

---

## Features

---

### 1. Customer Website

#### Pages (All from Figma)
- Homepage
- Product Listing Page
- Product Detail Page
- Cart Page
- Checkout Page
- About Page
- Contact Page

#### Functional Requirements
- Responsive design
- Dynamic product rendering
- Add to cart functionality
- Coupon application
- Real-time price updates

---

### 2. Product Management

Admin can:
- Add product
- Edit product
- Delete product
- Upload images
- Set price, stock, category

---

### 3. Cart System

- Add/remove items
- Update quantity
- Apply coupon
- Calculate total dynamically

---

### 4. Coupon System

- Create coupon codes
- Set:
  - Discount type (percentage / flat)
  - Expiry date
  - Minimum order value

---

### 5. Offers System

- Assign discounts to:
  - Products
  - Categories

---

### 6. Order Management

Admin can:
- View all orders
- Update order status:
  - Pending
  - Paid
  - Shipped
  - Delivered

---

### 7. Payment System (PhonePe)

#### Flow:
1. User places order
2. Backend creates order (status: pending)
3. Payment initiated via PhonePe
4. User completes payment
5. Backend verifies payment
6. Order marked as "Paid"

---

### 8. Admin Dashboard

#### Modules:
- Dashboard (overview)
- Products
- Orders
- Coupons
- Offers

---

## Database Schema (High Level)

### Product
- name
- price
- images[]
- description
- category
- stock

### Order
- items[]
- total
- userDetails
- status
- paymentStatus

### Coupon
- code
- discountType
- value
- expiry

### Offer
- title
- discount
- applicableProducts

---

## API Endpoints

### Products
- GET /products
- GET /products/:id
- POST /products
- PUT /products/:id
- DELETE /products/:id

### Orders
- POST /orders
- GET /orders
- PUT /orders/:id

### Coupons
- POST /coupons
- POST /coupons/apply

### Auth
- POST /auth/login

---

## UX Requirements

- Pixel-perfect implementation from Figma
- Smooth navigation
- Fast load time (<2s)
- Mobile-first optimization

---

## Performance Requirements

- Optimized images
- Lazy loading
- CDN usage

---

## Security Requirements

- JWT authentication (admin)
- Input validation
- Secure payment verification

---

## Timeline

- Total Duration: 1–2 weeks

### Milestones:
1. Backend Setup
2. Admin Dashboard
3. Frontend Development
4. Payment Integration
5. Testing & Deployment

---

## Deployment

- Frontend → Vercel
- Backend → Render / Railway
- Database → MongoDB Atlas

---

## Success Metrics

- Fast load time
- Smooth checkout flow
- Zero critical bugs
- Admin usability

---

## Future Scope (Phase 2)

- Wishlist
- Subscription model
- Advanced analytics
- Email notifications

---

## Notes

- All pages must strictly follow Figma design
- System must be fully dynamic
- Code should be reusable for future projects