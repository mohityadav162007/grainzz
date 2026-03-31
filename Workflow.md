

# Development Workflow

## Project Name
Grainzz D2C E-commerce Platform

## Prepared By
Velrix Digital

---

## 1. Overview

This document defines the complete execution workflow for building the Grainzz e-commerce platform based on:

- Figma designs (pixel-perfect UI)
- Full-stack architecture
- Dynamic data-driven system
- Admin dashboard + payment integration

The workflow follows a **design-first, component-driven, API-first approach**.

---

## 2. Development Strategy

### Core Approach:
1. Figma → Design System
2. Design System → Components
3. Components → Pages
4. Pages → API Integration
5. API → Database
6. Final → Testing & Deployment

---

## 3. Phase-wise Workflow

---

## PHASE 1: Project Setup

### Step 1: Initialize Repositories

Structure:

/project ├── client   (Next.js storefront) ├── admin    (Next.js dashboard) ├── server   (Node.js backend)

---

### Step 2: Setup Environments

#### Frontend & Admin
- Next.js setup
- Tailwind CSS
- Folder structure

#### Backend
- Express server
- MongoDB connection
- Environment variables

---

## PHASE 2: Figma Analysis → Design System

### Step 1: Extract from Figma

- Colors
- Typography
- Spacing system
- Layout patterns

---

### Step 2: Create Design Tokens

- Tailwind config (colors, spacing)
- Global styles
- Font setup

---

### Step 3: Identify Components

From Figma:

- Navbar
- Footer
- Product Card
- Buttons
- Cart Item
- Input fields
- Sections (Hero, CTA, etc.)

---

## PHASE 3: Component Development

### Build reusable components first:

1. Navbar
2. Footer
3. Buttons
4. ProductCard
5. Layout wrapper
6. Form inputs
7. Cart components

### Rules:
- Reusable
- Configurable via props
- Styled as per Figma

---

## PHASE 4: Frontend Page Development

(All pages must follow Figma exactly)

---

### Step 1: Homepage
- Hero section
- Featured products
- Categories
- Offers
- CTA sections

---

### Step 2: Product Listing Page
- Product grid
- Filters UI (static first)

---

### Step 3: Product Detail Page
- Image gallery
- Product info
- Add to cart

---

### Step 4: Cart Page
- Items list
- Quantity controls
- Coupon input
- Price summary

---

### Step 5: Checkout Page
- User form
- Order summary

---

### Step 6: Static Pages
- About
- Contact

---

## PHASE 5: Backend Development

### Step 1: Setup Structure

/server ├── models ├── controllers ├── routes ├── middleware

---

### Step 2: Implement Models

- Product
- Order
- Coupon
- Offer
- User (admin)

---

### Step 3: Build APIs

#### Products
- GET /products
- POST /products
- PUT /products/:id
- DELETE /products/:id

#### Orders
- POST /orders
- GET /orders
- PUT /orders/:id

#### Coupons
- POST /coupons
- POST /coupons/apply

#### Auth
- POST /auth/login

---

## PHASE 6: Integration (Frontend ↔ Backend)

### Step 1: Connect Products
- Fetch product data dynamically

### Step 2: Cart Logic
- Zustand store
- Add/remove/update items

### Step 3: Coupon Logic
- API validation
- Apply discount

---

## PHASE 7: Payment Integration (PhonePe)

### Flow:

1. Create order (status: pending)
2. Call backend payment API
3. Redirect to PhonePe
4. Payment completed
5. Backend verifies transaction
6. Update order → PAID

---

## PHASE 8: Admin Dashboard Development

### Step 1: Authentication
- Admin login (JWT)

### Step 2: Modules

#### Dashboard
- Stats overview

#### Products
- CRUD operations

#### Orders
- View + update status

#### Coupons
- Create + manage

#### Offers
- Create + assign

---

## PHASE 9: Testing

### Functional Testing
- Product flow
- Cart flow
- Checkout flow
- Payment flow

### UI Testing
- Pixel match with Figma
- Responsive behavior

### Edge Cases
- Empty cart
- Invalid coupon
- Payment failure

---

## PHASE 10: Optimization

- Image optimization
- Lazy loading
- Code cleanup
- Performance tuning

---

## PHASE 11: Deployment

### Frontend
- Vercel

### Backend
- Render / Railway

### Database
- MongoDB Atlas

---

## PHASE 12: Post-Deployment

- Final testing (production)
- Bug fixes
- Client handover

---

## 4. Development Timeline (Suggested)

| Day | Task |
|-----|------|
| 1   | Setup + Figma analysis |
| 2   | Components |
| 3   | Homepage + Listing |
| 4   | Product + Cart |
| 5   | Backend APIs |
| 6   | Integration + Payment |
| 7   | Admin + Testing |

---

## 5. Key Development Rules

- Follow Figma strictly
- Build reusable components
- Avoid hardcoding data
- Keep API-first approach
- Maintain clean folder structure

---

## 6. Risks & Mitigation

| Risk | Solution |
|------|---------|
| Figma inconsistencies | Confirm before dev |
| Payment issues | Use webhook verification |
| Scope creep | Lock features via PRD |

---

## 7. Summary

This workflow ensures:

- Structured development
- Faster execution
- Clean architecture
- Scalable system

The project is executed as a **production-grade e-commerce system**, not just a static website.


---


