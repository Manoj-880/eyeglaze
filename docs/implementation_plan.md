# EyeGlaze — Implementation Plan

> **Stack:** Next.js 15 (App Router, TypeScript, Tailwind) · Flutter (Dart) · MongoDB + Mongoose
> **Theme:** Dark (#0D0D0D bg, #D4922A gold accent, #FFFFFF text)
> **Last Updated:** 2026-06-16

---

## Phase 1: Foundation

*Everything else depends on this. Build this first, commit, and keep it stable.*

---

### 1.1 MongoDB Connection

**File:** `web/src/lib/mongodb.ts` *(modify existing)*

**Implementation notes:**
- Use a cached singleton pattern to prevent multiple connections in Next.js dev (hot reload creates new modules).
- Export a `connectDB()` async function that resolves to the cached mongoose connection.
- Read `MONGODB_URI` from `process.env`.
- Throw a clear error if the env var is missing.

```ts
// Pattern:
let cached = global.mongoose ?? { conn: null, promise: null }
export async function connectDB() { ... }
```

**Dependencies:** None.

---

### 1.2 MongoDB Models

All model files go in `web/src/models/`.

#### 1.2.1 User Model
**File:** `web/src/models/User.ts`

Fields:
- `mobile` — String, sparse unique (null if email-only user)
- `countryCode` — String, default `'+91'`
- `email` — String, sparse unique (null if mobile-only user)
- `name` — String, optional
- `role` — enum `['customer', 'admin', 'store_manager', 'support_agent']`, default `'customer'`
- `addresses` — Array of embedded address subdocuments:
  - `fullName`, `mobile`, `pincode`, `line1`, `line2`, `city`, `state`, `type` (enum Home/Work/Other)
- `savedPrescriptions` — Array of ObjectId refs to `Prescription`
- `wishlist` — Array of ObjectId refs to `Product`
- `membershipActive` — Boolean, default false
- `membershipExpiry` — Date
- `termsAcceptedAt` — Date
- `otp` — String (hashed, temp storage during auth)
- `otpExpiry` — Date
- `createdAt`, `updatedAt` — timestamps

**Dependencies:** None.

---

#### 1.2.2 Product Model
**File:** `web/src/models/Product.ts`

Fields:
- `sku` — String, unique (e.g., `'EG-2041'`)
- `name` — String (e.g., `'Matte Square Frame'`)
- `frameType` — String (Square, Round, Clubmaster, Aviator, Wayfarer, etc.)
- `material` — String
- `category` — enum `['prescription', 'sunglasses', 'blue_light', 'contact_lenses', 'kids']`
- `featureTags` — Array of strings (Lightweight, Flexible, Skin Friendly, Durable, etc.)
- `lensCompatibility` — Array of enum `['prescription', 'blue_cut', 'zero_power', 'progressive']`
- `colors` — Array of subdocuments:
  - `name` — String (e.g., `'Matte Black'`)
  - `hex` — String
  - `stock` — Number
  - `images` — Array of Strings (URLs/paths for main + gallery + model photo)
- `dimensions` — Subdocument:
  - `frameWidth`, `lensWidth`, `bridgeWidth`, `templeLength` — Numbers (mm)
- `mrp` — Number
- `sellingPrice` — Number
- `discountPercent` — Number (computed or stored)
- `rating` — Number (0–5)
- `reviewCount` — Number
- `weeklyBought` — Number (for social proof)
- `isBestseller` — Boolean
- `isActive` — Boolean, default true
- `seoTitle`, `seoDescription` — Strings
- `createdAt`, `updatedAt` — timestamps

**Dependencies:** None.

---

#### 1.2.3 LensOption Model
**File:** `web/src/models/LensOption.ts`

This model covers both lens *types* (Step 1 of wizard) and lens *quality tiers* (Step 3).

Fields:
- `kind` — enum `['type', 'quality']`
- `name` — String (e.g., `'Single Vision'`, `'HMC + Blue Cut'`)
- `description` — String
- `startingPrice` — Number
- `features` — Array of strings
- `isBestseller` — Boolean
- `isRecommended` — Boolean
- `sortOrder` — Number
- `isActive` — Boolean

For progressive sub-tiers (Step 1B), store separate `LensOption` documents with `kind: 'type'` and a `subKind: 'progressive_tier'` field plus a `tier` rank field.

**Dependencies:** None.

---

#### 1.2.4 Cart Model
**File:** `web/src/models/Cart.ts`

Fields:
- `user` — ObjectId ref `User`
- `items` — Array of subdocuments:
  - `product` — ObjectId ref `Product`
  - `color` — String (color name)
  - `qty` — Number
  - `framePrice` — Number
  - `lens` — optional subdocument:
    - `lensType` — String
    - `lensQuality` — String
    - `progressiveTier` — String (if progressive)
    - `power` — subdocument: `sphR`, `cylR`, `axisR`, `sphL`, `cylL`, `axisL`, `pd` — Numbers
    - `prescriptionImage` — String (URL, optional)
    - `lensPrice` — Number
    - `fittingCharge` — Number (199)
  - `deliveryCharge` — Number (99)
- `couponCode` — String
- `couponDiscount` — Number
- `updatedAt` — Date

**Dependencies:** `User`, `Product`.

---

#### 1.2.5 Order Model
**File:** `web/src/models/Order.ts`

Fields:
- `orderId` — String, unique, auto-generated (e.g., `'EG-ORD-20260616-0001'`)
- `user` — ObjectId ref `User`
- `items` — same shape as `Cart.items` (snapshot at order time — do NOT use refs, store full data so historical orders are stable)
- `deliveryAddress` — embedded subdocument (full address snapshot)
- `pricing` — subdocument:
  - `subtotal`, `lensCharges`, `fittingCharge`, `deliveryCharge`, `couponDiscount`, `total` — Numbers
- `couponCode` — String
- `paymentMethod` — String
- `paymentStatus` — enum `['pending', 'paid', 'failed', 'refunded']`
- `transactionId` — String
- `status` — enum `['pending', 'processing', 'dispatched', 'delivered', 'cancelled', 'returned']`
- `statusHistory` — Array of `{ status, timestamp, note }`
- `trackingNumber` — String
- `courierPartner` — String
- `prescriptionVerified` — Boolean, default false
- `internalNotes` — Array of `{ note, addedBy, addedAt }`
- `estimatedDelivery` — Date
- `createdAt`, `updatedAt` — timestamps

**Dependencies:** `User`.

---

#### 1.2.6 Prescription Model
**File:** `web/src/models/Prescription.ts`

Fields:
- `user` — ObjectId ref `User`
- `imageUrl` — String
- `sphR`, `cylR`, `axisR`, `sphL`, `cylL`, `axisL`, `pd` — Numbers
- `verificationStatus` — enum `['pending', 'verified', 'rejected']`, default `'pending'`
- `verifiedBy` — ObjectId ref `User` (admin)
- `rejectionReason` — String
- `createdAt`, `updatedAt` — timestamps

**Dependencies:** `User`.

---

#### 1.2.7 Review Model
**File:** `web/src/models/Review.ts`

Fields:
- `product` — ObjectId ref `Product`
- `user` — ObjectId ref `User`
- `rating` — Number 1–5
- `title` — String
- `body` — String
- `isVerifiedPurchase` — Boolean
- `createdAt`, `updatedAt` — timestamps

**Index:** compound unique on `{ product, user }` (one review per user per product).

**Dependencies:** `Product`, `User`.

---

### 1.3 Theme Constants

#### Web Theme
**File:** `web/src/lib/theme.ts` *(create)*

Export a `COLORS` object and Tailwind class helpers:
```ts
export const COLORS = {
  bg: '#0D0D0D',
  card: '#1A1A1A',
  gold: '#D4922A',
  textPrimary: '#FFFFFF',
  textSecondary: '#999999',
  error: '#FF4444',
  success: '#4CAF50',
}
```

**File:** `web/tailwind.config.ts` *(modify)*
- Add `eyeglaze` color palette extending `theme.extend.colors` so classes like `bg-eyeglaze-gold`, `text-eyeglaze-gold`, `bg-eyeglaze-bg` are available.

#### Flutter Theme
**File:** `mobile/lib/theme/app_colors.dart` *(create)*
```dart
class AppColors {
  static const Color background = Color(0xFF0D0D0D);
  static const Color card = Color(0xFF1A1A1A);
  static const Color gold = Color(0xFFD4922A);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFF999999);
  static const Color error = Color(0xFFFF4444);
  static const Color success = Color(0xFF4CAF50);
}
```

**File:** `mobile/lib/theme/app_theme.dart` *(create)*
- Build a `ThemeData` using `AppColors`. Set `scaffoldBackgroundColor`, `appBarTheme`, `elevatedButtonTheme` (gold fill, white text), `textTheme` (white primary, grey secondary), `cardColor`.
- Export `AppTheme.dark()` → `ThemeData`.

**File:** `mobile/lib/theme/app_text_styles.dart` *(create)*
- Define named `TextStyle` constants: `heading1`, `heading2`, `bodyRegular`, `bodySmall`, `price`, `discount`, `link`, `buttonLabel`, `badge`.

**File:** `mobile/lib/theme/index.dart` *(create, barrel export)*

**Dependencies:** None.

---

## Phase 2: Auth

*Dependencies: Phase 1 complete (User model, mongodb.ts).*

---

### 2.1 Auth Utilities (Web)

**File:** `web/src/lib/auth.ts` *(create)*

- `generateOTP()` — returns a 6-digit string.
- `hashOTP(otp: string)` — bcrypt hash with salt rounds 10.
- `verifyOTP(otp: string, hash: string)` — bcrypt compare.
- `signJWT(payload: { userId: string; role: string })` — signs with `JWT_SECRET` env var, expiry 30 days.
- `verifyJWT(token: string)` — returns payload or throws.
- `setAuthCookie(res: NextResponse, token: string)` — sets `eyeglaze_auth` httpOnly cookie, `sameSite: 'lax'`, `secure: true` in production, `maxAge: 30 days`.
- `clearAuthCookie(res: NextResponse)` — expires the cookie.
- `getAuthUser(req: NextRequest)` — reads cookie, verifies JWT, returns `{ userId, role }` or null.

**Env vars needed:**
- `JWT_SECRET`
- `MONGODB_URI`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (SMS OTP)
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` (email OTP)

**File:** `web/src/lib/otp-sender.ts` *(create)*
- `sendSMSOTP(mobile: string, countryCode: string, otp: string)` — Twilio SMS.
- `sendEmailOTP(email: string, otp: string)` — SendGrid.
- Use conditional stubs if env vars missing (console.log for dev).

---

### 2.2 Auth API Routes (Web)

#### POST /api/auth/send-otp
**File:** `web/src/app/api/auth/send-otp/route.ts` *(create)*

Request body: `{ type: 'mobile' | 'email', mobile?: string, countryCode?: string, email?: string }`

Logic:
1. Validate input (mobile = 10 digits, email = valid format).
2. Generate 6-digit OTP.
3. Hash OTP.
4. Find or create User by mobile/email (upsert).
5. Store `otp` (hash) and `otpExpiry` (now + 10 min) on user document.
6. Call `sendSMSOTP` or `sendEmailOTP`.
7. Return `200 { success: true, message: 'OTP sent' }`.
8. Rate limit: max 3 OTP requests per 10 min per mobile/email (store attempt count in user doc or Redis).

---

#### POST /api/auth/verify-otp
**File:** `web/src/app/api/auth/verify-otp/route.ts` *(create)*

Request body: `{ type: 'mobile' | 'email', mobile?: string, countryCode?: string, email?: string, otp: string }`

Logic:
1. Find user by mobile/email.
2. Check `otpExpiry` > now.
3. `verifyOTP(otp, user.otp)` — bcrypt compare.
4. If mismatch: increment attempt counter, return `401`.
5. If match: clear `otp`, `otpExpiry`; set `termsAcceptedAt` if first login.
6. `signJWT({ userId, role })`.
7. `setAuthCookie(res, token)`.
8. Return `200 { success: true, user: { id, role, name, mobile, email } }`.

---

#### POST /api/auth/logout
**File:** `web/src/app/api/auth/logout/route.ts` *(create)*

- `clearAuthCookie(res)`.
- Return `200 { success: true }`.

---

#### GET /api/auth/me
**File:** `web/src/app/api/auth/me/route.ts` *(create)*

- `getAuthUser(req)` → if null return `401`.
- Fetch user from DB, return sanitized profile (no OTP fields).

---

### 2.3 Auth Middleware (Web)

**File:** `web/src/middleware.ts` *(create or modify)*

- Protect `/api/admin/*` routes: require `role` in `['admin', 'store_manager', 'support_agent']`.
- Protect `/api/cart/*`, `/api/orders/*`: require any authenticated user.
- Public: `/api/auth/*`, `/api/products/*`, `/api/lens-options`.
- Redirect unauthenticated web requests to `/login`.

---

### 2.4 Web Login Page

**File:** `web/src/app/(auth)/login/page.tsx` *(create)*
**File:** `web/src/app/(auth)/layout.tsx` *(create — minimal dark layout, no sidebar)*

The login page is a single-page component managing local state for the auth step:
- Step `'welcome'` — shows two option cards (Mobile / Email).
- Step `'mobile-entry'` — mobile number input with country code selector and numeric keypad.
- Step `'mobile-otp'` — 6-box OTP input, countdown timer (30s), resend.
- Step `'email-entry'` — email input.
- Step `'email-otp'` — 6-box OTP input, countdown, resend.

UI notes:
- Background `#0D0D0D`, card background `#1A1A1A`.
- EyeGlaze logo (serif, gold) centered at top.
- CTAs: full-width, `#D4922A` fill, white bold text.
- Trust badge strip (4 icons) on every step.
- Terms & Privacy links in gold.
- On successful verify-otp: redirect to `/` (or `callbackUrl` query param).

**File:** `web/src/components/auth/OtpInput.tsx` *(create)*
- 6 individual `<input>` boxes; auto-focus next on entry; handle backspace to previous.

**File:** `web/src/components/auth/CountryCodeSelector.tsx` *(create)*
- Dropdown with common codes; default `+91`.

**File:** `web/src/hooks/useAuth.ts` *(create)*
- Wraps send-otp and verify-otp API calls, exposes loading/error state.
- On success stores user state (use React Context or Zustand).

**File:** `web/src/context/AuthContext.tsx` *(create)*
- Provides `{ user, isLoading, logout }` to app.
- On mount, calls `GET /api/auth/me` to hydrate.

---

### 2.5 Flutter Auth Screens

**File:** `mobile/lib/screens/auth/welcome_screen.dart` *(create)*

Two option cards ("Continue with Mobile Number", "Continue with Email"), trust badges, terms footer.

**File:** `mobile/lib/screens/auth/mobile_number_screen.dart` *(create)*

- Country code selector (`+91` default).
- Custom numeric keypad widget (not system keyboard).
- "SEND OTP" gold button.
- "Continue with Email" link.

**File:** `mobile/lib/screens/auth/mobile_otp_screen.dart` *(create)*

- 6-box segmented OTP input.
- 30-second countdown timer (`Timer.periodic`).
- "Resend OTP" activates after timer.
- "VERIFY" button.

**File:** `mobile/lib/screens/auth/email_entry_screen.dart` *(create)*

**File:** `mobile/lib/screens/auth/email_otp_screen.dart` *(create)*

**File:** `mobile/lib/widgets/auth/otp_input_row.dart` *(create)*
- 6 `TextField` boxes in a `Row`; `FocusNode` chain for auto-advance.

**File:** `mobile/lib/widgets/auth/numeric_keypad.dart` *(create)*
- Custom widget rendering digits 0–9 plus backspace in a 3-column grid.

**File:** `mobile/lib/widgets/auth/trust_badge_strip.dart` *(create)*
- Horizontal `Row` of 4 icon+label trust badges.

**File:** `mobile/lib/services/auth_service.dart` *(create)*
- `Future<void> sendOTP({type, mobile, countryCode, email})` — POST `/api/auth/send-otp`.
- `Future<Map> verifyOTP({type, mobile, countryCode, email, otp})` — POST `/api/auth/verify-otp`.
- On success: save JWT to `FlutterSecureStorage` under key `eyeglaze_token`.

**File:** `mobile/lib/models/user_model.dart` *(create)*
- Dart class with `fromJson` factory.

**File:** `mobile/lib/providers/auth_provider.dart` *(create)*
- `ChangeNotifier` (or Riverpod Provider) holding `UserModel? currentUser`, `bool isLoading`.
- `login()`, `logout()`, `checkAuth()` methods.
- On app start, `checkAuth()` reads stored token and calls `GET /api/auth/me`.

**Navigation:** After successful OTP verify → `Navigator.pushReplacementNamed(context, '/home')`.

---

## Phase 3: Core Product APIs

*Dependencies: Phase 1 (Product, LensOption models).*

---

### 3.1 Product API Routes

#### GET /api/products
**File:** `web/src/app/api/products/route.ts` *(create)*

Query params: `category`, `frameType`, `minPrice`, `maxPrice`, `sort` (`price_asc`, `price_desc`, `rating`, `newest`), `page`, `limit` (default 20).

- Build mongoose query from params.
- Filter `isActive: true`.
- Return `{ products: [...], total, page, totalPages }`.

#### POST /api/products
**File:** same `route.ts`

- Admin-only (check `getAuthUser` role).
- Validate body against Product schema.
- Auto-generate SKU if not provided: `EG-` + 4-digit incrementing number.
- Return created product.

#### GET /api/products/[id]
**File:** `web/src/app/api/products/[id]/route.ts` *(create)*

- Accept either MongoDB `_id` or `sku` (check if param matches `/^EG-/`).
- Populate reviews (latest 10).
- Return full product document.

#### PUT /api/products/[id]
**File:** same `[id]/route.ts`

- Admin-only.
- Partial update via `findByIdAndUpdate`.

#### DELETE /api/products/[id]
**File:** same `[id]/route.ts`

- Admin-only.
- Soft delete: set `isActive: false`.

---

### 3.2 Lens Options API

#### GET /api/lens-options
**File:** `web/src/app/api/lens-options/route.ts` *(create)*

Query param: `kind` (`type` | `quality` | omit for all).

- Return all active lens options sorted by `sortOrder`.
- Response shape: `{ lensTypes: [...], lensQualities: [...] }` (grouped).

---

### 3.3 Seed Script

**File:** `web/src/scripts/seed.ts` *(create)*

Run via: `npx tsx src/scripts/seed.ts`

Seeds:
1. **LensOptions** — all 5 lens types + 4 progressive tiers + 4 quality tiers from flow.md section 4.
2. **Products** — at least 6 sample products:
   - EG-2041 Matte Square Frame (TR90, category: prescription, 5 colors)
   - EG-1067 Premium Clubmaster Frame (Metal, category: prescription, 4 colors)
   - EG-3012 Classic Aviator (Metal, category: sunglasses)
   - EG-4001 Kids Round Frame (TR90, category: kids)
   - EG-5010 Blue Light Blocker (Acetate, category: blue_light)
   - EG-6003 Progressive Ready Wide Frame (TR90, category: prescription)
3. **Admin user** — one user with `role: 'admin'`, mobile `+919999999999`.

Script must be idempotent (use `upsert` / delete-then-insert pattern).

---

## Phase 4: Web User UI

*Dependencies: Phase 1 (theme), Phase 2 (auth), Phase 3 (product APIs).*

---

### 4.1 Root Layout & Global Components

**File:** `web/src/app/layout.tsx` *(modify)*
- Wrap with `AuthContext.Provider`.
- Set `<html>` background to `#0D0D0D`.
- Include global font (serif for logo, sans-serif for body).

**File:** `web/src/app/globals.css` *(modify)*
- Add CSS vars: `--color-gold: #D4922A`, `--color-bg: #0D0D0D`, etc.

**File:** `web/src/components/layout/Navbar.tsx` *(create)*
- Logo (serif, gold), search icon, cart icon with badge, account icon.
- If authenticated: show user icon; else "Login" link.

**File:** `web/src/components/layout/TrustBadgeStrip.tsx` *(create)*
- Reusable 4-badge strip component (props: which 4 badges to show).

---

### 4.2 Home Page

**File:** `web/src/app/(main)/page.tsx` *(create)*
**File:** `web/src/app/(main)/layout.tsx` *(create — includes Navbar + Footer)*

Sections (match mobile design):
1. **Hero banner carousel** — `HeroBanner.tsx` component. 4 slides. Auto-advance every 4s. Dot indicators.
2. **Trust strip** — 4 badges: 100% Authentic, Premium Quality, 7 Days Return, Free Shipping.
3. **Shop by Category** — horizontal scroll row of 5 category tiles (circular icon cards). "View All" link.
4. **Promotional banners** — 2-column grid, "UP TO 50% OFF" + "NEW ARRIVALS".
5. **Quick Action Dock** — 5 icon buttons. Center "Ask AI" is elevated/gold.
6. **Featured Products** — grid of product cards fetched from `GET /api/products?sort=rating&limit=8`.

**Files to create:**
- `web/src/components/home/HeroBanner.tsx`
- `web/src/components/home/CategoryTile.tsx`
- `web/src/components/home/PromoBanner.tsx`
- `web/src/components/home/QuickActionDock.tsx`
- `web/src/components/products/ProductCard.tsx` *(reused across pages)*

**ProductCard** shows: image, BESTSELLER badge (conditional), name, price with strikethrough MRP, discount %, rating stars, "Add +" button.

---

### 4.3 Product Listing Page

**File:** `web/src/app/(main)/products/page.tsx` *(create)*

- `searchParams`: `category`, `frameType`, `sort`, `page`.
- Calls `GET /api/products` server-side (RSC fetch).
- Renders filter sidebar (left) + product grid (right, 2-column on mobile, 3-column desktop).
- Filter sidebar: category, frame type, price range, rating.
- Sort bar: Featured / Price Low-High / Price High-Low / Top Rated / Newest.

**File:** `web/src/components/products/ProductGrid.tsx` *(create)*
**File:** `web/src/components/products/FilterSidebar.tsx` *(create)*
**File:** `web/src/components/products/SortBar.tsx` *(create)*

---

### 4.4 Product Detail Page

**File:** `web/src/app/(main)/products/[id]/page.tsx` *(create)*

- Server component; fetch product via `GET /api/products/[id]`.
- `generateMetadata` for SEO using product's `seoTitle`/`seoDescription`.

Sections (match flow.md Section 3.2):
1. **Image carousel** — swipeable, dot indicators, thumbnail strip (use `embla-carousel-react`).
2. **Product info block** — SKU, name, rating, review count, social proof, share/wishlist icons.
3. **Pricing block** — selling price, strikethrough MRP, discount badge, delivery info.
4. **Color selector** — swatch circles; selecting updates carousel image.
5. **Frame measurements** — 4-spec strip (frameWidth, lensWidth, bridgeWidth, templeLength).
6. **Frame details card** — material, feature tags, lens compatibility.
7. **Lens CTA row** — "Add Prescription Lenses — Starting from ₹499" + "SELECT LENS" button.
8. **Sticky bottom bar** — price | "ADD TO CART" (outlined) | "BUY WITH LENS" (gold fill).
9. **Trust strip** + AI help banner.

**Files to create:**
- `web/src/components/products/ImageCarousel.tsx`
- `web/src/components/products/ColorSelector.tsx`
- `web/src/components/products/FrameSpecs.tsx`
- `web/src/components/products/StickyProductBar.tsx`
- `web/src/components/products/RatingStars.tsx`

**Client component note:** Color selector, carousel, and add-to-cart actions must be `'use client'` components. Wrap them in a `ProductInteractiveShell` client component; keep the outer page as RSC.

---

### 4.5 Cart Page

**File:** `web/src/app/(main)/cart/page.tsx` *(create)*

- Protected route (redirect to login if not authenticated).
- Fetch cart from `GET /api/cart`.
- Each item shows: thumbnail, name, color, lens details, qty stepper, remove, per-item price.
- Price summary panel: subtotal, lens charges, delivery, coupon savings, total.
- "Apply Coupon" input.
- "PROCEED TO CHECKOUT" gold CTA.

**File:** `web/src/components/cart/CartItem.tsx` *(create)*
**File:** `web/src/components/cart/PriceSummary.tsx` *(create)*
**File:** `web/src/hooks/useCart.ts` *(create)*
- Client-side cart state management; wraps `POST/PUT/DELETE /api/cart`.

---

## Phase 5: Mobile UI

*Dependencies: Phase 1 (Flutter theme), Phase 2 (auth screens), Phase 3 (product APIs).*

---

### 5.1 App Entry & Routing

**File:** `mobile/lib/main.dart` *(modify)*
- Wrap with `ChangeNotifierProvider<AuthProvider>`.
- Apply `AppTheme.dark()`.
- Initial route: `AuthProvider.currentUser == null ? '/welcome' : '/home'`.

**File:** `mobile/lib/routes/app_router.dart` *(create)*
- Named routes map covering all screens.

---

### 5.2 Home Screen

**File:** `mobile/lib/screens/home/home_screen.dart` *(create)*

Uses `Scaffold` with:
- `AppBar`: hamburger (left), EyeGlaze logo (center, serif gold text), search + bell + cart icons (right).
- `BottomNavigationBar`: 5 tabs — Home, Categories, Wishlist, Orders, Account.
- `SingleChildScrollView` body with sections:

**Section widgets (each in own file under `mobile/lib/widgets/home/`):**
- `hero_banner.dart` — `PageView` with 4 slides + dot indicators + auto-advance `Timer`.
- `trust_strip.dart` — `Row` of 4 badges.
- `category_scroll.dart` — `ListView.builder` horizontal, `CircleAvatar` tiles with labels.
- `promo_banners.dart` — `GridView` 2 columns, gold "SHOP NOW" buttons.
- `quick_action_dock.dart` — `Row` of 5 `InkWell` icon+label tiles; center AI tile is gold-tinted.

**File:** `mobile/lib/services/product_service.dart` *(create)*
- `Future<List<Product>> getProducts({String? category, String? sort, int page = 1})` — GET `/api/products`.
- `Future<Product> getProduct(String id)` — GET `/api/products/[id]`.
- Attach JWT from `FlutterSecureStorage` to all authenticated requests.
- Base URL from `AppConfig` (env-switchable).

**File:** `mobile/lib/config/app_config.dart` *(create)*
- `static const String apiBase = 'http://localhost:3000/api'` (dev) / prod URL.

---

### 5.3 Product Listing Screen

**File:** `mobile/lib/screens/products/product_listing_screen.dart` *(create)*

- Accepts `category` and `frameType` optional named parameters.
- `GridView.builder` 2-column.
- Filter/sort bottom sheet.
- Pagination via `ScrollController` (load more on near-bottom).

**File:** `mobile/lib/widgets/products/product_card.dart` *(create)*
- Shows: image, BESTSELLER badge, name, price, strikethrough MRP, discount %, stars, "Add +" button.

**File:** `mobile/lib/widgets/products/filter_bottom_sheet.dart` *(create)*

---

### 5.4 Product Detail Screen

**File:** `mobile/lib/screens/products/product_detail_screen.dart` *(create)*

Sections (follow flow.md Section 3.2 exactly):
1. **Image carousel** — `PageView` + thumbnail strip (`ListView` horizontal, 5 thumbnails).
2. **Product info** — SKU, name, `RatingBar`, review count, social proof text.
3. **Pricing** — selling price in large white bold, strikethrough MRP, gold "50% OFF" badge, delivery info.
4. **Color selector** — `Row` of `CircleAvatar` swatches; active has gold checkmark overlay.
5. **Frame specs strip** — `Row` of 4 icon+value tiles (frame width, lens width, bridge, temple).
6. **Frame details card** — expandable `ExpansionTile`, feature tag chips.
7. **Lens CTA** — compact row with lens icon, text, "SELECT LENS" outlined button.
8. **Sticky bottom bar** — `BottomAppBar` with price + "ADD TO CART" + "BUY WITH LENS".
9. **Trust strip + AI help banner**.

**File:** `mobile/lib/widgets/products/color_swatch_row.dart` *(create)*
**File:** `mobile/lib/widgets/products/frame_spec_strip.dart` *(create)*
**File:** `mobile/lib/widgets/products/sticky_cta_bar.dart` *(create)*

---

### 5.5 Buy With Lens Wizard

The wizard is a `Navigator`-pushed full-screen flow. Maintain wizard state in a single `LensWizardProvider`.

**File:** `mobile/lib/providers/lens_wizard_provider.dart` *(create)*
- Holds: `product`, `selectedColor`, `selectedLensType`, `selectedProgressiveTier`, `power` (all fields), `selectedLensQuality`.
- Exposes setters for each step.

**File:** `mobile/lib/screens/lens_wizard/lens_wizard_shell.dart` *(create)*
- Hosts the persistent 4-step progress bar + mini frame card at top.
- Uses `PageController` or `Navigator` to switch steps.

**File:** `mobile/lib/screens/lens_wizard/step1_lens_type_screen.dart` *(create)*
- Radio-select cards for 5 lens types (from LensOption API `kind: 'type'`).
- If Progressive selected → route to Step 1B.
- "CONTINUE TO POWER" CTA.

**File:** `mobile/lib/screens/lens_wizard/step1b_progressive_screen.dart` *(create)*
- 4 tier cards (HC / Premium / Advanced / Elite Progressive).
- "How Progressive Lenses Work" diagram.
- Sticky selected footer + "CONTINUE TO ADD-ONS" CTA.

**File:** `mobile/lib/screens/lens_wizard/step2_power_entry_screen.dart` *(create)*
- Two tabs: "Enter Prescription" / "Enter Manually" (same form, can unify).
- Power table: R and L rows, SPH/CYL/AXIS columns. Each cell is a `CupertinoPicker` or custom spinner.
- PD field.
- "Upload Prescription" option → image picker.
- "CONTINUE TO QUALITY" CTA.

**File:** `mobile/lib/screens/lens_wizard/step3_lens_quality_screen.dart` *(create)*
- 4 quality cards (from LensOption API `kind: 'quality'`).
- "Recommended" badge on HMC + Blue Cut.
- "CONTINUE TO CHECKOUT" CTA.

**File:** `mobile/lib/screens/lens_wizard/step4_checkout_summary_screen.dart` *(create)*
- Full order summary table (frame + lens + pricing breakdown).
- Coupon input + "Apply".
- EyeGlaze Membership upsell banner.
- Total + savings.
- "PROCEED TO PAYMENT" CTA → calls `POST /api/orders`.

**File:** `mobile/lib/widgets/lens_wizard/mini_frame_card.dart` *(create)*
- Persistent card showing product image, name, color, size, lens selection, "Change Frame" button.

**File:** `mobile/lib/widgets/lens_wizard/wizard_progress_bar.dart` *(create)*
- 4-step indicator: LENS TYPE → POWER → QUALITY → CHECKOUT. Active step is gold dot.

**File:** `mobile/lib/services/lens_service.dart` *(create)*
- `Future<List<LensOption>> getLensOptions({String? kind})` — GET `/api/lens-options`.

---

### 5.6 Cart & Checkout Screens

**File:** `mobile/lib/screens/cart/cart_screen.dart` *(create)*
- List of cart items. Qty stepper. Remove. Price summary. "PROCEED TO CHECKOUT" CTA.

**File:** `mobile/lib/screens/checkout/delivery_address_screen.dart` *(create)*
- Saved addresses list + "Add New Address" form.

**File:** `mobile/lib/screens/checkout/payment_screen.dart` *(create)*
- Payment method selector (UPI, Card, NetBanking, Wallets, COD).
- Order recap. "PAY NOW" CTA.

**File:** `mobile/lib/screens/checkout/order_confirmation_screen.dart` *(create)*
- Success animation, order ID, ETA, "TRACK ORDER" + "CONTINUE SHOPPING".

**File:** `mobile/lib/services/cart_service.dart` *(create)*
- `addToCart`, `updateCartItem`, `removeFromCart`, `getCart` methods.

**File:** `mobile/lib/services/order_service.dart` *(create)*
- `placeOrder(orderPayload)`, `getOrders()`, `getOrder(orderId)`.

**File:** `mobile/lib/providers/cart_provider.dart` *(create)*
- `ChangeNotifier` holding cart items + total. Syncs with API on change.

---

## Phase 6: Order Flow APIs

*Dependencies: Phase 2 (auth middleware), Phase 1 (Cart, Order models).*

---

### 6.1 Cart API

#### GET /api/cart
**File:** `web/src/app/api/cart/route.ts` *(create)*
- Auth required. Return current user's cart, populated with product details.

#### POST /api/cart
**File:** same `route.ts`
- Body: `{ productId, color, qty, lens? }`.
- Find user's cart (create if not exists).
- If same productId + color + lens config exists → increment qty.
- Else → push new item.
- Return updated cart.

#### PUT /api/cart/[itemId]
**File:** `web/src/app/api/cart/[itemId]/route.ts` *(create)*
- Body: `{ qty }`. Update qty of specific item.
- If qty ≤ 0 → remove item.

#### DELETE /api/cart/[itemId]
**File:** same `[itemId]/route.ts`
- Remove item from cart.items array.

---

### 6.2 Order API

#### POST /api/orders
**File:** `web/src/app/api/orders/route.ts` *(create)*

Logic:
1. Auth required.
2. Read cart for user.
3. Validate cart is not empty.
4. Validate delivery address is provided.
5. Calculate final pricing (re-calculate server-side; don't trust client totals).
6. Validate coupon code if provided (future: coupon model).
7. Generate `orderId` (e.g., `EG-ORD-YYYYMMDD-XXXX`).
8. Create `Order` document with status `'pending'`.
9. Clear user's cart.
10. Return `{ orderId, total, estimatedDelivery }`.

Body: `{ deliveryAddress, paymentMethod, couponCode? }`

**Note:** Payment gateway integration is a stub in this phase. Set `paymentStatus: 'paid'` for now; replace with real gateway webhook in a later sprint.

#### GET /api/orders
**File:** same `route.ts`
- Auth required. Return orders for current user, sorted by `createdAt` desc.

#### GET /api/orders/[orderId]
**File:** `web/src/app/api/orders/[orderId]/route.ts` *(create)*
- Auth required. Return single order if it belongs to current user (or admin).

---

## Phase 7: Admin Panel (Web)

*Dependencies: Phase 2 (auth, role check), Phase 3 (product APIs), Phase 6 (order APIs).*

---

### 7.1 Admin Layout

**File:** `web/src/app/admin/layout.tsx` *(create)*

- Server component: check user role via `getAuthUser`; redirect to `/login` if not admin.
- Renders: fixed left sidebar + main content area.
- Sidebar items: Dashboard, Products, Orders, Inventory, Prescriptions, Customers, Promotions, Analytics, Lens Options.
- Top bar: EyeGlaze Admin logo, admin user avatar + name, logout button.
- Dark theme (`#0D0D0D` bg, `#1A1A1A` sidebar, gold active item highlight).

**File:** `web/src/components/admin/AdminSidebar.tsx` *(create)*
**File:** `web/src/components/admin/AdminTopBar.tsx` *(create)*

---

### 7.2 Admin Dashboard

**File:** `web/src/app/admin/page.tsx` *(create)*

Metric cards (fetch from `/api/admin/stats`):
- Total Orders (today / week / month) with trend arrows.
- Revenue (today / week / month).
- Pending Orders count.
- Low Stock Alerts count.
- New Customers (this week).

Recent orders table: Order ID, Customer, Amount, Status, Date, quick "View" link.

Quick action buttons: "Add Product", "Process Orders", "View Returns".

**File:** `web/src/components/admin/MetricCard.tsx` *(create)*
**File:** `web/src/components/admin/RecentOrdersTable.tsx` *(create)*

---

### 7.3 Product Management

**File:** `web/src/app/admin/products/page.tsx` *(create)*

- Table: Product ID | Name | Category | MRP | Price | Stock (total) | Status | Edit / Delete actions.
- Search input (by name or SKU).
- Filters: category, frameType, active/inactive.
- "Add New Product" button → `/admin/products/new`.
- Pagination.

**File:** `web/src/app/admin/products/new/page.tsx` *(create)*
**File:** `web/src/app/admin/products/[id]/edit/page.tsx` *(create)*

Both use a shared `ProductForm` component.

**File:** `web/src/components/admin/products/ProductForm.tsx` *(create)*

Fields (per flow.md Section 7.3):
- SKU (auto-generated, editable)
- Name, frameType, material, category
- Colors array (dynamic rows: name, hex, stock, image upload)
- Dimensions (4 fields)
- Lens compatibility (checkboxes)
- MRP, selling price, discount % (auto-computed)
- Images upload (multi-file, drag-drop)
- BESTSELLER toggle, Active toggle
- Feature tags (comma-separated or tag chips)
- SEO title + description

On submit: `POST /api/products` (new) or `PUT /api/products/[id]` (edit).

**File:** `web/src/components/admin/products/ColorVariantRow.tsx` *(create)*
**File:** `web/src/components/admin/products/ImageUploader.tsx` *(create)*

---

### 7.4 Order Management

**File:** `web/src/app/admin/orders/page.tsx` *(create)*

- Tab filters: All | Pending | Processing | Dispatched | Delivered | Cancelled | Returned.
- Table: Order ID | Customer | Product | Amount | Date | Status | Actions.
- "View" → order detail modal or `/admin/orders/[orderId]`.

**File:** `web/src/app/admin/orders/[orderId]/page.tsx` *(create)*

Detail view shows (per flow.md Section 7.4):
- Customer info, delivery address.
- Frame + lens details (type, power, quality).
- Prescription image viewer.
- Payment info.
- Status timeline.
- Actions: Update Status dropdown, Assign Tracking Number, Add Internal Note, Process Refund, Download Invoice, Flag.

**File:** `web/src/components/admin/orders/OrderStatusTimeline.tsx` *(create)*
**File:** `web/src/components/admin/orders/OrderDetailCard.tsx` *(create)*
**File:** `web/src/components/admin/orders/PrescriptionImageViewer.tsx` *(create)*

---

### 7.5 Inventory View

**File:** `web/src/app/admin/inventory/page.tsx` *(create)*

- Table of all products × color variants with stock counts.
- Low stock rows highlighted red (stock < 10).
- Inline stock count edit (click-to-edit cell).
- "Set Alert Threshold" per product.
- "Mark as Out of Stock" toggle.

---

## Phase 8: Admin APIs

*Dependencies: Phase 2 (auth middleware with role check).*

All `/api/admin/*` routes are protected by middleware: role must be `'admin'`, `'store_manager'`, or `'support_agent'` (with route-level further restriction where needed).

---

### 8.1 Admin Middleware Helper

**File:** `web/src/lib/adminAuth.ts` *(create)*

```ts
export async function requireAdmin(req: NextRequest, allowedRoles = ['admin', 'store_manager', 'support_agent']) {
  const auth = await getAuthUser(req)
  if (!auth || !allowedRoles.includes(auth.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  return auth
}
```

---

### 8.2 Admin Stats

#### GET /api/admin/stats
**File:** `web/src/app/api/admin/stats/route.ts` *(create)*

Aggregation pipeline on `Order` collection:
- Orders count grouped by day/week/month.
- Revenue sum by period.
- Pending orders count.
- New users this week.
- Low stock products count (sum of color variants with `stock < 10`).

Return: `{ orders: { today, week, month }, revenue: { today, week, month }, pending, lowStock, newCustomers }`.

---

### 8.3 Admin Product Routes

**File:** `web/src/app/api/admin/products/route.ts` *(create)*

- `GET` — full product list (including inactive), no pagination limit restriction.
- `POST` — create product (same as Phase 3 but via admin namespace for clarity and to distinguish middleware).

**File:** `web/src/app/api/admin/products/[id]/route.ts` *(create)*

- `GET` — single product (including inactive).
- `PUT` — full update.
- `DELETE` — soft delete (set `isActive: false`); hard delete only with `?hard=true` and `role: 'admin'`.

---

### 8.4 Admin Order Routes

**File:** `web/src/app/api/admin/orders/route.ts` *(create)*

- `GET` — all orders, filter by status/date range, paginated. Include customer populate.

**File:** `web/src/app/api/admin/orders/[orderId]/route.ts` *(create)*

- `GET` — full order detail with customer and prescription.
- `PUT` — update order:
  - `{ status }` → push to `statusHistory`, update `status`.
  - `{ trackingNumber, courierPartner }` → update tracking.
  - `{ internalNote }` → append to `internalNotes`.
  - `{ prescriptionVerified: true }` → mark prescription verified.
  - `{ paymentStatus: 'refunded' }` → initiate refund record.

---

### 8.5 Admin Inventory Routes

**File:** `web/src/app/api/admin/inventory/route.ts` *(create)*

- `GET` — all products with color variant stock levels. Optionally filter `?lowStock=true`.

**File:** `web/src/app/api/admin/inventory/[productId]/route.ts` *(create)*

- `PUT` body: `{ colorName, stock }` → update `Product.colors[x].stock`.
- `PUT` body: `{ isActive: false }` → mark out of stock.

---

### 8.6 Admin Prescription Routes

**File:** `web/src/app/api/admin/prescriptions/route.ts` *(create)*

- `GET` — all prescriptions with `verificationStatus: 'pending'`, populated with user and linked order.

**File:** `web/src/app/api/admin/prescriptions/[id]/route.ts` *(create)*

- `PUT` body: `{ verificationStatus: 'verified' | 'rejected', rejectionReason?, powerOverride? }`.
- If `verified`: also update linked order's `prescriptionVerified: true`.
- If `rejected`: (future) trigger notification to customer.

---

### 8.7 Admin Customer Routes

**File:** `web/src/app/api/admin/customers/route.ts` *(create)*

- `GET` — user list (role: customer), with order count and total spend aggregation. Paginated.

**File:** `web/src/app/api/admin/customers/[userId]/route.ts` *(create)*

- `GET` — customer detail: profile, all orders, saved prescriptions.

---

### 8.8 Admin Coupon Routes

**File:** `web/src/models/Coupon.ts` *(create)*

Fields:
- `code` — String, unique, uppercase
- `discountType` — enum `['percent', 'flat']`
- `discountValue` — Number
- `minOrderValue` — Number
- `maxDiscountCap` — Number (for percent type)
- `validFrom`, `validTo` — Dates
- `usageLimitTotal` — Number
- `usageLimitPerUser` — Number
- `usedCount` — Number, default 0
- `applicableTo` — enum `['all', 'category', 'sku']`
- `applicableValues` — Array of strings (category names or SKUs)
- `isActive` — Boolean

**File:** `web/src/app/api/admin/coupons/route.ts` *(create)*
- `GET` — list all coupons.
- `POST` — create coupon.

**File:** `web/src/app/api/admin/coupons/[id]/route.ts` *(create)*
- `PUT` — update coupon.
- `DELETE` — deactivate coupon.

**File:** `web/src/app/api/cart/apply-coupon/route.ts` *(create)*
- `POST` body: `{ couponCode, orderTotal }`.
- Validates coupon exists, is active, within dates, usage limit not exceeded, order meets min value.
- Returns `{ valid: true, discount: number, message }` or `{ valid: false, message }`.

---

## Cross-Cutting Concerns

### Error Handling
- All API routes wrap logic in try/catch; return `{ error: string }` with appropriate HTTP status.
- Create `web/src/lib/apiResponse.ts` with helpers: `ok(data)`, `err(message, status)`.

### Request Validation
- Use `zod` for all API request body validation.
- Create schema files under `web/src/lib/validations/` (e.g., `auth.schema.ts`, `product.schema.ts`, `order.schema.ts`).

### Image Storage
- Phase 1–3: use local `/public/images/` (seed script copies sample images).
- Phase 4+: integrate Cloudinary or S3. Store URL strings in DB. Use `web/src/lib/storage.ts` abstraction with `uploadImage(file): Promise<string>`.

### Environment Variables
Create `web/.env.local.example`:
```
MONGODB_URI=
JWT_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
NEXT_PUBLIC_API_BASE=http://localhost:3000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Flutter HTTP Client
**File:** `mobile/lib/services/api_client.dart` *(create)*
- `Dio` (or `http` package) instance configured with base URL.
- Interceptor: attach `Authorization: Bearer <token>` from `FlutterSecureStorage`.
- Interceptor: on 401 response → clear token, navigate to `/welcome`.

### Flutter State Management
- Use `provider` package (`ChangeNotifier` pattern).
- Providers: `AuthProvider`, `CartProvider`, `LensWizardProvider`, `ProductProvider`.
- Inject via `MultiProvider` in `main.dart`.

---

## Dependency Graph Summary

```
Phase 1 (Foundation)
  └─► Phase 2 (Auth)
        └─► Phase 3 (Product APIs) ─┐
              └─► Phase 4 (Web UI)  │
              └─► Phase 5 (Mobile)  │
                    └─► Phase 6 (Order APIs)
                          └─► Phase 7 (Admin UI)
                                └─► Phase 8 (Admin APIs)
```

Phase 3 and Phase 4/5 can partially overlap once basic GET product APIs are in place.
Phase 7 Admin UI and Phase 8 Admin APIs should be built in tandem (UI calls API).

---

## File Creation Checklist by Platform

### Next.js (`web/src/`)
```
lib/
  mongodb.ts          (modify)
  auth.ts             (create)
  otp-sender.ts       (create)
  theme.ts            (create)
  apiResponse.ts      (create)
  adminAuth.ts        (create)
  storage.ts          (create)
  validations/
    auth.schema.ts
    product.schema.ts
    order.schema.ts
    coupon.schema.ts

models/
  User.ts
  Product.ts
  LensOption.ts
  Cart.ts
  Order.ts
  Prescription.ts
  Review.ts
  Coupon.ts

scripts/
  seed.ts

middleware.ts

app/
  layout.tsx          (modify)
  globals.css         (modify)
  (auth)/
    layout.tsx
    login/page.tsx
  (main)/
    layout.tsx
    page.tsx                     (Home)
    products/
      page.tsx                   (Listing)
      [id]/page.tsx              (Detail)
    cart/page.tsx
  admin/
    layout.tsx
    page.tsx                     (Dashboard)
    products/
      page.tsx
      new/page.tsx
      [id]/edit/page.tsx
    orders/
      page.tsx
      [orderId]/page.tsx
    inventory/page.tsx
  api/
    auth/
      send-otp/route.ts
      verify-otp/route.ts
      logout/route.ts
      me/route.ts
    products/
      route.ts
      [id]/route.ts
    lens-options/route.ts
    cart/
      route.ts
      [itemId]/route.ts
      apply-coupon/route.ts
    orders/
      route.ts
      [orderId]/route.ts
    admin/
      stats/route.ts
      products/route.ts
      products/[id]/route.ts
      orders/route.ts
      orders/[orderId]/route.ts
      inventory/route.ts
      inventory/[productId]/route.ts
      prescriptions/route.ts
      prescriptions/[id]/route.ts
      customers/route.ts
      customers/[userId]/route.ts
      coupons/route.ts
      coupons/[id]/route.ts

components/
  auth/
    OtpInput.tsx
    CountryCodeSelector.tsx
  layout/
    Navbar.tsx
    TrustBadgeStrip.tsx
  home/
    HeroBanner.tsx
    CategoryTile.tsx
    PromoBanner.tsx
    QuickActionDock.tsx
  products/
    ProductCard.tsx
    ProductGrid.tsx
    FilterSidebar.tsx
    SortBar.tsx
    ImageCarousel.tsx
    ColorSelector.tsx
    FrameSpecs.tsx
    StickyProductBar.tsx
    RatingStars.tsx
  cart/
    CartItem.tsx
    PriceSummary.tsx
  admin/
    AdminSidebar.tsx
    AdminTopBar.tsx
    MetricCard.tsx
    RecentOrdersTable.tsx
    products/
      ProductForm.tsx
      ColorVariantRow.tsx
      ImageUploader.tsx
    orders/
      OrderStatusTimeline.tsx
      OrderDetailCard.tsx
      PrescriptionImageViewer.tsx

hooks/
  useAuth.ts
  useCart.ts

context/
  AuthContext.tsx
```

### Flutter (`mobile/lib/`)
```
main.dart              (modify)
config/app_config.dart
routes/app_router.dart
theme/
  app_colors.dart
  app_theme.dart
  app_text_styles.dart
  index.dart
models/
  user_model.dart
  product_model.dart
  lens_option_model.dart
  cart_model.dart
  order_model.dart
providers/
  auth_provider.dart
  cart_provider.dart
  lens_wizard_provider.dart
  product_provider.dart
services/
  api_client.dart
  auth_service.dart
  product_service.dart
  lens_service.dart
  cart_service.dart
  order_service.dart
screens/
  auth/
    welcome_screen.dart
    mobile_number_screen.dart
    mobile_otp_screen.dart
    email_entry_screen.dart
    email_otp_screen.dart
  home/
    home_screen.dart
  products/
    product_listing_screen.dart
    product_detail_screen.dart
  lens_wizard/
    lens_wizard_shell.dart
    step1_lens_type_screen.dart
    step1b_progressive_screen.dart
    step2_power_entry_screen.dart
    step3_lens_quality_screen.dart
    step4_checkout_summary_screen.dart
  cart/
    cart_screen.dart
  checkout/
    delivery_address_screen.dart
    payment_screen.dart
    order_confirmation_screen.dart
widgets/
  auth/
    otp_input_row.dart
    numeric_keypad.dart
    trust_badge_strip.dart
  home/
    hero_banner.dart
    trust_strip.dart
    category_scroll.dart
    promo_banners.dart
    quick_action_dock.dart
  products/
    product_card.dart
    filter_bottom_sheet.dart
    color_swatch_row.dart
    frame_spec_strip.dart
    sticky_cta_bar.dart
  lens_wizard/
    mini_frame_card.dart
    wizard_progress_bar.dart
```

---

*End of EyeGlaze Implementation Plan*
