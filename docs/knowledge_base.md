# EyeGlaze Knowledge Base
> **Single source of truth for all developers.**
> Platform: Next.js (web/admin) + Flutter (mobile) | Database: MongoDB
> Last Updated: 2026-06-16

---

## Table of Contents

1. [Theme & Design System](#1-theme--design-system)
2. [MongoDB Models](#2-mongodb-models)
3. [API Routes (Next.js)](#3-api-routes-nextjs)
4. [Flutter Screens List](#4-flutter-screens-list)
5. [Key Flows](#5-key-flows)
6. [Business Rules](#6-business-rules)

---

## 1. Theme & Design System

### 1.1 Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary Background | `#0D0D0D` | Page/screen background (near black) |
| Card Background | `#1A1A1A` | Cards, bottom sheets, modals |
| Accent / Gold | `#C9A84C` | Primary CTAs (fill), prices, highlights, links |
| Gold (flow.md variant) | `#D4922A` | Gold/amber accent (same intent, verify final token) |
| White Text | `#FFFFFF` | Primary headings, body copy |
| Muted Text | `#888888` – `#999999` | Secondary labels, placeholders |
| Border | `#2A2A2A` | Card borders, dividers, input outlines |
| Error | `#FF4444` | Validation errors, out-of-stock alerts |
| Success | `#4CAF50` | Order confirmed, verified states |

> **Decision note:** The design spec uses `#C9A84C` (brief) and `#D4922A` (flow.md). Confirm with designer; use a single `goldAccent` token in code.

### 1.2 Typography

| Role | Style |
|------|-------|
| Logo / Brand | Serif, gold, bold uppercase |
| Hero Headings | Bold, white, large |
| Section Headings | Bold, white, uppercase |
| Body Copy | Regular weight, white / light grey |
| Prices | Bold, white |
| Discounts / Savings | Gold / amber, bold |
| Muted Labels | Regular, `#888888`–`#999999` |
| Links | Gold / amber, underlined |
| CTA Button Text | Bold, uppercase, white |

### 1.3 Component Patterns

#### Cards
- Background: `#1A1A1A`
- Border-radius: `rounded-xl` (12–16 px)
- Optional gold border on selected/active state
- Padding: 16 px

#### Buttons — Primary CTA (Gold Fill)
- Background: `#C9A84C` / `#D4922A`
- Text: White, bold, uppercase
- Border-radius: `rounded-xl`
- Full-width inside modals/wizards

#### Buttons — Secondary (Gold Outline)
- Background: transparent
- Border: 1.5 px solid gold
- Text: White
- Border-radius: `rounded-xl`

#### Product Cards (listing grid)
- Dark card bg, rounded-xl
- BESTSELLER badge: top-left, gold fill
- Quick-add "Add +" button: top-right
- Price row: selling price (white, bold) + strikethrough MRP (grey) + discount % (gold)

#### Wizard Progress Bar
- 4 steps: LENS TYPE → POWER → QUALITY → CHECKOUT
- Active step: gold/amber dot
- Completed step: checkmark
- Persistent mini frame card below progress bar on every step

### 1.4 Persistent UI Elements

**Bottom Navigation (Flutter — 5 tabs):**
Home | Categories | Wishlist | Orders | Account

**Trust Strip (recurring):**
100% Authentic / Secure Payment | 1 Year Warranty | Easy Returns / 7 Days Return | Fast Delivery | 24/7 Support

---

## 2. MongoDB Models

### 2.1 User

```js
{
  _id: ObjectId,
  phone: { type: String, unique: true, sparse: true },        // 10-digit, no country code
  countryCode: { type: String, default: '+91' },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  otp: String,                                                 // hashed OTP
  otpExpiry: Date,                                             // now + 5 min
  isVerified: { type: Boolean, default: false },
  name: String,
  addresses: [
    {
      _id: ObjectId,
      fullName: String,
      mobile: String,
      pincode: String,
      line1: String,                                           // house/flat/building
      line2: String,                                           // street/area/landmark
      city: String,
      state: String,                                           // auto-filled from pincode
      type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
      isDefault: { type: Boolean, default: false }
    }
  ],
  wishlist: [{ type: ObjectId, ref: 'Product' }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  adminRole: { type: String, enum: ['super_admin', 'store_manager', 'support_agent'] }, // only if role=admin
  membershipActive: { type: Boolean, default: false },
  membershipExpiry: Date,
  createdAt: { type: Date, default: Date.now }
}
```

### 2.2 Product

```js
{
  _id: ObjectId,
  sku: { type: String, unique: true, required: true },         // e.g., 'EG-2041'
  name: String,                                                // e.g., 'Matte Square Frame'
  frame: {
    type: { type: String },                                    // 'Square', 'Round', 'Clubmaster', 'Aviator', 'Wayfarer', etc.
    material: String,                                          // 'TR90 Premium', 'Premium Metal', 'Acetate', etc.
    width: Number,                                             // mm — overall frame width (e.g., 140)
    lensWidth: Number,                                         // mm (e.g., 54)
    bridgeWidth: Number,                                       // mm (e.g., 18)
    templeLength: Number,                                      // mm (e.g., 145)
    featureTags: [String]                                      // ['Lightweight', 'Flexible', 'Skin Friendly', 'Durable', 'Corrosion Resistant']
  },
  colors: [
    {
      name: String,                                            // e.g., 'Matte Black', 'Black Gold'
      hex: String,                                             // e.g., '#1A1A1A'
      swatchImage: String,                                     // URL
      stock: { type: Number, default: 0 }
    }
  ],
  images: [String],                                            // ordered array of image URLs (min 4 + 1 model photo)
  image360: String,                                            // URL or asset path for 360° view
  price: {
    original: { type: Number, default: 999 },                 // MRP (₹999)
    selling: { type: Number, default: 1 }                     // Promotional price (₹1)
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  tags: [String],                                              // SEO / search tags
  categories: [String],                                        // ['Prescription Glasses', 'Sunglasses', 'Blue Light Glasses', 'Contact Lenses', 'Kids Eyewear']
  compatible: {
    prescription: { type: Boolean, default: false },
    bluecut: { type: Boolean, default: false },
    zeropower: { type: Boolean, default: false },
    progressive: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  isBestseller: { type: Boolean, default: false },
  meta: {
    seoTitle: String,
    seoDescription: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

### 2.3 LensOption

```js
{
  _id: ObjectId,
  type: {
    type: String,
    enum: ['single_vision', 'progressive', 'bluecut', 'zero_power', 'photochromic'],
    required: true
  },
  subType: String,           // for progressive: 'HC Progressive', 'Premium Progressive', 'Advanced Progressive', 'Elite Progressive'
                             // for quality tiers: 'HMC+BlueCut', 'HMC', 'BlueCut', 'HC'
  displayName: String,       // e.g., 'Single Vision', 'HC Progressive'
  badge: String,             // e.g., 'BESTSELLER', 'RECOMMENDED'
  price: { type: Number, required: true },    // in ₹
  features: [String],        // e.g., ['Anti-Reflective (HMC Coating)', 'Blue Light Protection', 'Water & Dust Repellant']
  description: String,
  isActive: { type: Boolean, default: true }
}
```

**Reference: Lens Type Prices (Step 1 of wizard)**

| Type | enum value | Starting Price |
|------|-----------|---------------|
| Single Vision | `single_vision` | ₹699 |
| Progressive | `progressive` | ₹2,499 |
| Zero Power (Plano) | `zero_power` | ₹699 |
| Blue Cut | `bluecut` | ₹899 |
| Photochromic | `photochromic` | ₹1,499 |

**Reference: Progressive Sub-Types (Step 1B)**

| Tier | subType | Price |
|------|---------|-------|
| HC Progressive | `hc_progressive` | ₹2,499/pair |
| Premium Progressive | `premium_progressive` | ₹3,499/pair |
| Advanced Progressive | `advanced_progressive` | ₹4,499/pair |
| Elite Progressive | `elite_progressive` | ₹5,499/pair |

**Reference: Lens Quality Tiers (Step 3 of wizard)**

| Quality | subType | Price |
|---------|---------|-------|
| HMC + Blue Cut | `hmc_bluecut` | ₹999/pair |
| HMC | `hmc` | ₹699/pair |
| Blue Cut | `bluecut_quality` | ₹899/pair |
| HC (Hard Coated) | `hc` | ₹799/pair |

### 2.4 Order

```js
{
  _id: ObjectId,
  orderId: { type: String, unique: true },                    // human-readable, e.g., 'EGO-20260616-0001'
  user: { type: ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: ObjectId, ref: 'Product', required: true },
      qty: { type: Number, default: 1 },
      color: String,                                           // selected color name
      lensType: String,                                        // enum: see LensOption.type
      lensSubType: String,                                     // progressive tier or quality tier
      power: {
        RE: { sph: Number, cyl: Number, axis: Number },       // Right Eye
        LE: { sph: Number, cyl: Number, axis: Number },       // Left Eye
        pd: Number                                             // Pupillary Distance in mm
      },
      lensQuality: String,                                     // quality tier subType
      lensPrice: Number,                                       // ₹ for lenses chosen
      framePrice: Number,                                      // ₹1 promotional
      fittingCharge: { type: Number, default: 199 }           // ₹199 if lenses added
    }
  ],
  subtotal: Number,
  deliveryCharge: { type: Number, default: 99 },
  fittingCharge: Number,
  discount: { type: Number, default: 0 },
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  address: {
    fullName: String,
    mobile: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: String,                                       // 'UPI', 'Card', 'NetBanking', 'Wallet', 'COD'
  transactionId: String,
  coupon: {
    code: String,
    discountType: { type: String, enum: ['percent', 'flat'] },
    discountValue: Number,
    amountSaved: Number
  },
  trackingNumber: String,
  courierPartner: String,
  estimatedDelivery: Date,
  internalNotes: [{ note: String, addedBy: ObjectId, addedAt: Date }],
  isFlagged: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

### 2.5 Cart

```js
{
  _id: ObjectId,
  user: { type: ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      product: { type: ObjectId, ref: 'Product', required: true },
      qty: { type: Number, default: 1 },
      color: String,
      lensType: String,
      lensSubType: String,
      power: {
        RE: { sph: Number, cyl: Number, axis: Number },
        LE: { sph: Number, cyl: Number, axis: Number },
        pd: Number
      },
      lensQuality: String,
      lensPrice: Number,
      framePrice: Number
    }
  ],
  updatedAt: { type: Date, default: Date.now }
}
```

### 2.6 Prescription

```js
{
  _id: ObjectId,
  user: { type: ObjectId, ref: 'User', required: true },
  RE: { sph: Number, cyl: Number, axis: Number },
  LE: { sph: Number, cyl: Number, axis: Number },
  pd: Number,
  uploadedFile: String,                                        // URL to stored image
  verified: { type: Boolean, default: false },
  verifiedBy: { type: ObjectId, ref: 'User' },                // admin user who verified
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  createdAt: { type: Date, default: Date.now }
}
```

### 2.7 Review

```js
{
  _id: ObjectId,
  product: { type: ObjectId, ref: 'Product', required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
}
```

### 2.8 Coupon

```js
{
  _id: ObjectId,
  code: { type: String, unique: true, uppercase: true },      // e.g., 'SAVE20'
  discountType: { type: String, enum: ['percent', 'flat'] },
  discountValue: Number,
  minOrderValue: Number,
  maxDiscount: Number,                                         // cap for percent coupons
  validFrom: Date,
  validTo: Date,
  usageLimitPerUser: Number,
  usageLimitTotal: Number,
  usedCount: { type: Number, default: 0 },
  applicableTo: {
    type: String,
    enum: ['all', 'categories', 'skus'],
    default: 'all'
  },
  categories: [String],
  skus: [String],
  isActive: { type: Boolean, default: true }
}
```

---

## 3. API Routes (Next.js)

Base URL: `/api`

### 3.1 Auth

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/auth/send-otp` | Send OTP to phone or email | No |
| POST | `/api/auth/verify-otp` | Verify OTP; returns JWT token | No |
| POST | `/api/auth/logout` | Invalidate session | Yes |

**POST /api/auth/send-otp** body:
```json
{ "phone": "9876543210", "countryCode": "+91" }
// or
{ "email": "user@example.com" }
```

**POST /api/auth/verify-otp** body:
```json
{ "phone": "9876543210", "otp": "123456" }
// or
{ "email": "user@example.com", "otp": "123456" }
```
Response: `{ token, user: { _id, name, role } }`

---

### 3.2 Products (Public)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/products` | List products (with filter/sort/pagination) | No |
| POST | `/api/products` | Create product | Admin only |
| GET | `/api/products/[id]` | Get single product by ID or SKU | No |

**GET /api/products** query params:
- `category` — filter by category
- `frameType` — filter by frame type
- `compatible` — `prescription`, `bluecut`, `zeropower`, `progressive`
- `minPrice`, `maxPrice`
- `sort` — `price_asc`, `price_desc`, `rating`, `newest`, `bestseller`
- `page`, `limit` (default 20)
- `search` — text search on name/sku/tags

---

### 3.3 Cart

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/cart` | Get current user's cart | Yes |
| POST | `/api/cart` | Add item to cart | Yes |
| PUT | `/api/cart/[itemId]` | Update cart item (qty, lens config) | Yes |
| DELETE | `/api/cart/[itemId]` | Remove item from cart | Yes |

---

### 3.4 Orders

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/orders` | Create new order (after payment) | Yes |
| GET | `/api/orders` | Get logged-in user's orders | Yes |
| GET | `/api/orders/[id]` | Get single order detail | Yes (owner or admin) |

---

### 3.5 Admin — Orders

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/admin/orders` | List all orders (filterable by status, date) | Admin |
| GET | `/api/admin/orders/[id]` | Get full order detail | Admin |
| PUT | `/api/admin/orders/[id]/status` | Update order status | Admin |
| PUT | `/api/admin/orders/[id]/tracking` | Add tracking number + courier | Admin |
| POST | `/api/admin/orders/[id]/refund` | Initiate refund | Admin |
| POST | `/api/admin/orders/[id]/notes` | Add internal note | Admin |

**PUT /api/admin/orders/[id]/status** body:
```json
{ "status": "shipped" }
```

---

### 3.6 Admin — Products

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/admin/products` | List all products (including inactive) | Admin |
| POST | `/api/admin/products` | Create product | Admin |
| PUT | `/api/admin/products/[id]` | Update product | Admin |
| DELETE | `/api/admin/products/[id]` | Soft-delete (set isActive: false) | Admin |
| POST | `/api/admin/products/bulk-import` | CSV bulk import | Admin |

---

### 3.7 Admin — Inventory

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/admin/inventory` | Stock levels per product/color, low-stock alerts | Admin |
| PUT | `/api/admin/inventory/[productId]` | Update stock count for a color variant | Admin |
| POST | `/api/admin/inventory/bulk-update` | CSV batch stock update | Admin |

---

### 3.8 Lens Options

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/lens-options` | List all active lens options (types + quality tiers) | No |
| POST | `/api/lens-options` | Create lens option | Admin |
| PUT | `/api/lens-options/[id]` | Update lens option | Admin |

---

### 3.9 Prescriptions

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/prescriptions` | Upload prescription (multipart/form-data) | Yes |
| GET | `/api/prescriptions` | Get user's saved prescriptions | Yes |
| GET | `/api/admin/prescriptions` | All prescriptions pending review | Admin |
| PUT | `/api/admin/prescriptions/[id]/verify` | Verify or reject prescription | Admin |

---

### 3.10 Coupons

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| POST | `/api/coupons/validate` | Validate a coupon code + calculate discount | Yes |
| GET | `/api/admin/coupons` | List all coupons | Admin |
| POST | `/api/admin/coupons` | Create coupon | Admin |
| PUT | `/api/admin/coupons/[id]` | Update coupon | Admin |
| DELETE | `/api/admin/coupons/[id]` | Deactivate coupon | Admin |

---

### 3.11 Users (Admin)

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/admin/users` | List all customers | Admin |
| GET | `/api/admin/users/[id]` | Customer detail (profile, orders, prescriptions) | Admin |
| POST | `/api/admin/users/[id]/credit` | Issue manual credit/refund | Admin |

---

### 3.12 Reviews

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/products/[id]/reviews` | Get reviews for a product | No |
| POST | `/api/products/[id]/reviews` | Submit a review | Yes |

---

### 3.13 Misc

| Method | Route | Description | Auth Required |
|--------|-------|-------------|---------------|
| GET | `/api/profile` | Get current user's profile | Yes |
| PUT | `/api/profile` | Update name, addresses | Yes |
| GET | `/api/wishlist` | Get wishlist | Yes |
| POST | `/api/wishlist/[productId]` | Toggle wishlist (add/remove) | Yes |

---

## 4. Flutter Screens List

### Auth Screens

| Route | Screen Name | Purpose |
|-------|------------|---------|
| `/welcome` | `WelcomeScreen` | Login gate — choose mobile or email auth |
| `/auth/mobile` | `MobileNumberScreen` | Enter phone number, trigger OTP |
| `/auth/mobile/otp` | `MobileOTPScreen` | Verify OTP sent to phone |
| `/auth/email` | `EmailEntryScreen` | Enter email address, trigger OTP |
| `/auth/email/otp` | `EmailOTPScreen` | Verify OTP sent to email |

### Main App Screens (Bottom Nav)

| Route | Screen Name | Purpose |
|-------|------------|---------|
| `/home` | `HomeScreen` | Hero banner, categories, promo banners, quick-action dock |
| `/categories` | `CategoriesScreen` | Full category grid |
| `/wishlist` | `WishlistScreen` | Saved/liked products |
| `/orders` | `OrdersListScreen` | User's order history |
| `/account` | `AccountScreen` | Profile, addresses, settings |

### Product Screens

| Route | Screen Name | Purpose |
|-------|------------|---------|
| `/products` | `ProductListingScreen` | Filterable/sortable product grid |
| `/products/:id` | `ProductDetailScreen` | Full product view — images, specs, CTAs |
| `/products/:id/360` | `ProductView360Screen` | 3D / 360° model viewer |

### Buy With Lens Wizard (Modal Flow)

| Route | Screen Name | Purpose |
|-------|------------|---------|
| `/lens/type` | `LensTypeScreen` | Step 1 — choose lens type (5 options) |
| `/lens/progressive` | `ProgressiveLensScreen` | Step 1B — progressive tier selection (4 tiers) |
| `/lens/power` | `PowerEntryScreen` | Step 2 — enter SPH/CYL/AXIS/PD for R+L |
| `/lens/quality` | `LensQualityScreen` | Step 3 — choose lens quality tier (4 options) |
| `/lens/checkout` | `CheckoutSummaryScreen` | Step 4 — order summary, coupon, proceed to payment |

### Cart & Checkout Screens

| Route | Screen Name | Purpose |
|-------|------------|---------|
| `/cart` | `CartScreen` | Cart items, quantity controls, price summary |
| `/checkout/address` | `DeliveryAddressScreen` | Select or add delivery address |
| `/checkout/payment` | `PaymentScreen` | Payment method selection, final total |
| `/checkout/confirmation` | `OrderConfirmationScreen` | Success screen with order ID and ETA |

### Utility Screens

| Route | Screen Name | Purpose |
|-------|------------|---------|
| `/search` | `SearchScreen` | Full-text product search |
| `/notifications` | `NotificationsScreen` | Push notification history |
| `/track/:orderId` | `OrderTrackingScreen` | Real-time order tracking |
| `/prescription/upload` | `PrescriptionUploadScreen` | Camera / file upload for prescription |
| `/ar/try-on` | `ARTryOnScreen` | Virtual try-on using AR camera |
| `/fit-guide` | `FrameFitGuideScreen` | Frame fit quiz / guide |
| `/ai-chat` | `AIChatScreen` | EyeGlaze AI Assistant chat |
| `/pd-measure` | `PDMeasureScreen` | Camera-based PD measurement tool |
| `/membership` | `MembershipScreen` | EyeGlaze Membership signup (₹99/year) |
| `/terms` | `TermsWebviewScreen` | Terms of Use webview |
| `/privacy` | `PrivacyWebviewScreen` | Privacy Policy webview |

### Admin Screens (Web Dashboard — Next.js)

| Route | Screen Name | Purpose |
|-------|------------|---------|
| `/admin/login` | `AdminLoginScreen` | Email + password + 2FA login |
| `/admin/dashboard` | `AdminDashboard` | KPI cards, recent orders, quick actions |
| `/admin/products` | `AdminProductsScreen` | Product list — search, filter, CRUD |
| `/admin/products/new` | `AdminProductFormScreen` | Create/edit product form |
| `/admin/orders` | `AdminOrdersScreen` | All orders — filterable by status |
| `/admin/orders/:id` | `AdminOrderDetailScreen` | Full order detail + actions |
| `/admin/inventory` | `AdminInventoryScreen` | Stock levels, low-stock alerts |
| `/admin/coupons` | `AdminPromotionsScreen` | Coupon list and creation |
| `/admin/customers` | `AdminCustomersScreen` | Customer list and detail |
| `/admin/prescriptions` | `AdminPrescriptionsScreen` | Prescription verification queue |
| `/admin/analytics` | `AdminAnalyticsScreen` | Revenue, funnel, retention reports |

---

## 5. Key Flows

### 5.1 Auth Flow (Phone OTP)

1. User taps **"Continue with Mobile Number"** on `WelcomeScreen`
2. Enters 10-digit number + country code (+91 default) on `MobileNumberScreen`
3. App calls `POST /api/auth/send-otp` with `{ phone, countryCode }`
4. Backend generates OTP, stores hashed value + expiry (now + 5 min) on User doc, dispatches SMS
5. User enters OTP on `MobileOTPScreen`
6. App calls `POST /api/auth/verify-otp`; backend validates hash + expiry
7. On success: if new user → creates User doc; if existing → retrieves it
8. Backend returns JWT; app stores in secure storage
9. User lands on `HomeScreen`

**Email OTP path:** Same flow via `EmailEntryScreen` → `EmailOTPScreen`, OTP delivered by email.

**Error cases:**
- Invalid/expired OTP → "Incorrect OTP. X attempts remaining."
- Resend (after 30-second cooldown) → new OTP, timer resets

---

### 5.2 Product Discovery Flow

1. `HomeScreen` → tap category tile or "SHOP NOW" hero CTA
2. `ProductListingScreen` shows filtered grid (2-col)
   - Each card: image, BESTSELLER badge, name, frame type, price strip, rating, "Add +" quick-add
3. Tap card → `ProductDetailScreen`
   - Swipeable gallery, color swatch selector (updates images + specs)
   - Frame spec strip: width, lens width, bridge, temple length
   - Frame details card (material, feature tags, compatibility)
   - Bottom sticky bar: **ADD TO CART** (outlined) | **BUY WITH LENS** (gold fill)

---

### 5.3 Buy With Lens Wizard (4-Step Flow)

**Triggered by:** "BUY WITH LENS" or "SELECT LENS" on Product Detail.

**Step 1 — Lens Type (`LensTypeScreen`)**
- User picks one of 5 types (radio card): Single Vision / Progressive / Zero Power / Blue Cut / Photochromic
- If **Progressive** selected → sub-screen `ProgressiveLensScreen` to choose tier (HC / Premium / Advanced / Elite)
- Data captured: `lensType`, `lensSubType` (if progressive)

**Step 2 — Power Entry (`PowerEntryScreen`)**
- SPH, CYL, AXIS for Right Eye and Left Eye (stepper pickers)
- PD in mm
- Alternative: upload prescription image
- Data captured: `power.RE`, `power.LE`, `power.pd`

**Step 3 — Lens Quality (`LensQualityScreen`)**
- Pick quality tier (radio card): HMC+Blue Cut (₹999) / HMC (₹699) / Blue Cut (₹899) / HC (₹799)
- Data captured: `lensQuality`, `lensPrice`

**Step 4 — Checkout Summary (`CheckoutSummaryScreen`)**
- Shows order recap: frame + color + size + qty + lens type + power + quality
- Pricing breakdown: Frame ₹1 + Lenses + Fitting ₹199 + Delivery ₹99
- Coupon input field
- EyeGlaze Membership upsell (₹99/year)
- CTA: **PROCEED TO PAYMENT** → `PaymentScreen`

---

### 5.4 Checkout Flow

1. **`CartScreen`** — review items, adjust qty, remove items
2. **`DeliveryAddressScreen`** — select saved address or add new (name, mobile, pincode, line1, line2, city, state, type)
3. **`PaymentScreen`** — choose UPI / Card / Net Banking / Wallet / COD; "PAY NOW ₹X,XXX"
4. Payment gateway processes transaction; returns result
5. **`OrderConfirmationScreen`** — success animation, order ID, ETA, "TRACK ORDER" | "CONTINUE SHOPPING"

---

### 5.5 Admin Order Management Flow

1. Admin logs in at `/admin/login` (email + password + 2FA OTP)
2. Dashboard shows KPIs and pending orders
3. `AdminOrdersScreen` filters by status (Pending → Confirmed → Processing → Shipped → Delivered)
4. For each order:
   - View lens prescription (type, power, uploaded image if any)
   - Update status via `PUT /api/admin/orders/[id]/status`
   - Add tracking number via `PUT /api/admin/orders/[id]/tracking`
   - Verify prescription in `AdminPrescriptionsScreen` queue (Pending → Verified → ready for lens cutting)
5. Analytics (`AdminAnalyticsScreen`) tracks conversion funnel from product view → wizard step → checkout → payment

---

## 6. Business Rules

### 6.1 Pricing

| Item | Price |
|------|-------|
| Frame (promotional selling price) | ₹1 |
| Frame (original MRP, strikethrough) | ₹999 |
| Delivery charge | ₹99 |
| Fitting charge (when lenses added) | ₹199 |
| EyeGlaze Membership | ₹99/year |
| Single Vision lenses (starting) | ₹699 |
| Zero Power lenses (starting) | ₹699 |
| Blue Cut lenses (starting) | ₹899 |
| HC lens quality | ₹799/pair |
| HMC lens quality | ₹699/pair |
| HMC + Blue Cut lens quality | ₹999/pair |
| Blue Cut lens quality | ₹899/pair |
| Photochromic lenses (starting) | ₹1,499 |
| HC Progressive | ₹2,499/pair |
| Premium Progressive | ₹3,499/pair |
| Advanced Progressive | ₹4,499/pair |
| Elite Progressive | ₹5,499/pair |

**Sample order total calculation:**
- Frame: ₹1
- Lenses (HMC + Blue Cut): ₹999
- Fitting: ₹199
- Delivery: ₹99
- **Total: ₹1,298**
- "You save ₹201 on this order" (₹999 MRP frame saving)

### 6.2 OTP Rules

- OTP expires **5 minutes** after generation
- Resend allowed after **30-second** cooldown timer
- Max OTP attempts before lockout: implement server-side (recommend 5 attempts)
- OTP stored as **hashed** value in User.otp field

### 6.3 Lens Rules

- All lenses include **100% UV Protection**
- All lenses carry a **1-year warranty**
- Fitting charge (₹199) applies **only when lenses are added** to a frame order
- Frame-only orders: no fitting charge, delivery ₹99 still applies
- Lens supplier: **Lenskart** (shown in wizard footer)
- Power entry required for: Single Vision, Progressive, Photochromic
- Power entry NOT required for: Zero Power (Plano), Blue Cut (style/protection only)

### 6.4 Prescription Rules

- Prescription images uploaded by customer are queued for optician review
- Status: `pending` → `verified` → lens cutting begins
- If rejected: customer notified to re-upload
- Admin can override power values (correct OCR/entry errors)
- Prescription saved to `Prescription` model and linked to order

### 6.5 Product / Inventory Rules

- `isActive: false` removes product from storefront ("Add to Cart" hidden)
- Low-stock threshold is configurable (recommended: < 10 units); triggers admin alert
- Out-of-stock hides "Add to Cart" button on product card and detail
- Soft-delete only — products are archived, not permanently removed
- Frame prices: ₹1 selling / ₹999 MRP (50% off badge shown)
- Min product images: 4 product photos + 1 model wearing frame

### 6.6 User Roles

| Role | Access |
|------|--------|
| `user` | Browse, cart, orders, wishlist, prescriptions |
| `admin` (super_admin) | Full access to all admin routes |
| `admin` (store_manager) | Products, orders, inventory |
| `admin` (support_agent) | Orders and customer queries only |

### 6.7 Cart Rules

- One cart document per user (upserted on add)
- Cart persists across sessions
- Guest browsing allowed; cart/checkout requires login
- Frame-only add-to-cart (no lens): `lensType`, `lensSubType`, `power`, `lensQuality`, `lensPrice` fields are null/omitted

### 6.8 Order Status Pipeline

```
pending → confirmed → processing → shipped → delivered
                                           ↘ cancelled
                                           ↘ returned
```

- `pending`: payment received, awaiting admin confirmation
- `confirmed`: admin confirmed order
- `processing`: lens cutting / quality check in progress
- `shipped`: dispatched with tracking number
- `delivered`: confirmed delivered
- `cancelled`: cancelled before shipping
- `returned`: return initiated after delivery

### 6.9 Coupon Rules

- Validated server-side at `POST /api/coupons/validate`
- Discount applied before total displayed on `CheckoutSummaryScreen`
- Coupon constraints: min order value, max discount cap, usage limit per user, validity dates
- Applicable scope: all products, specific categories, or specific SKUs

### 6.10 Trust Signals (Display Rules)

Display the following trust strip on every purchase-critical screen (product detail, wizard steps, checkout):
- 100% Authentic / Secure Payment
- 1 Year Warranty
- Easy Returns / 7 Days Return
- Fast Delivery 2–4 Days
- 24/7 Support

---

## 7. IMPLEMENTATION STATUS (as of 2026-06-16)

### Build Status
- Web (Next.js): ✅ PASS — 32 routes, 0 TypeScript errors
- Mobile (Flutter): ✅ PASS — 29 files, 0 analyze errors
- Server (API): ✅ PASS — 22 API routes, 7 MongoDB models

### Bugs Fixed During Verification
1. Admin dashboard stats mapping — nested API response was not flattened correctly
2. Admin orders page — was using mock data, now calls real API
3. Mobile addToCart — was sending `product` field, should be `productId`
4. Lens checkout framePrice — was hardcoded ₹1, now reads from product.sellingPrice
5. Lens checkout coupon — Apply button was no-op, now calls /api/coupons/validate
6. Lens checkout PROCEED TO PAYMENT — was showing only a snackbar, now calls addToCart with full lensConfig

### How to Run

**Web + API Server:**
```bash
cd /Users/manoj/Desktop/speshway/EyeGlaze/web
cp .env.local .env.local  # set MONGODB_URI
npm run dev
# Open http://localhost:3000
```

**Seed Database:**
```bash
cd /Users/manoj/Desktop/speshway/EyeGlaze/web
npx tsx src/scripts/seed.ts
# Creates lens options, 6 products, 1 admin user (phone: 9999999999)
```

**Mobile App:**
```bash
cd /Users/manoj/Desktop/speshway/EyeGlaze/mobile
flutter pub get
flutter run
```

### Screens Implemented
**Web:** Landing, Login (mobile/email + OTP), Products, Product Detail, Cart, Orders, Account, Admin Dashboard, Admin Products, Admin Orders, Admin Inventory, Admin Users

**Mobile:** Login, Phone Login (with numpad), OTP, Home (hero/categories/promos/quick actions), Products, Product Detail, Lens Wizard (4 steps), Cart, Orders, Account

### What's Next
- Payment gateway integration (Razorpay)
- SMS OTP via Twilio / email via SendGrid (stubs ready in otp-sender.ts)
- Push notifications
- 360° virtual try-on
- AI assistant chat

---

*End of EyeGlaze Knowledge Base*
