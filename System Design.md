

# System Design Document

## Project Name
Grainzz D2C E-commerce Platform

## Prepared By
Velrix Digital

---

## 1. System Overview

The system is a full-stack, dynamic e-commerce platform consisting of:

1. Customer-facing website (Storefront)
2. Admin dashboard (Internal management)
3. Backend API (Core logic)
4. Database (Data storage)
5. Payment Gateway (PhonePe)

The architecture follows a **Headless + API-driven design**.

---

## 2. High-Level Architecture

┌──────────────────────┐
       │   Customer Frontend  │
       │   (Next.js)          │
       └─────────┬────────────┘
                 │
                 ▼
       ┌──────────────────────┐
       │     Backend API      │
       │   (Node + Express)   │
       └─────────┬────────────┘
                 │
  ┌──────────────┼──────────────┐
  ▼                             ▼

┌───────────────┐         ┌────────────────┐ │   MongoDB     │         │  PhonePe PG    │ │   (Database)  │         │ (Payments)     │ └───────────────┘         └────────────────┘ ▲ │ ┌──────────────────────┐ │   Admin Dashboard    │ │     (Next.js)        │ └──────────────────────┘

---

## 3. Core Components

### 3.1 Frontend (Customer Website)

- Built using Next.js
- Tailwind CSS for styling
- Zustand for cart state management

#### Responsibilities:
- Render UI from Figma designs (pixel-perfect)
- Fetch products from backend
- Handle cart operations
- Initiate checkout & payment

---

### 3.2 Admin Dashboard

- Built using Next.js
- Secured using JWT authentication

#### Responsibilities:
- Manage products (CRUD)
- Manage orders
- Create coupons & offers
- View dashboard metrics

---

### 3.3 Backend API

- Built with Node.js + Express

#### Responsibilities:
- Business logic execution
- API handling
- Authentication & authorization
- Payment processing
- Data validation

---

### 3.4 Database (MongoDB)

- Stores all application data

#### Collections:
- Products
- Orders
- Coupons
- Offers
- Users (Admin)

---

### 3.5 Payment Gateway (PhonePe)

- External service integration
- Handles transaction processing

---

## 4. Data Flow

### 4.1 Product Fetch Flow

Frontend → GET /products → Backend → MongoDB → Response → Frontend UI

---

### 4.2 Add to Cart Flow

User Action → Zustand Store → Update Cart State → UI Update

---

### 4.3 Checkout Flow

Cart → Checkout Page → Submit Order → Backend → Create Order (Pending)

---

### 4.4 Payment Flow

User clicks "Pay" ↓ Frontend → Backend (Create Payment Request) ↓ Backend → PhonePe API ↓ User redirected to PhonePe ↓ Payment Completed ↓ PhonePe → Webhook → Backend ↓ Backend verifies payment ↓ Order status → PAID

---

### 4.5 Admin Flow

Admin Dashboard → API Request → Backend → Database Update

---

## 5. Database Design (Simplified)

### Product

id name price images[] description category stock offerId createdAt

---

### Order

id items[] totalAmount userDetails status (pending, paid, shipped, delivered) paymentStatus createdAt

---

### Coupon

code discountType (percentage / flat) value minOrderValue expiryDate usageLimit

---

### Offer

title discountPercentage applicableProducts[] expiryDate

---

### User (Admin)

email password role

---

## 6. API Design

### Products
- GET /api/products
- GET /api/products/:id
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

---

### Orders
- POST /api/orders
- GET /api/orders
- PUT /api/orders/:id

---

### Coupons
- POST /api/coupons
- POST /api/coupons/apply

---

### Auth
- POST /api/auth/login

---

## 7. Authentication & Security

- JWT-based authentication for admin
- Protected admin routes
- Input validation on all APIs
- Payment verification via backend (not frontend)

---

## 8. State Management

### Frontend (Zustand)

Handles:
- Cart items
- Quantity updates
- Coupon application
- Total price calculation

---

## 9. Scalability Considerations

- Stateless backend → scalable horizontally
- MongoDB Atlas → managed DB scaling
- CDN for images (Cloudinary)
- Next.js → optimized SSR/SSG

---

## 10. Performance Optimization

- Image optimization (Next/Image)
- Lazy loading components
- API response caching (future)
- Minimized bundle size

---

## 11. Error Handling

- API error responses with status codes
- Frontend fallback UI
- Payment failure handling
- Retry mechanisms for critical flows

---

## 12. Deployment Architecture

### Frontend
- Vercel

### Backend
- Render / Railway

### Database
- MongoDB Atlas

---

## 13. Logging & Monitoring (Optional)

- Console logs (MVP)
- Future:
  - Log management tools
  - Error tracking (Sentry)

---

## 14. Future Enhancements

- Wishlist system
- User authentication
- Subscription plans
- Email notifications
- Advanced analytics dashboard

---

## 15. Key Design Principles

- API-first architecture
- Separation of concerns
- Reusable components
- Scalable backend design
- Pixel-perfect UI from Figma

---

## 16. Summary

This system is designed as a **scalable, modular e-commerce platform** with:

- Clean separation of frontend, backend, and admin
- Fully dynamic content management
- Secure and reliable payment integration
- Reusable architecture for future projects


---
