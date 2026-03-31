# UI/UX Wireframes Document

## Project Name
Grainzz D2C E-commerce Platform

## Prepared By
Velrix Digital

---

## 1. Overview

This document defines the UI/UX wireframes derived directly from the provided Figma designs.

All screens must be implemented:
- Pixel-perfect
- Component-driven
- Responsive across devices

This document translates Figma layouts into development-ready structure.

---

## 2. Design Source of Truth

- Primary Source: Figma Design File
- All layouts, spacing, typography, and components must strictly follow Figma
- No deviation without design approval

---

## 3. Design System (Extracted from Figma)

### 3.1 Typography
- Heading styles (H1, H2, H3)
- Body text
- Button text

### 3.2 Colors
- Primary color
- Secondary/accent color
- Background colors
- Text colors

### 3.3 Spacing System
- Section spacing
- Padding/margins
- Grid alignment

---

## 4. Core Components (From Figma)

### Global Components

- Navbar
- Footer
- Buttons (Primary, Secondary)
- Product Card
- Section Wrapper
- Input Fields
- Badge (Discount / Tag)
- Cart Item
- Quantity Selector

---

## 5. Page Wireframes (Figma → Structure)

---

## 5.1 Homepage

### Layout Structure (Top → Bottom)

1. **Navbar**

2. **Hero Section**
   - Large banner
   - Heading + subheading
   - CTA button

3. **Featured Products Section**
   - ProductCard grid
   - Horizontal/vertical layout (as per Figma)

4. **Category / Combo Section**
   - Visual blocks/cards

5. **Offer Section**
   - Promotional banners

6. **CTA Strip**
   - Conversion-focused messaging

7. **Footer**

---

## 5.2 Product Listing Page

### Layout

**Top Section**
- Page title
- Filter UI (tabs/dropdowns)

**Main Section**
- Product Grid:
  - Desktop: 3–4 columns
  - Mobile: 2 columns

### Product Card (Exact from Figma)
- Image
- Title
- Price
- Discount badge
- CTA (Add to Cart)

---

## 5.3 Product Detail Page

### Layout

**Left Column**
- Image gallery (carousel/stack)

**Right Column**
- Product title
- Price
- Discount display
- Quantity selector
- Add to Cart button

**Below Section**
- Description
- Additional info
- Related products

---

## 5.4 Cart Page

### Layout

- Cart Items List:
  - Product image
  - Title
  - Quantity controls
  - Price

- Coupon Section:
  - Input field
  - Apply button

- Pricing Summary:
  - Subtotal
  - Discount
  - Total

- CTA:
  - Proceed to Checkout

---

## 5.5 Checkout Page

### Layout

**Left Section**
- User Information Form:
  - Name
  - Phone
  - Address

**Right Section**
- Order Summary

**Bottom**
- Place Order CTA

---

## 5.6 About Page

- Brand story sections
- Text + image blocks
- Structured content layout

---

## 5.7 Contact Page

- Contact form
- Business details
- Optional map section

---

## 6. Admin Dashboard Wireframes

---

## 6.1 Dashboard Overview

- Metrics cards:
  - Orders
  - Revenue
- Recent orders list

---

## 6.2 Products Management

- Table layout:
  - Product name
  - Price
  - Stock
  - Actions

- Add Product button

---

## 6.3 Orders Management

- Orders table:
  - ID
  - Customer
  - Status
  - Amount

- Status update control

---

## 6.4 Coupons & Offers

- Create coupon UI
- List view
- Offer assignment

---

## 7. Responsive Behavior (From Figma)

### Desktop
- Multi-column layouts
- Full navigation

### Tablet
- Reduced spacing
- Adjusted grid

### Mobile
- Stacked layout
- Hamburger menu
- Large touch targets

---

## 8. Interaction Mapping

- Button hover states
- Active states
- Loading states
- Form validation feedback
- Cart updates (instant UI change)

---

## 9. Component Mapping (Figma → Code)

| Figma Component | React Component |
|----------------|----------------|
| Product Card   | ProductCard.tsx |
| Navbar         | Navbar.tsx      |
| Footer         | Footer.tsx      |
| Button         | Button.tsx      |
| Cart Item      | CartItem.tsx    |

---

## 10. UX Flow (Based on Design)

1. User lands on Homepage  
2. Scrolls through sections  
3. Navigates to Product Listing  
4. Opens Product Detail  
5. Adds to Cart  
6. Applies Coupon  
7. Proceeds to Checkout  
8. Completes Payment  

---

## 11. Key Constraints

- Strict Figma adherence
- No layout improvisation
- Maintain spacing consistency
- Use reusable components

---

## 12. Summary

This UI/UX system ensures:
- Pixel-perfect implementation
- Scalable component architecture
- Seamless user experience
- High conversion flow