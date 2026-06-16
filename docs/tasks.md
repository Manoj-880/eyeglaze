# EyeGlaze — Task List

> **Generated:** 2026-06-16
> **Stack:** Next.js 15 (App Router, TypeScript, Tailwind) · Flutter (Dart) · MongoDB + Mongoose
> **Theme:** Dark (`#0D0D0D` bg, `#D4922A` gold accent, `#FFFFFF` text)

---

## TASK-001: MongoDB User Model

- Phase: 1
- Component: server
- Status: DONE
- Depends: none
- Files:
  - `web/src/models/User.ts` (create)
  - `web/src/lib/mongodb.ts` (modify — ensure cached singleton `connectDB()` export)
- Description: Create the Mongoose `User` model with all fields from the implementation plan. Fields: `mobile` (String, sparse unique), `countryCode` (String, default `'+91'`), `email` (String, sparse unique, lowercase), `name` (String, optional), `role` (enum `['customer', 'admin', 'store_manager', 'support_agent']`, default `'customer'`), `addresses` (array of embedded subdocuments with `fullName`, `mobile`, `pincode`, `line1`, `line2`, `city`, `state`, `type` enum `['Home','Work','Other']`, `isDefault` Boolean), `savedPrescriptions` (array of ObjectId refs to `Prescription`), `wishlist` (array of ObjectId refs to `Product`), `membershipActive` (Boolean, default false), `membershipExpiry` (Date), `termsAcceptedAt` (Date), `otp` (String, hashed), `otpExpiry` (Date), `isVerified` (Boolean, default false), `createdAt`/`updatedAt` (timestamps). Also modify `web/src/lib/mongodb.ts` to export a `connectDB()` async function using a cached singleton (`global.mongoose` pattern) that reads `MONGODB_URI` from `process.env` and throws clearly if missing.

---

## TASK-002: MongoDB Product Model

- Phase: 1
- Component: server
- Status: DONE
- Depends: TASK-001
- Files:
  - `web/src/models/Product.ts` (create)
- Description: Create the Mongoose `Product` model. Fields: `sku` (String, unique, required — e.g., `'EG-2041'`), `name` (String), `frame` subdocument (`type`, `material`, `width`, `lensWidth`, `bridgeWidth`, `templeLength` as Numbers in mm, `featureTags` array of strings), `colors` (array of subdocuments: `name`, `hex`, `swatchImage`, `stock` Number default 0), `images` (array of Strings — ordered URLs, min 4 product + 1 model photo), `image360` (String URL), `price` subdocument (`original` Number default 999, `selling` Number default 1), `category` (enum `['prescription', 'sunglasses', 'blue_light', 'contact_lenses', 'kids']`), `compatible` subdocument (`prescription`, `bluecut`, `zeropower`, `progressive` — Booleans), `rating` (Number 0–5, default 0), `reviewCount` (Number, default 0), `soldCount` (Number, default 0), `tags` (array of strings for SEO/search), `isBestseller` (Boolean, default false), `isActive` (Boolean, default true), `meta` subdocument (`seoTitle`, `seoDescription` Strings), `createdAt`/`updatedAt` timestamps. Use `mongoose.models.Product || mongoose.model('Product', schema)` pattern to avoid model re-registration in Next.js dev.

---

## TASK-003: MongoDB LensOption Model

- Phase: 1
- Component: server
- Status: DONE
- Depends: TASK-001
- Files:
  - `web/src/models/LensOption.ts` (create)
- Description: Create the Mongoose `LensOption` model covering both lens types (wizard Step 1) and lens quality tiers (wizard Step 3). Fields: `type` (enum `['single_vision', 'progressive', 'bluecut', 'zero_power', 'photochromic']`, required), `subType` (String — for progressive tiers: `'hc_progressive'`, `'premium_progressive'`, `'advanced_progressive'`, `'elite_progressive'`; for quality tiers: `'hmc_bluecut'`, `'hmc'`, `'bluecut_quality'`, `'hc'`), `kind` (enum `['type', 'quality']` — distinguishes wizard step), `displayName` (String, e.g., `'Single Vision'`, `'HMC + Blue Cut'`), `badge` (String, e.g., `'BESTSELLER'`, `'RECOMMENDED'`), `price` (Number, required), `features` (array of Strings), `description` (String), `sortOrder` (Number), `isActive` (Boolean, default true), `isBestseller` (Boolean), `isRecommended` (Boolean). Use `mongoose.models` guard for Next.js HMR safety.

---

## TASK-004: MongoDB Cart Model

- Phase: 1
- Component: server
- Status: DONE
- Depends: TASK-001, TASK-002
- Files:
  - `web/src/models/Cart.ts` (create)
- Description: Create the Mongoose `Cart` model. One cart per user (unique on `user` field). Fields: `user` (ObjectId ref `'User'`, required, unique), `items` (array of subdocuments with: `product` ObjectId ref `'Product'`, `qty` Number default 1, `color` String, `lensType` String, `lensSubType` String, `power` subdocument (`RE` with `sph`/`cyl`/`axis`, `LE` with `sph`/`cyl`/`axis`, `pd` Number), `lensQuality` String, `lensPrice` Number, `framePrice` Number, `fittingCharge` Number default 199, `deliveryCharge` Number default 99), `couponCode` (String), `couponDiscount` (Number), `updatedAt` (Date, default Date.now). Use `mongoose.models` guard.

---

## TASK-005: MongoDB Order Model

- Phase: 1
- Component: server
- Status: DONE
- Depends: TASK-001
- Files:
  - `web/src/models/Order.ts` (create)
- Description: Create the Mongoose `Order` model. Fields: `orderId` (String, unique — e.g., `'EGO-20260616-0001'`), `user` (ObjectId ref `'User'`, required), `items` (array of embedded snapshots — NOT refs, to preserve historical order data: `product` ObjectId ref `'Product'`, `qty`, `color`, `lensType`, `lensSubType`, `power` RE/LE/pd, `lensQuality`, `lensPrice`, `framePrice`, `fittingCharge` default 199), `address` snapshot subdocument (`fullName`, `mobile`, `line1`, `line2`, `city`, `state`, `pincode`), `subtotal` Number, `deliveryCharge` Number default 99, `fittingCharge` Number, `discount` Number default 0, `total` Number, `coupon` subdocument (`code`, `discountType` enum `['percent','flat']`, `discountValue`, `amountSaved`), `status` (enum `['pending','confirmed','processing','shipped','delivered','cancelled','returned']`, default `'pending'`), `statusHistory` (array of `{ status, timestamp, note }`), `paymentStatus` (enum `['pending','paid','failed','refunded']`, default `'pending'`), `paymentMethod` String, `transactionId` String, `trackingNumber` String, `courierPartner` String, `estimatedDelivery` Date, `prescriptionVerified` Boolean default false, `internalNotes` (array of `{ note String, addedBy ObjectId, addedAt Date }`), `isFlagged` Boolean default false, `createdAt`/`updatedAt` timestamps. Use `mongoose.models` guard.

---

## TASK-006: MongoDB Prescription Model

- Phase: 1
- Component: server
- Status: DONE
- Depends: TASK-001
- Files:
  - `web/src/models/Prescription.ts` (create)
- Description: Create the Mongoose `Prescription` model. Fields: `user` (ObjectId ref `'User'`, required), `RE` subdocument (`sph`, `cyl`, `axis` Numbers), `LE` subdocument (`sph`, `cyl`, `axis` Numbers), `pd` (Number), `uploadedFile` (String — URL to stored image), `verificationStatus` (enum `['pending','verified','rejected']`, default `'pending'`), `verified` (Boolean, default false), `verifiedBy` (ObjectId ref `'User'` — admin who verified), `rejectionReason` (String), `createdAt`/`updatedAt` timestamps. Use `mongoose.models` guard.

---

## TASK-007: MongoDB Review and Coupon Models

- Phase: 1
- Component: server
- Status: DONE
- Depends: TASK-001, TASK-002
- Files:
  - `web/src/models/Review.ts` (create)
  - `web/src/models/Coupon.ts` (create)
- Description: Create two Mongoose models.

  **Review model** fields: `product` (ObjectId ref `'Product'`, required), `user` (ObjectId ref `'User'`, required), `rating` (Number 1–5, required), `title` (String), `body` (String, aliased as `comment`), `isVerifiedPurchase` (Boolean), `createdAt`/`updatedAt` timestamps. Add compound unique index on `{ product, user }` (one review per user per product).

  **Coupon model** fields: `code` (String, unique, uppercase, e.g., `'SAVE20'`), `discountType` (enum `['percent','flat']`), `discountValue` (Number), `minOrderValue` (Number), `maxDiscount` (Number — cap for percent coupons), `validFrom` (Date), `validTo` (Date), `usageLimitPerUser` (Number), `usageLimitTotal` (Number), `usedCount` (Number, default 0), `applicableTo` (enum `['all','categories','skus']`, default `'all'`), `categories` (array of Strings), `skus` (array of Strings), `isActive` (Boolean, default true). Both use `mongoose.models` guard.

---

## TASK-008: Auth Middleware (JWT verify + role check)

- Phase: 1
- Component: server
- Status: DONE
- Depends: TASK-001
- Files:
  - `web/src/lib/auth.ts` (create)
  - `web/src/lib/otp-sender.ts` (create)
  - `web/src/lib/adminAuth.ts` (create)
  - `web/src/lib/apiResponse.ts` (create)
  - `web/src/middleware.ts` (create)
  - `web/.env.local.example` (create)
- Description: Implement all auth utilities and middleware.

  **`web/src/lib/auth.ts`**: Export `generateOTP()` (returns random 6-digit string), `hashOTP(otp)` (bcrypt, 10 rounds), `verifyOTP(otp, hash)` (bcrypt compare), `signJWT({ userId, role })` (signs with `JWT_SECRET` env var, 30-day expiry), `verifyJWT(token)` (returns payload or throws), `setAuthCookie(res, token)` (sets `eyeglaze_auth` httpOnly cookie, `sameSite: 'lax'`, `secure: true` in production, `maxAge: 30 days`), `clearAuthCookie(res)`, `getAuthUser(req)` (reads cookie, verifies JWT, returns `{ userId, role }` or null).

  **`web/src/lib/otp-sender.ts`**: Export `sendSMSOTP(mobile, countryCode, otp)` using Twilio SDK (stub with `console.log` if env vars missing), `sendEmailOTP(email, otp)` using SendGrid (stub if missing).

  **`web/src/lib/adminAuth.ts`**: Export `requireAdmin(req, allowedRoles)` — calls `getAuthUser`, returns `NextResponse.json({ error: 'Unauthorized' }, { status: 403 })` if not authorized, otherwise returns the auth object.

  **`web/src/lib/apiResponse.ts`**: Export `ok(data, status?)` and `err(message, status)` helper functions wrapping `NextResponse.json`.

  **`web/src/middleware.ts`**: Protect `/api/admin/*` (require admin roles), protect `/api/cart/*` and `/api/orders/*` (require any authenticated user). Keep `/api/auth/*`, `/api/products/*`, `/api/lens-options` public. Redirect unauthenticated web page requests to `/login`.

  **`web/.env.local.example`**: Document all required env vars: `MONGODB_URI`, `JWT_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`, `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `NEXT_PUBLIC_API_BASE`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

---

## TASK-009: Seed Script (Lens Options + Sample Products + Admin User)

- Phase: 1
- Component: server
- Status: DONE
- Depends: TASK-001, TASK-002, TASK-003
- Files:
  - `web/src/scripts/seed.ts` (create)
- Description: Create an idempotent seed script runnable with `npx tsx src/scripts/seed.ts`. Must use upsert (findOneAndUpdate with upsert:true or deleteMany then insertMany) so it can be re-run safely.

  **Seed LensOptions:** Insert all lens types with `kind: 'type'` — Single Vision (₹699), Progressive (₹2,499), Zero Power (₹699), Blue Cut (₹899), Photochromic (₹1,499). Insert progressive sub-tiers with `kind: 'type'`, `subType` values: `hc_progressive` (₹2,499), `premium_progressive` (₹3,499), `advanced_progressive` (₹4,499), `elite_progressive` (₹5,499). Insert quality tiers with `kind: 'quality'` — `hmc_bluecut` HMC+Blue Cut (₹999, badge: 'RECOMMENDED'), `hmc` HMC (₹699), `bluecut_quality` Blue Cut (₹899), `hc` HC Hard Coated (₹799).

  **Seed Products (6 products):**
  1. EG-2041 Matte Square Frame — TR90 Premium, category prescription, 5 colors (Matte Black `#1A1A1A`, Black Gold `#2A2A2A`, Tortoise `#8B4513`, Blue `#1E3A5F`, Red `#8B0000`), MRP ₹999, selling ₹1, isBestseller true
  2. EG-1067 Premium Clubmaster Frame — Premium Metal, category prescription, 4 colors
  3. EG-3012 Classic Aviator — Premium Metal, category sunglasses, 3 colors
  4. EG-4001 Kids Round Frame — TR90 Premium, category kids, 3 colors
  5. EG-5010 Blue Light Blocker — Acetate, category blue_light, compatible.bluecut true, 3 colors
  6. EG-6003 Progressive Ready Wide Frame — TR90 Premium, category prescription, compatible.progressive true, 3 colors

  **Seed Admin User:** Upsert one user with `mobile: '9999999999'`, `countryCode: '+91'`, `role: 'admin'`, `name: 'EyeGlaze Admin'`.

  Connect to MongoDB using `connectDB()`, log success/failure, then call `process.exit(0)`.

---

## TASK-010: Theme Constants (Flutter + Web)

- Phase: 1
- Component: shared
- Status: DONE
- Depends: none
- Files:
  - `web/src/lib/theme.ts` (create)
  - `web/tailwind.config.ts` (modify)
  - `web/src/app/globals.css` (modify)
  - `mobile/lib/theme/app_colors.dart` (create)
  - `mobile/lib/theme/app_theme.dart` (create)
  - `mobile/lib/theme/app_text_styles.dart` (create)
  - `mobile/lib/theme/index.dart` (create)
- Description: Establish the design system in both platforms.

  **`web/src/lib/theme.ts`**: Export `COLORS` object: `{ bg: '#0D0D0D', card: '#1A1A1A', gold: '#D4922A', goldAlt: '#C9A84C', textPrimary: '#FFFFFF', textSecondary: '#999999', border: '#2A2A2A', error: '#FF4444', success: '#4CAF50' }`. Also export a `BREAKPOINTS` object and useful Tailwind class string constants.

  **`web/tailwind.config.ts`**: Extend `theme.extend.colors` with an `eyeglaze` palette: `{ bg: '#0D0D0D', card: '#1A1A1A', gold: '#D4922A', 'text-primary': '#FFFFFF', 'text-secondary': '#999999', border: '#2A2A2A', error: '#FF4444', success: '#4CAF50' }`. This enables classes like `bg-eyeglaze-bg`, `text-eyeglaze-gold`, `border-eyeglaze-border`.

  **`web/src/app/globals.css`**: Add CSS custom properties in `:root`: `--color-gold: #D4922A`, `--color-bg: #0D0D0D`, `--color-card: #1A1A1A`, `--color-border: #2A2A2A`, `--color-error: #FF4444`, `--color-success: #4CAF50`. Set `body { background-color: #0D0D0D; color: #FFFFFF; }`.

  **`mobile/lib/theme/app_colors.dart`**: `abstract class AppColors` with static `const Color` fields: `background = Color(0xFF0D0D0D)`, `card = Color(0xFF1A1A1A)`, `gold = Color(0xFFD4922A)`, `textPrimary = Color(0xFFFFFFFF)`, `textSecondary = Color(0xFF999999)`, `border = Color(0xFF2A2A2A)`, `error = Color(0xFFFF4444)`, `success = Color(0xFF4CAF50)`.

  **`mobile/lib/theme/app_theme.dart`**: Export `class AppTheme` with static method `dark()` returning `ThemeData`. Set `scaffoldBackgroundColor: AppColors.background`, `colorScheme` with `primary: AppColors.gold`, `appBarTheme` (dark bg, white title, no elevation), `elevatedButtonTheme` (gold fill, white bold text, rounded-xl), `cardColor: AppColors.card`, `textTheme` (white primary, grey secondary).

  **`mobile/lib/theme/app_text_styles.dart`**: Export `abstract class AppTextStyles` with static `TextStyle` constants: `heading1` (24px, bold, white), `heading2` (20px, bold, white), `bodyRegular` (14px, white), `bodySmall` (12px, `#999999`), `price` (18px, bold, white), `discount` (14px, bold, gold), `link` (14px, gold, underline), `buttonLabel` (16px, bold, white, uppercase), `badge` (11px, bold, white).

  **`mobile/lib/theme/index.dart`**: Barrel export all three theme files.

---

## TASK-011: API POST /api/auth/send-otp

- Phase: 2
- Component: server
- Status: DONE
- Depends: TASK-001, TASK-008
- Files:
  - `web/src/app/api/auth/send-otp/route.ts` (create)
  - `web/src/lib/validations/auth.schema.ts` (create)
- Description: Implement `POST /api/auth/send-otp` route handler.

  **`web/src/lib/validations/auth.schema.ts`**: Define Zod schemas for all auth request bodies. `sendOtpSchema`: `{ type: z.enum(['mobile','email']), mobile: z.string().regex(/^\d{10}$/).optional(), countryCode: z.string().default('+91').optional(), email: z.string().email().optional() }` with `.refine` to require mobile if type is 'mobile' and email if type is 'email'.

  **Route logic:**
  1. Parse and validate request body with `sendOtpSchema`; return 400 on validation error.
  2. Call `connectDB()`.
  3. Generate 6-digit OTP via `generateOTP()`.
  4. Hash OTP via `hashOTP(otp)`.
  5. Find or upsert User by mobile or email; set `otp` (hash), `otpExpiry` (Date.now + 10 min), increment attempt counter.
  6. Rate limit check: if user has made ≥ 3 OTP requests in last 10 min, return 429.
  7. Call `sendSMSOTP` or `sendEmailOTP`.
  8. Return `200 { success: true, message: 'OTP sent' }`.
  9. Wrap in try/catch; use `err()` helper for error responses.

---

## TASK-012: API POST /api/auth/verify-otp (returns JWT httpOnly cookie)

- Phase: 2
- Component: server
- Status: DONE
- Depends: TASK-011
- Files:
  - `web/src/app/api/auth/verify-otp/route.ts` (create)
- Description: Implement `POST /api/auth/verify-otp` route handler.

  **Route logic:**
  1. Parse and validate request body: `{ type, mobile?, countryCode?, email?, otp: string }`.
  2. Call `connectDB()`.
  3. Find user by mobile or email; return 404 if not found.
  4. Check `user.otpExpiry > Date.now()`; return 401 with "OTP expired" if not.
  5. Call `verifyOTP(otp, user.otp)`; if mismatch, return 401 with "Incorrect OTP" and remaining attempts info.
  6. If match: clear `user.otp` and `user.otpExpiry`; set `user.isVerified = true`; if `!user.termsAcceptedAt` set it to now.
  7. Call `signJWT({ userId: user._id.toString(), role: user.role })`.
  8. Build `NextResponse`, call `setAuthCookie(res, token)`.
  9. Return `200 { success: true, user: { id, role, name, mobile, email } }`.

---

## TASK-013: API GET /api/auth/me + POST /api/auth/logout

- Phase: 2
- Component: server
- Status: DONE
- Depends: TASK-012
- Files:
  - `web/src/app/api/auth/me/route.ts` (create)
  - `web/src/app/api/auth/logout/route.ts` (create)
- Description: Implement two simple auth routes.

  **`me/route.ts` (GET)**: Call `getAuthUser(req)`; return 401 if null. Call `connectDB()`, fetch user by `userId` from DB excluding `otp` and `otpExpiry` fields (use `.select('-otp -otpExpiry')`). Return `200 { user: { id, name, email, mobile, role, membershipActive, addresses, wishlist } }`.

  **`logout/route.ts` (POST)**: Build a `NextResponse`, call `clearAuthCookie(res)`, return `200 { success: true }`.

---

## TASK-014: Web Login Page (dark theme, mobile/email toggle)

- Phase: 2
- Component: web
- Status: DONE
- Depends: TASK-010, TASK-011, TASK-012, TASK-013
- Files:
  - `web/src/app/(auth)/layout.tsx` (create)
  - `web/src/app/(auth)/login/page.tsx` (create)
  - `web/src/components/auth/CountryCodeSelector.tsx` (create)
  - `web/src/context/AuthContext.tsx` (create)
  - `web/src/hooks/useAuth.ts` (create)
- Description: Build the web login flow as a single-page multi-step component.

  **`web/src/app/(auth)/layout.tsx`**: Minimal dark layout (`bg-eyeglaze-bg min-h-screen`), no Navbar or Footer, centers content vertically.

  **`web/src/context/AuthContext.tsx`**: `'use client'` context providing `{ user, isLoading, logout, setUser }`. On mount, call `GET /api/auth/me` to hydrate state. Export `useAuthContext()` hook.

  **`web/src/hooks/useAuth.ts`**: Wraps `fetch` calls to `POST /api/auth/send-otp` and `POST /api/auth/verify-otp`. Exposes `{ sendOtp, verifyOtp, isLoading, error }`. On successful `verifyOtp`, updates `AuthContext` user state and redirects.

  **`web/src/components/auth/CountryCodeSelector.tsx`**: `'use client'` dropdown with common country codes (+91 India default, +1 US, +44 UK, etc.). Styled with dark bg, gold border on focus.

  **`web/src/app/(auth)/login/page.tsx`**: `'use client'` component. Local state: `step` (enum `'welcome' | 'mobile-entry' | 'mobile-otp' | 'email-entry' | 'email-otp'`). Background `bg-eyeglaze-bg`. Center layout with max-w-md card.
  - `welcome` step: EyeGlaze logo (serif, gold), two option cards (Mobile / Email), trust badge strip.
  - `mobile-entry` step: `CountryCodeSelector` + 10-digit phone input. "SEND OTP" gold CTA. "Continue with Email" link.
  - `mobile-otp` step: `OtpInput` (6 boxes), 30s countdown timer, resend after timer, "VERIFY" gold CTA.
  - `email-entry` step: email `<input>`, "SEND OTP" gold CTA.
  - `email-otp` step: `OtpInput`, countdown, resend, "VERIFY" CTA.
  - On success: read `callbackUrl` from query params; redirect to it or `/`.
  - Trust badge strip shown on every step. Terms & Privacy links in gold.

---

## TASK-015: Web OTP Entry Component

- Phase: 2
- Component: web
- Status: DONE
- Depends: TASK-014
- Files:
  - `web/src/components/auth/OtpInput.tsx` (create)
- Description: Create a reusable `OtpInput` component for both login steps and any future OTP flows.

  **Props:** `length: number` (default 6), `onChange: (value: string) => void`, `disabled?: boolean`.

  **Behavior:** Render `length` individual `<input>` elements in a flex row with gap. Each input is `maxLength=1`, `type='tel'`, `inputMode='numeric'`, centered text, dark bg (`#1A1A1A`), white text, gold border on focus, size ~48×56px, `rounded-lg`. On character entry, auto-focus the next input. On Backspace in an empty input, focus the previous input. On paste, distribute pasted digits across boxes. Call `onChange` with concatenated value whenever it changes. Use `useRef` array to hold refs to each input element.

---

## TASK-016: Flutter Login Screen (dark, gold, matching design)

- Phase: 2
- Component: mobile
- Status: DONE
- Depends: TASK-010, TASK-011, TASK-012
- Files:
  - `mobile/lib/screens/auth/welcome_screen.dart` (create)
  - `mobile/lib/screens/auth/mobile_number_screen.dart` (create)
  - `mobile/lib/models/user_model.dart` (create)
  - `mobile/lib/services/auth_service.dart` (create)
  - `mobile/lib/services/api_client.dart` (create)
  - `mobile/lib/config/app_config.dart` (create)
  - `mobile/lib/providers/auth_provider.dart` (create)
  - `mobile/lib/routes/app_router.dart` (create)
  - `mobile/lib/main.dart` (modify)
- Description: Build Flutter auth infrastructure and welcome/mobile-number screens.

  **`mobile/lib/config/app_config.dart`**: `abstract class AppConfig` with `static const String apiBase = 'http://localhost:3000/api'`. (Switchable per environment.)

  **`mobile/lib/services/api_client.dart`**: Configure a `Dio` instance with `baseUrl: AppConfig.apiBase`. Add interceptors: (1) attach `Authorization: Bearer <token>` from `FlutterSecureStorage` to every request; (2) on 401 response, clear token from storage, navigate to `/welcome`. Export singleton `apiClient`.

  **`mobile/lib/models/user_model.dart`**: `class UserModel` with fields `id`, `name`, `email`, `mobile`, `role`, `membershipActive`. Factory `UserModel.fromJson(Map<String, dynamic> json)`.

  **`mobile/lib/services/auth_service.dart`**: Methods: `Future<void> sendOTP({ required String type, String? mobile, String countryCode = '+91', String? email })` — POST `/api/auth/send-otp`. `Future<UserModel> verifyOTP({ required String type, String? mobile, String? email, required String otp })` — POST `/api/auth/verify-otp`, on success save token to `FlutterSecureStorage` key `eyeglaze_token`. `Future<UserModel?> getMe()` — GET `/api/auth/me`. `Future<void> logout()` — POST `/api/auth/logout`, clear token from storage.

  **`mobile/lib/providers/auth_provider.dart`**: `class AuthProvider extends ChangeNotifier`. Fields: `UserModel? currentUser`, `bool isLoading`. Methods: `checkAuth()` (calls `authService.getMe()` on app start), `login(UserModel user)`, `logout()`. Notifies listeners on state change.

  **`mobile/lib/routes/app_router.dart`**: Named routes map: `'/'` → redirect logic, `'/welcome'` → `WelcomeScreen`, `'/auth/mobile'` → `MobileNumberScreen`, `'/auth/mobile/otp'` → `MobileOTPScreen`, `'/auth/email'` → `EmailEntryScreen`, `'/auth/email/otp'` → `EmailOTPScreen`, `'/home'` → `HomeScreen`, etc.

  **`mobile/lib/main.dart`**: Wrap app in `MultiProvider` with `ChangeNotifierProvider<AuthProvider>`. Apply `AppTheme.dark()`. Set `initialRoute` based on `authProvider.currentUser == null ? '/welcome' : '/home'` (call `checkAuth()` in `initState` of a splash/root widget).

  **`mobile/lib/screens/auth/welcome_screen.dart`**: `Scaffold` with `AppColors.background`. Center column: EyeGlaze logo text (serif, gold, bold), subtitle "Premium Eyewear Delivered", two `Card` option tiles (dark `#1A1A1A`) for "Continue with Mobile Number" and "Continue with Email" (each with icon and chevron), `TrustBadgeStrip`, footer with Terms/Privacy links in gold text.

  **`mobile/lib/screens/auth/mobile_number_screen.dart`**: `Scaffold` with back arrow AppBar. Body: country code selector row + mobile number `TextField` (numeric keyboard, `maxLength: 10`), "SEND OTP" full-width `ElevatedButton` (gold). Below it a `TextButton` "Continue with Email". Calls `authProvider.sendOTP(type: 'mobile', ...)` on tap, navigates to `/auth/mobile/otp` on success.

---

## TASK-017: Flutter OTP Screen + Phone Keypad

- Phase: 2
- Component: mobile
- Status: DONE
- Depends: TASK-016
- Files:
  - `mobile/lib/screens/auth/mobile_otp_screen.dart` (create)
  - `mobile/lib/screens/auth/email_entry_screen.dart` (create)
  - `mobile/lib/screens/auth/email_otp_screen.dart` (create)
  - `mobile/lib/widgets/auth/otp_input_row.dart` (create)
  - `mobile/lib/widgets/auth/numeric_keypad.dart` (create)
  - `mobile/lib/widgets/auth/trust_badge_strip.dart` (create)
- Description: Build remaining auth widgets and screens.

  **`mobile/lib/widgets/auth/otp_input_row.dart`**: `OtpInputRow` widget. Props: `length` (default 6), `onChanged(String value)`. Renders `length` `TextField` boxes in a `Row` with even spacing. Each box: `maxLength: 1`, `textAlign: center`, dark bg, gold border on focus, 48×56 size, `FocusNode` array auto-advances on input, backspaces to previous on delete.

  **`mobile/lib/widgets/auth/numeric_keypad.dart`**: `NumericKeypad` widget. Props: `onDigit(String digit)`, `onBackspace()`. Renders digits 0–9 plus backspace in a 3-column `GridView` or manual `Column`/`Row` layout. Each key is an `InkWell` with circular ripple, 60×60 area, white text, dark bg, `rounded` border.

  **`mobile/lib/widgets/auth/trust_badge_strip.dart`**: `TrustBadgeStrip` widget. Horizontal `Row` of 4 icon+label pairs: "100% Authentic", "1 Year Warranty", "Easy Returns", "Fast Delivery". Small icons, 10px grey text. Spaced evenly.

  **`mobile/lib/screens/auth/mobile_otp_screen.dart`**: Shows masked mobile number ("OTP sent to +91 XXXXXX4321"), `OtpInputRow`, 30-second `Timer.periodic` countdown displayed as "Resend in Xs", `TextButton` "Resend OTP" enabled only after timer, "VERIFY" gold `ElevatedButton`. On verify success → `Navigator.pushReplacementNamed(context, '/home')`.

  **`mobile/lib/screens/auth/email_entry_screen.dart`**: Email `TextField` (keyboard type email), "SEND OTP" gold button. Calls `authService.sendOTP(type: 'email', email: ...)`.

  **`mobile/lib/screens/auth/email_otp_screen.dart`**: Same structure as `mobile_otp_screen.dart` but for email OTP.

---

## TASK-018: API GET /api/products (with filters)

- Phase: 3
- Component: server
- Status: DONE
- Depends: TASK-002, TASK-008
- Files:
  - `web/src/app/api/products/route.ts` (create)
  - `web/src/lib/validations/product.schema.ts` (create)
- Description: Implement the public product listing and creation API.

  **`web/src/lib/validations/product.schema.ts`**: Zod schemas for product creation/update request bodies, mirroring the Product model fields.

  **`GET /api/products`**: Parse query params: `category`, `frameType`, `compatible` (comma-separated list), `minPrice`, `maxPrice`, `sort` (`price_asc`, `price_desc`, `rating`, `newest`, `bestseller`), `page` (default 1), `limit` (default 20), `search` (text search on name/sku/tags). Build Mongoose query: `isActive: true`, apply filters. For search, use `$regex` on name and sku, or `$text` if text index exists. Apply sort. Paginate with `.skip().limit()`. Return `{ products, total, page, totalPages }`.

  **`POST /api/products`**: Admin-only (call `requireAdmin(req)`). Validate body with `productSchema`. Auto-generate SKU if not provided: query last Product, increment SKU counter, format as `EG-XXXX`. Create and return new Product document.

---

## TASK-019: API GET /api/products/[id]

- Phase: 3
- Component: server
- Status: DONE
- Depends: TASK-018
- Files:
  - `web/src/app/api/products/[id]/route.ts` (create)
- Description: Implement single product get, update, and soft-delete routes.

  **`GET /api/products/[id]`**: Accept `id` param — if it matches `/^EG-/`, query by `sku`; otherwise query by `_id`. Also fetch the latest 10 reviews for this product from the `Review` model. Return full product document plus `reviews` array.

  **`PUT /api/products/[id]`**: Admin-only. Validate partial body. Use `findByIdAndUpdate(id, { $set: body }, { new: true })`. Return updated product.

  **`DELETE /api/products/[id]`**: Admin-only. Soft delete: `findByIdAndUpdate(id, { isActive: false })`. Return `200 { success: true }`.

---

## TASK-020: API GET /api/lens-options

- Phase: 3
- Component: server
- Status: DONE
- Depends: TASK-003, TASK-008
- Files:
  - `web/src/app/api/lens-options/route.ts` (create)
- Description: Implement the public lens options API.

  **`GET /api/lens-options`**: Optional query param `kind` (`'type'` | `'quality'`). Query `LensOption` model with `isActive: true`. If `kind` provided, filter by it. Sort by `sortOrder` ascending. Group results: return `{ lensTypes: [...], lensQualities: [...] }` regardless of filter (empty array for non-matching kind).

  **`POST /api/lens-options`** (same route file): Admin-only. Create new LensOption. Validate body.

  **`PUT /api/lens-options/[id]`** in separate file `web/src/app/api/lens-options/[id]/route.ts`: Admin-only. Update lens option by id.

---

## TASK-021: API POST /api/prescriptions

- Phase: 3
- Component: server
- Status: DONE
- Depends: TASK-006, TASK-008
- Files:
  - `web/src/app/api/prescriptions/route.ts` (create)
  - `web/src/lib/storage.ts` (create)
- Description: Implement prescription upload and retrieval APIs.

  **`web/src/lib/storage.ts`**: Export `uploadImage(file: File | Buffer, filename: string): Promise<string>`. In Phase 1–3, save to `/public/images/prescriptions/` and return the public URL. Add a TODO comment to swap for Cloudinary/S3 in Phase 4+.

  **`POST /api/prescriptions`**: Auth required. Accept `multipart/form-data` with optional file upload plus optional JSON fields `RE`, `LE`, `pd`. Parse the request with `req.formData()`. If file present, call `uploadImage()`. Create `Prescription` document with `user: auth.userId`, power fields if provided, `uploadedFile` URL if uploaded, `verificationStatus: 'pending'`. Return `201 { prescription }`.

  **`GET /api/prescriptions`**: Auth required. Return all prescriptions for current user sorted by `createdAt` desc.

---

## TASK-022: Web Home Page (dark theme matching mobile design)

- Phase: 4
- Component: web
- Status: DONE
- Depends: TASK-010, TASK-013, TASK-018
- Files:
  - `web/src/app/(main)/layout.tsx` (create)
  - `web/src/app/(main)/page.tsx` (create)
  - `web/src/components/layout/Navbar.tsx` (create)
  - `web/src/components/layout/TrustBadgeStrip.tsx` (create)
  - `web/src/components/home/HeroBanner.tsx` (create)
  - `web/src/components/home/CategoryTile.tsx` (create)
  - `web/src/components/home/PromoBanner.tsx` (create)
  - `web/src/components/home/QuickActionDock.tsx` (create)
  - `web/src/components/products/ProductCard.tsx` (create)
  - `web/src/app/layout.tsx` (modify)
- Description: Build the web home page and shared layout components.

  **`web/src/app/layout.tsx` (modify)**: Wrap with `<AuthContext.Provider>`. Set `<html className="bg-eyeglaze-bg">`. Include Google Fonts or local fonts (serif for logo, Inter/sans for body).

  **`web/src/app/(main)/layout.tsx`**: Includes `<Navbar />` at top and `<Footer />` at bottom. `<main>` with `min-h-screen bg-eyeglaze-bg`.

  **`web/src/components/layout/Navbar.tsx`**: `'use client'` component. Logo ("EyeGlaze" serif gold text). Right side: search icon, cart icon with item count badge (read from `useCart`), account icon. If `user` from `useAuthContext` is null, show "Login" link (gold); else show user avatar/icon with dropdown menu. Dark bg with subtle border-bottom.

  **`web/src/components/layout/TrustBadgeStrip.tsx`**: Horizontal flex strip of 4 badges with icons and labels. Props: `badges?: string[]` (defaults to the 4 standard trust signals). Responsive: horizontal scroll on mobile.

  **`web/src/components/home/HeroBanner.tsx`**: `'use client'`. `useState` for `currentSlide`. `useEffect` for `setInterval` 4s auto-advance. 4 slide objects (hardcoded for now) each with bg image, headline, subtext, CTA button. Dot indicators at bottom. Slide transition via CSS `opacity`/`transform`. Full-width, ~400px height.

  **`web/src/components/home/CategoryTile.tsx`**: Props: `icon`, `label`, `href`. Circular tile with dark card bg, icon centered, label below. Links to `/products?category=X`.

  **`web/src/components/home/PromoBanner.tsx`**: Props: `title`, `subtitle`, `ctaText`, `href`, `bgClass`. Dark card with gold CTA button.

  **`web/src/components/home/QuickActionDock.tsx`**: `'use client'`. Row of 5 icon+label tiles: Try On, Scan Rx, **Ask AI** (center, elevated, gold bg), Track Order, Find Store. Center tile is visually elevated with gold background.

  **`web/src/components/products/ProductCard.tsx`**: `'use client'`. Props: `product: Product`. Dark card, rounded-xl. Top: product image with BESTSELLER badge (top-left, gold) and "Add +" button (top-right, outlined gold). Below: name, frame type, price row (white bold selling price + strikethrough MRP in grey + gold discount %). `RatingStars` row. On "Add +" click: call `POST /api/cart`.

  **`web/src/app/(main)/page.tsx`**: Server component. Fetch `GET /api/products?sort=rating&limit=8` server-side. Render: `HeroBanner`, `TrustBadgeStrip`, Shop by Category (5 `CategoryTile`s in horizontal scroll), 2-column `PromoBanner` grid, `QuickActionDock`, Featured Products heading + `ProductGrid` (or direct grid of `ProductCard`s).

---

## TASK-023: Web Product Listing Page

- Phase: 4
- Component: web
- Status: DONE
- Depends: TASK-018, TASK-022
- Files:
  - `web/src/app/(main)/products/page.tsx` (create)
  - `web/src/components/products/ProductGrid.tsx` (create)
  - `web/src/components/products/FilterSidebar.tsx` (create)
  - `web/src/components/products/SortBar.tsx` (create)
- Description: Build the product listing page with filters and sort.

  **`web/src/app/(main)/products/page.tsx`**: Server component (RSC). Read `searchParams`: `category`, `frameType`, `sort`, `page`, `search`. Fetch `GET /api/products` server-side with these params. Render: page title (e.g., "Prescription Glasses"), `SortBar`, `FilterSidebar` + `ProductGrid` layout (sidebar left, grid right on desktop; sidebar in a drawer/sheet on mobile).

  **`web/src/components/products/FilterSidebar.tsx`**: `'use client'`. Checkboxes for Category, Frame Type, Lens Compatibility. Price range slider (min/max). Rating filter. On change, updates URL search params via `useRouter().push()` to trigger server re-fetch.

  **`web/src/components/products/SortBar.tsx`**: `'use client'`. Dropdown or tab row: Featured / Price Low–High / Price High–Low / Top Rated / Newest. Updates `sort` search param in URL.

  **`web/src/components/products/ProductGrid.tsx`**: Props: `products: Product[]`. Responsive grid: 2 columns on mobile (`grid-cols-2`), 3 on desktop (`lg:grid-cols-3`). Renders `ProductCard` for each. Shows empty state if no products.

---

## TASK-024: Web Product Detail Page

- Phase: 4
- Component: web
- Status: DONE
- Depends: TASK-019, TASK-022
- Files:
  - `web/src/app/(main)/products/[id]/page.tsx` (create)
  - `web/src/components/products/ImageCarousel.tsx` (create)
  - `web/src/components/products/ColorSelector.tsx` (create)
  - `web/src/components/products/FrameSpecs.tsx` (create)
  - `web/src/components/products/StickyProductBar.tsx` (create)
  - `web/src/components/products/RatingStars.tsx` (create)
- Description: Build the product detail page matching the mobile design flow.

  **`web/src/app/(main)/products/[id]/page.tsx`**: Server component. Fetch product via `GET /api/products/[id]`. Export `generateMetadata` using `product.meta.seoTitle` and `product.meta.seoDescription`. Render all sections within a `ProductInteractiveShell` client wrapper that receives `product` as prop.

  **`web/src/components/products/RatingStars.tsx`**: Props: `rating: number`, `count?: number`. Renders 5 star icons (filled/half/empty) based on rating. Shows `count` in grey text if provided.

  **`web/src/components/products/ImageCarousel.tsx`**: `'use client'`. Props: `images: string[]`, `selectedColor?: string`. Uses `embla-carousel-react`. Main large image with prev/next arrows and dot indicators. Thumbnail strip below (5 thumbnails, clicking updates main image). Updates when `selectedColor` changes.

  **`web/src/components/products/ColorSelector.tsx`**: `'use client'`. Props: `colors: ProductColor[]`, `selected: string`, `onChange: (colorName: string) => void`. Row of circular swatches (`hex` color background, 32×32px). Active swatch has gold ring border.

  **`web/src/components/products/FrameSpecs.tsx`**: Props: `frame: FrameSubdoc`. Horizontal strip of 4 labeled specs: Frame Width, Lens Width, Bridge Width, Temple Length — each showing the mm value.

  **`web/src/components/products/StickyProductBar.tsx`**: `'use client'`. Fixed bottom bar (only on mobile, hidden on desktop or separate). Shows price + "ADD TO CART" (outlined gold) + "BUY WITH LENS" (gold fill) buttons. "ADD TO CART" calls `POST /api/cart`. "BUY WITH LENS" navigates to the lens wizard route (to be implemented).

  **Product page layout (all sections):**
  1. `ImageCarousel` (top, full-width on mobile)
  2. Product info block: SKU (grey), name (bold white large), `RatingStars`, review count, "X people bought this week" social proof, share/wishlist icons
  3. Pricing: selling price (₹1, white bold large), strikethrough MRP (₹999, grey), "50% OFF" gold badge, delivery info text
  4. `ColorSelector` with selected color name label
  5. `FrameSpecs` strip
  6. Frame details card (dark card, material, feature tags as chips, lens compatibility badges) — collapsible on mobile
  7. Lens CTA row: "Add Prescription Lenses — Starting from ₹699" + "SELECT LENS" outlined button
  8. `TrustBadgeStrip`
  9. `StickyProductBar` (mobile) / inline CTAs (desktop)

---

## TASK-025: Web Cart Page

- Phase: 4
- Component: web
- Status: DONE
- Depends: TASK-036, TASK-022
- Files:
  - `web/src/app/(main)/cart/page.tsx` (create)
  - `web/src/components/cart/CartItem.tsx` (create)
  - `web/src/components/cart/PriceSummary.tsx` (create)
  - `web/src/hooks/useCart.ts` (create)
- Description: Build the web cart page.

  **`web/src/hooks/useCart.ts`**: `'use client'` hook. Fetches `GET /api/cart` on mount. Exposes `{ cart, isLoading, addItem, updateItem, removeItem, applyCoupon }`. `addItem` calls `POST /api/cart`. `updateItem` calls `PUT /api/cart/[itemId]`. `removeItem` calls `DELETE /api/cart/[itemId]`. `applyCoupon` calls `POST /api/cart/apply-coupon`. Re-fetches cart after each mutation.

  **`web/src/app/(main)/cart/page.tsx`**: `'use client'` (uses `useCart` hook). If not authenticated, redirect to `/login?callbackUrl=/cart`. Show: page title "My Cart", list of `CartItem` components, `PriceSummary` panel (right column on desktop, below items on mobile), "PROCEED TO CHECKOUT" gold CTA (disabled if cart empty).

  **`web/src/components/cart/CartItem.tsx`**: Props: `item: CartItem`, `onUpdate: (qty: number) => void`, `onRemove: () => void`. Shows: thumbnail, product name, color, lens details (type/quality/power summary), qty stepper (−/+), per-item subtotal, remove (trash) icon.

  **`web/src/components/cart/PriceSummary.tsx`**: Props: `cart: Cart`. Shows: Subtotal, Lens Charges, Fitting Charge, Delivery Charge, Coupon Discount (gold, negative), **Total** (white bold). Coupon input: text field + "Apply" button that calls `applyCoupon`. Savings summary line.

---

## TASK-026: Web Checkout Page

- Phase: 4
- Component: web
- Status: DONE
- Depends: TASK-025, TASK-036, TASK-038
- Files:
  - `web/src/app/(main)/checkout/page.tsx` (create)
  - `web/src/app/(main)/checkout/confirmation/page.tsx` (create)
- Description: Build a simplified web checkout flow.

  **`web/src/app/(main)/checkout/page.tsx`**: `'use client'`. Protected (redirect to login if not auth). Multi-step checkout on a single page or wizard:
  - **Step 1 — Address:** List user's saved addresses (fetch from `GET /api/auth/me`). Select one or fill a new address form (fullName, mobile, pincode, line1, line2, city, state). "CONTINUE" button.
  - **Step 2 — Order Summary + Payment:** Cart summary (from `useCart`), `PriceSummary`, payment method selector (UPI / Card / NetBanking / Wallet / COD, as radio cards). "PLACE ORDER ₹X" gold CTA calls `POST /api/orders` with `{ deliveryAddress, paymentMethod, couponCode }`. On success, redirect to `/checkout/confirmation?orderId=X`.

  **`web/src/app/(main)/checkout/confirmation/page.tsx`**: Shows order success UI. Read `orderId` from searchParams. Display green checkmark icon, "Order Placed Successfully!", order ID, estimated delivery date ("3–5 business days"), "TRACK ORDER" and "CONTINUE SHOPPING" links.

---

## TASK-027: Flutter Home Screen (hero, categories, promos, quick actions, bottom nav)

- Phase: 5
- Component: mobile
- Status: DONE
- Depends: TASK-010, TASK-016, TASK-018
- Files:
  - `mobile/lib/screens/home/home_screen.dart` (create)
  - `mobile/lib/widgets/home/hero_banner.dart` (create)
  - `mobile/lib/widgets/home/trust_strip.dart` (create)
  - `mobile/lib/widgets/home/category_scroll.dart` (create)
  - `mobile/lib/widgets/home/promo_banners.dart` (create)
  - `mobile/lib/widgets/home/quick_action_dock.dart` (create)
  - `mobile/lib/services/product_service.dart` (create)
  - `mobile/lib/providers/product_provider.dart` (create)
- Description: Build the Flutter home screen matching the dark mobile design.

  **`mobile/lib/services/product_service.dart`**: Methods using `apiClient` (Dio): `Future<List<ProductModel>> getProducts({ String? category, String? frameType, String? sort, int page = 1 })` — GET `/api/products`. `Future<ProductModel> getProduct(String id)` — GET `/api/products/[id]`. Parse response JSON into `ProductModel` instances.

  **`mobile/lib/providers/product_provider.dart`**: `class ProductProvider extends ChangeNotifier`. Fields: `List<ProductModel> products`, `bool isLoading`. `Future<void> fetchProducts({ String? category, String? sort })` calls service, notifies listeners.

  **`mobile/lib/widgets/home/hero_banner.dart`**: `HeroBanner` widget. `PageView` with 4 slides (hardcoded: discount promos, new arrivals, etc.). `Timer.periodic(2s)` auto-advance. Dot `Row` indicator below. Each slide: gradient overlay dark-to-transparent, headline (white bold), subtext (grey), "SHOP NOW" gold `ElevatedButton`.

  **`mobile/lib/widgets/home/trust_strip.dart`**: Horizontal `SingleChildScrollView` with `Row` of 4 `Column` (icon + label) trust badges. Transparent bg, icons in gold.

  **`mobile/lib/widgets/home/category_scroll.dart`**: `CategoryScroll` widget. `ListView.builder` horizontal with categories: Prescription, Sunglasses, Blue Light, Kids, Contact Lenses. Each: `CircleAvatar` (dark card bg, icon in gold), label below in small white text.

  **`mobile/lib/widgets/home/promo_banners.dart`**: `PromoBanners` widget. 2-column `GridView` with 2 promo cards: "UP TO 50% OFF" and "NEW ARRIVALS". Each card: dark bg, bold white headline, gold "SHOP NOW" button.

  **`mobile/lib/widgets/home/quick_action_dock.dart`**: `QuickActionDock` widget. `Row` of 5 `InkWell` icon+label tiles. Center "Ask AI" tile: `Container` with gold bg, slightly taller/elevated appearance. Other 4: dark bg icon tiles (Try On, Scan Rx, Track Order, Find Store).

  **`mobile/lib/screens/home/home_screen.dart`**: `StatefulWidget`. `Scaffold` with:
  - `AppBar`: hamburger `IconButton` (left), "EyeGlaze" serif gold logo (center), Row of search + bell + cart `IconButton`s (right, cart shows badge from `CartProvider`).
  - `BottomNavigationBar`: 5 items — Home, Categories, Wishlist, Orders, Account. Current index state drives body content.
  - Body (when Home tab selected): `SingleChildScrollView` with `Column` of: `HeroBanner`, `TrustStrip`, `CategoryScroll`, `PromoBanners`, `QuickActionDock`, Featured Products section (heading + `GridView.builder` 2-column using `ProductCard`s loaded from `ProductProvider`).

---

## TASK-028: Flutter Product Listing Screen

- Phase: 5
- Component: mobile
- Status: DONE
- Depends: TASK-027
- Files:
  - `mobile/lib/screens/products/product_listing_screen.dart` (create)
  - `mobile/lib/widgets/products/product_card.dart` (create)
  - `mobile/lib/widgets/products/filter_bottom_sheet.dart` (create)
- Description: Build the Flutter product listing screen.

  **`mobile/lib/widgets/products/product_card.dart`**: `ProductCard` widget. Props: `ProductModel product`, `VoidCallback onAddToCart`. Dark `Card` (rounded-xl, `#1A1A1A`). Stack with product image (`CachedNetworkImage`), top-left BESTSELLER `Badge` (gold bg, white text, shown if `product.isBestseller`), top-right "Add +" `IconButton` (outlined gold). Below image: name (white bold), frame type (grey small), price `Row` (selling price bold white, strikethrough MRP grey, discount % gold), `RatingBar` row.

  **`mobile/lib/widgets/products/filter_bottom_sheet.dart`**: `FilterBottomSheet` widget (shown via `showModalBottomSheet`). Sections: Category (checkbox list), Frame Type (checkbox list), Price Range (`RangeSlider`), Sort By (radio list). Apply/Reset buttons. Calls `onApply(FilterState filters)` callback.

  **`mobile/lib/screens/products/product_listing_screen.dart`**: `StatefulWidget`. Accepts optional `String? category`, `String? frameType`. On `initState`, call `productProvider.fetchProducts(category: category)`. `AppBar` with back arrow, category title, filter icon (opens `FilterBottomSheet`). Body: `GridView.builder` 2-column with `ProductCard`s. `ScrollController` detects near-bottom → load next page. Loading spinner at bottom during pagination. Empty state if no products.

---

## TASK-029: Flutter Product Detail Screen (carousel, colors, specs, CTAs)

- Phase: 5
- Component: mobile
- Status: DONE
- Depends: TASK-028
- Files:
  - `mobile/lib/screens/products/product_detail_screen.dart` (create)
  - `mobile/lib/widgets/products/color_swatch_row.dart` (create)
  - `mobile/lib/widgets/products/frame_spec_strip.dart` (create)
  - `mobile/lib/widgets/products/sticky_cta_bar.dart` (create)
- Description: Build the Flutter product detail screen with all sections from the design spec.

  **`mobile/lib/widgets/products/color_swatch_row.dart`**: `ColorSwatchRow` widget. Props: `List<ProductColor> colors`, `String selectedColor`, `ValueChanged<String> onColorSelected`. `Row` of `GestureDetector`-wrapped `CircleAvatar`s (hex color bg, 36px diameter). Selected swatch has `BoxDecoration` with gold border ring and a center checkmark `Icon`.

  **`mobile/lib/widgets/products/frame_spec_strip.dart`**: `FrameSpecStrip` widget. `Row` of 4 `Column`s each showing an icon (ruler/glasses etc.), value in mm (bold white), and label (grey small). Dividers between columns.

  **`mobile/lib/widgets/products/sticky_cta_bar.dart`**: `StickyCTABar` widget. `BottomAppBar` with price text (left) + two `ElevatedButton`s: "ADD TO CART" (outlined, transparent bg, gold border) and "BUY WITH LENS" (gold fill). Tap "ADD TO CART" → `cartService.addToCart(productId, color, qty: 1)`. Tap "BUY WITH LENS" → navigate to lens wizard.

  **`mobile/lib/screens/products/product_detail_screen.dart`**: `StatefulWidget`. State: `selectedColor` (String, init to first color), `currentImageIndex` (int). Fetches product via `productService.getProduct(id)` on `initState`. Structure: `Scaffold` with `extendBodyBehindAppBar: true`, transparent AppBar with back/share/wishlist icons. Body: `CustomScrollView` with:
  1. `SliverToBoxAdapter` containing image `PageView` + thumbnail `ListView` horizontal strip (5 images)
  2. `SliverToBoxAdapter` for product info: SKU (grey small), name (bold white 20px), `RatingBar` + count + "X bought this week"
  3. Pricing row: ₹1 large bold, ₹999 strikethrough grey, gold "50% OFF" `Chip`
  4. `ColorSwatchRow` with label "Color: Matte Black"
  5. `FrameSpecStrip`
  6. `ExpansionTile` "Frame Details" with material text, feature `Chip`s, compatibility badges
  7. Lens CTA `ListTile`: glasses icon, "Add Prescription Lenses — Starting from ₹699", "SELECT LENS" outlined button
  8. `TrustBadgeStrip`
  Bottom: `StickyCTABar`.

---

## TASK-030: Flutter Buy With Lens Wizard Step 1 (Lens Type)

- Phase: 5
- Component: mobile
- Status: DONE
- Depends: TASK-020, TASK-029
- Files:
  - `mobile/lib/providers/lens_wizard_provider.dart` (create)
  - `mobile/lib/screens/lens_wizard/lens_wizard_shell.dart` (create)
  - `mobile/lib/screens/lens_wizard/step1_lens_type_screen.dart` (create)
  - `mobile/lib/widgets/lens_wizard/wizard_progress_bar.dart` (create)
  - `mobile/lib/widgets/lens_wizard/mini_frame_card.dart` (create)
  - `mobile/lib/services/lens_service.dart` (create)
- Description: Build the wizard infrastructure and Step 1 (lens type selection).

  **`mobile/lib/services/lens_service.dart`**: `Future<Map<String, List<LensOptionModel>>> getLensOptions({ String? kind })` — GET `/api/lens-options?kind=X`. Returns `{ lensTypes: [...], lensQualities: [...] }`. Parse into `LensOptionModel` instances.

  **`mobile/lib/providers/lens_wizard_provider.dart`**: `class LensWizardProvider extends ChangeNotifier`. Fields: `ProductModel? product`, `String? selectedColor`, `LensOptionModel? selectedLensType`, `LensOptionModel? selectedProgressiveTier`, `Map<String, dynamic> power` (RE sph/cyl/axis, LE sph/cyl/axis, pd), `LensOptionModel? selectedLensQuality`. Methods: `setProduct(ProductModel p, String color)`, `setLensType(LensOptionModel lt)`, `setProgressiveTier(LensOptionModel pt)`, `setPower(Map data)`, `setLensQuality(LensOptionModel lq)`. Computed `totalLensPrice` getter.

  **`mobile/lib/widgets/lens_wizard/wizard_progress_bar.dart`**: `WizardProgressBar` widget. Props: `int currentStep` (1–4). Row of 4 steps labeled LENS TYPE, POWER, QUALITY, CHECKOUT. Each: circle with step number (active: gold filled, completed: gold checkmark, inactive: dark), connected by line. Current step label shown in gold below.

  **`mobile/lib/widgets/lens_wizard/mini_frame_card.dart`**: `MiniFrameCard` widget. Persistent card shown on every wizard step. Shows: small product image (60×60), product name (white bold small), selected color, frame size. "Change Frame" `TextButton` (gold). Background `#1A1A1A`, rounded-xl.

  **`mobile/lib/screens/lens_wizard/lens_wizard_shell.dart`**: `StatefulWidget`. Full-screen modal (pushed via `Navigator.push` with `MaterialPageRoute`). Top section: close (X) button, `WizardProgressBar`, `MiniFrameCard`. Body: the current step screen content. Bottom: persistent "CONTINUE" gold button.

  **`mobile/lib/screens/lens_wizard/step1_lens_type_screen.dart`**: Fetches `lensTypes` from `lensService.getLensOptions(kind: 'type')`. Renders 5 radio-select `Card`s (dark bg, gold border when selected). Each card: lens type display name, starting price, brief description. If Progressive selected, shows "Choose Progressive Type" sub-section with 4 tier cards (or navigates to Step 1B). "CONTINUE TO POWER ENTRY" gold button activates when a selection is made.

---

## TASK-031: Flutter Buy With Lens Wizard Step 2 (Power Entry)

- Phase: 5
- Component: mobile
- Status: DONE
- Depends: TASK-030
- Files:
  - `mobile/lib/screens/lens_wizard/step1b_progressive_screen.dart` (create)
  - `mobile/lib/screens/lens_wizard/step2_power_entry_screen.dart` (create)
- Description: Build Step 1B (progressive tier selection) and Step 2 (power entry).

  **`mobile/lib/screens/lens_wizard/step1b_progressive_screen.dart`**: 4 tier option cards (HC / Premium / Advanced / Elite Progressive) with prices and feature lists. "How Progressive Lenses Work" info banner. Selected tier card gets gold border. "CONTINUE TO POWER ENTRY" CTA. Saves `selectedProgressiveTier` to `LensWizardProvider`.

  **`mobile/lib/screens/lens_wizard/step2_power_entry_screen.dart`**: Power prescription entry form. Two sections: Right Eye and Left Eye. Each has three `CupertinoPicker`-style spinners or custom scroll wheels for SPH (range: –20.00 to +20.00, step 0.25), CYL (–6.00 to 0.00, step 0.25), and AXIS (0° to 180°, step 1). PD field below (numeric input, range 40–80mm). "Don't know your power?" help text. "Upload Prescription" option: `ElevatedButton` (outlined) that opens image picker (`image_picker` package). Note: power fields not required if lens type is Zero Power or Blue Cut — in that case show a note and skip form. "CONTINUE TO LENS QUALITY" CTA. Saves power data to `LensWizardProvider`.

---

## TASK-032: Flutter Buy With Lens Wizard Step 3 (Lens Quality)

- Phase: 5
- Component: mobile
- Status: DONE
- Depends: TASK-031
- Files:
  - `mobile/lib/screens/lens_wizard/step3_lens_quality_screen.dart` (create)
- Description: Build Step 3 — lens quality tier selection.

  Fetches `lensQualities` from `lensService.getLensOptions(kind: 'quality')`. Renders 4 radio-select cards: HMC + Blue Cut (₹999, badge: "RECOMMENDED"), HMC (₹699), Blue Cut (₹899), HC Hard Coated (₹799). Each card: quality name, price per pair, features list (anti-reflective, UV protection, blue light, etc.), badge `Chip`. HMC+Blue Cut card gets "RECOMMENDED" badge and is pre-selected. Selected card: gold border. "CONTINUE TO CHECKOUT" gold CTA. Saves `selectedLensQuality` and `lensPrice` to `LensWizardProvider`.

---

## TASK-033: Flutter Buy With Lens Wizard Step 4 (Checkout Summary)

- Phase: 5
- Component: mobile
- Status: DONE
- Depends: TASK-032, TASK-038
- Files:
  - `mobile/lib/screens/lens_wizard/step4_checkout_summary_screen.dart` (create)
- Description: Build Step 4 — the wizard checkout summary screen.

  Reads all data from `LensWizardProvider`. Renders:
  - Full-width `MiniFrameCard` variant (larger, showing all selections)
  - Order breakdown table: Frame (name + color + size + qty), Lens Type (name + sub-tier if progressive), Lens Quality, Power summary (RE: SPH/CYL/AXIS, LE: SPH/CYL/AXIS, PD)
  - Pricing breakdown card: Frame Price ₹1, Lens Price (from `lensPrice`), Fitting Charge ₹199, Delivery ₹99, Coupon Discount (if applied, negative gold), **Total** (white bold large)
  - Coupon input `Row`: `TextField` + "Apply" `TextButton` → POST `/api/cart/apply-coupon`, shows discount in green on success
  - EyeGlaze Membership upsell `Card`: "Save more with Membership ₹99/year" with benefits list and "JOIN NOW" button
  - Savings summary: "You save ₹X on this order" in gold
  - "PROCEED TO PAYMENT" full-width gold `ElevatedButton` → calls `POST /api/orders` with full wizard data, then navigates to `OrderConfirmationScreen`

---

## TASK-034: Flutter Cart Screen

- Phase: 5
- Component: mobile
- Status: DONE
- Depends: TASK-036, TASK-027
- Files:
  - `mobile/lib/screens/cart/cart_screen.dart` (create)
  - `mobile/lib/services/cart_service.dart` (create)
  - `mobile/lib/providers/cart_provider.dart` (create)
- Description: Build the Flutter cart screen and cart state management.

  **`mobile/lib/services/cart_service.dart`**: Methods: `Future<CartModel> getCart()` — GET `/api/cart`. `Future<CartModel> addToCart({ productId, color, qty, lensConfig? })` — POST `/api/cart`. `Future<CartModel> updateCartItem(String itemId, int qty)` — PUT `/api/cart/[itemId]`. `Future<void> removeCartItem(String itemId)` — DELETE `/api/cart/[itemId]`. `Future<Map> applyCoupon(String code, num orderTotal)` — POST `/api/cart/apply-coupon`.

  **`mobile/lib/providers/cart_provider.dart`**: `class CartProvider extends ChangeNotifier`. Fields: `CartModel? cart`, `bool isLoading`. Wraps all `CartService` methods, updates `cart`, notifies listeners. Exposes `itemCount` getter (sum of all item qty). `syncCart()` called on app start.

  **`mobile/lib/screens/cart/cart_screen.dart`**: `Scaffold`. `AppBar` "My Cart" title. If cart empty: centered illustration + "Your cart is empty" text + "BROWSE FRAMES" gold button. Else: `ListView.builder` of cart item tiles. Each tile: product image (60×60), name + color (white), lens details summary (grey small), qty stepper `Row` (−/+/value), item total price (white right-aligned), swipe-to-delete or trash icon. Bottom: price summary `Card` (subtotal, lens charges, fitting, delivery, total), "PROCEED TO CHECKOUT" gold full-width button → navigate to `DeliveryAddressScreen`.

---

## TASK-035: Flutter Orders Screen

- Phase: 5
- Component: mobile
- Status: DONE
- Depends: TASK-039
- Files:
  - `mobile/lib/screens/orders/orders_list_screen.dart` (create)
  - `mobile/lib/screens/orders/order_detail_screen.dart` (create)
  - `mobile/lib/screens/checkout/delivery_address_screen.dart` (create)
  - `mobile/lib/screens/checkout/payment_screen.dart` (create)
  - `mobile/lib/screens/checkout/order_confirmation_screen.dart` (create)
  - `mobile/lib/services/order_service.dart` (create)
- Description: Build orders list/detail screens and checkout flow screens.

  **`mobile/lib/services/order_service.dart`**: Methods: `Future<List<OrderModel>> getOrders()` — GET `/api/orders`. `Future<OrderModel> getOrder(String orderId)` — GET `/api/orders/[orderId]`. `Future<OrderModel> placeOrder(Map payload)` — POST `/api/orders`.

  **`mobile/lib/screens/orders/orders_list_screen.dart`**: Fetches orders on load. `ListView` of order summary tiles: order ID (gold), date, status `Chip` (color-coded), total, product thumbnail, "VIEW DETAILS" link.

  **`mobile/lib/screens/orders/order_detail_screen.dart`**: Full order detail: product + lens summary, delivery address, pricing breakdown, status timeline (vertical step indicator), tracking number (if available), "TRACK ORDER" button.

  **`mobile/lib/screens/checkout/delivery_address_screen.dart`**: Lists user's saved addresses (from `authProvider.currentUser.addresses`). Radio select. "Add New Address" form (`TextField`s for fullName, mobile, pincode, line1, line2, city, state, type radio). "CONTINUE TO PAYMENT" gold button.

  **`mobile/lib/screens/checkout/payment_screen.dart`**: Payment method `RadioListTile`s: UPI, Card, Net Banking, Wallet, COD. Order price recap. "PAY NOW ₹X,XXX" gold button. On tap: call `orderService.placeOrder(...)`, navigate to confirmation.

  **`mobile/lib/screens/checkout/order_confirmation_screen.dart`**: Animated checkmark (use `Lottie` or simple `AnimatedContainer`). "Order Placed Successfully!" headline. Order ID (gold). "Estimated Delivery: 3–5 business days". Two buttons: "TRACK ORDER" (outlined) and "CONTINUE SHOPPING" (gold fill).

---

## TASK-036: API GET/POST /api/cart

- Phase: 6
- Component: server
- Status: DONE
- Depends: TASK-004, TASK-008
- Files:
  - `web/src/app/api/cart/route.ts` (create)
- Description: Implement the cart GET and POST (add item) endpoints.

  **`GET /api/cart`**: Auth required. Call `connectDB()`. Find `Cart` by `user: auth.userId`, `.populate('items.product', 'name images price sku frame colors')`. If no cart exists, return empty cart `{ items: [], total: 0 }`. Return populated cart.

  **`POST /api/cart`**: Auth required. Body: `{ productId, color, qty, lens? }` where `lens` is optional `{ lensType, lensSubType, power, lensQuality, lensPrice }`. Validate that `productId` exists in Product collection. Find or create Cart for user. Check if identical item (same productId + color + lens config) exists — if so, increment `qty`. Else push new item with `framePrice: 1` (current promo price). Set `fittingCharge: 199` if `lens` provided. Update `updatedAt`. Return `{ success: true, cart }`.

---

## TASK-037: API PUT/DELETE /api/cart/[itemId]

- Phase: 6
- Component: server
- Status: DONE
- Depends: TASK-036
- Files:
  - `web/src/app/api/cart/[itemId]/route.ts` (create)
  - `web/src/app/api/cart/apply-coupon/route.ts` (create)
- Description: Implement cart item update, removal, and coupon validation.

  **`PUT /api/cart/[itemId]`**: Auth required. Body: `{ qty }`. Find user's cart. Find item by `_id` matching `itemId`. If `qty <= 0`, remove item (`$pull`). Else update `qty` using `$set` on the array subdocument. Return updated cart.

  **`DELETE /api/cart/[itemId]`**: Auth required. Find user's cart. Remove item with `$pull: { items: { _id: itemId } }`. Return `200 { success: true }`.

  **`POST /api/cart/apply-coupon`**: Auth required. Body: `{ couponCode, orderTotal }`. Find `Coupon` by `code` (uppercase). Validate: `isActive: true`, `validFrom <= now <= validTo`, `orderTotal >= minOrderValue`, `usedCount < usageLimitTotal`. Check user hasn't exceeded `usageLimitPerUser` (count their orders using that coupon). Calculate discount (percent: `min(orderTotal * value/100, maxDiscount)`, flat: `value`). Return `{ valid: true, discount, message }` or `{ valid: false, message }`.

---

## TASK-038: API POST /api/orders

- Phase: 6
- Component: server
- Status: DONE
- Depends: TASK-005, TASK-036, TASK-008
- Files:
  - `web/src/app/api/orders/route.ts` (create)
  - `web/src/lib/validations/order.schema.ts` (create)
- Description: Implement order creation and user order listing.

  **`web/src/lib/validations/order.schema.ts`**: Zod schema for order creation body: `{ deliveryAddress: addressSchema, paymentMethod: z.enum(['UPI','Card','NetBanking','Wallet','COD']), couponCode?: z.string() }`.

  **`POST /api/orders`**: Auth required. Logic:
  1. Validate body with `orderSchema`.
  2. Fetch user's cart (with product details populated).
  3. If cart is empty, return `400 { error: 'Cart is empty' }`.
  4. Re-calculate pricing server-side: for each item, `framePrice = 1`, `lensPrice` from item, `fittingCharge = 199 if lens else 0`. Sum subtotal, lens charges, fitting. Add delivery ₹99. Apply coupon discount if `couponCode` provided (validate coupon again server-side).
  5. Generate `orderId`: `EGO-YYYYMMDD-` + 4-digit padded count (use `Order.countDocuments()` + 1).
  6. Create `Order` document with `status: 'pending'`, `paymentStatus: 'paid'` (stub — real gateway in future), items as embedded snapshots (deep copy of cart items), `statusHistory: [{ status: 'pending', timestamp: now }]`.
  7. Set `cart.items = []` (clear cart).
  8. Increment coupon `usedCount` if coupon used.
  9. Return `201 { orderId, total, estimatedDelivery: now + 5 days }`.

  **`GET /api/orders`**: Auth required. Return all orders for current user sorted by `createdAt: -1`. Populate `items.product` for name and image.

---

## TASK-039: API GET /api/orders/[orderId]

- Phase: 6
- Component: server
- Status: DONE
- Depends: TASK-038
- Files:
  - `web/src/app/api/orders/[orderId]/route.ts` (create)
- Description: Implement single order retrieval.

  **`GET /api/orders/[orderId]`**: Auth required. Find order by `orderId` string field. Check that `order.user.toString() === auth.userId` OR `auth.role` is admin/store_manager/support_agent — else return 403. Populate `user` (name, email, mobile). Return full order document.

---

## TASK-040: Admin Dashboard Page

- Phase: 7
- Component: web
- Status: DONE
- Depends: TASK-008, TASK-022, TASK-050
- Files:
  - `web/src/app/admin/layout.tsx` (create)
  - `web/src/app/admin/page.tsx` (create)
  - `web/src/components/admin/AdminSidebar.tsx` (create)
  - `web/src/components/admin/AdminTopBar.tsx` (create)
  - `web/src/components/admin/MetricCard.tsx` (create)
  - `web/src/components/admin/RecentOrdersTable.tsx` (create)
- Description: Build the admin dashboard layout and main dashboard page.

  **`web/src/app/admin/layout.tsx`**: Server component. Call `getAuthUser(req)` — redirect to `/login` if null or role not in `['admin','store_manager','support_agent']`. Layout: flex row with `AdminSidebar` (fixed left, 240px) + main content area (`flex-1`). `AdminTopBar` at top of main. Dark theme throughout.

  **`web/src/components/admin/AdminSidebar.tsx`**: `'use client'`. Sidebar with EyeGlaze Admin logo. Nav items (each with icon + label, gold highlight when active via `usePathname`): Dashboard, Products, Orders, Inventory, Prescriptions, Customers, Coupons, Analytics, Lens Options. Logout button at bottom. Dark bg `#1A1A1A`, border-right `#2A2A2A`.

  **`web/src/components/admin/AdminTopBar.tsx`**: `'use client'`. Top bar: page title (left), admin user name + avatar (right), logout `IconButton`. Dark bg `#0D0D0D` with bottom border.

  **`web/src/components/admin/MetricCard.tsx`**: Props: `label: string`, `value: string | number`, `subLabel?: string`, `trend?: 'up' | 'down'`, `trendPercent?: number`. Dark card with label (grey), large value (white bold), sub-label (grey small), trend arrow (green/red). Rounded-xl.

  **`web/src/components/admin/RecentOrdersTable.tsx`**: `'use client'`. Table: Order ID (gold), Customer, Amount, Status `Badge`, Date, "View" link. Status badges: pending (yellow), processing (blue), shipped (purple), delivered (green), cancelled (red). Props: `orders: Order[]`.

  **`web/src/app/admin/page.tsx`**: Server component (or use client with fetch). Fetch `GET /api/admin/stats`. Render: row of 5 `MetricCard`s (Today's Orders, Week Revenue, Pending Orders, Low Stock, New Customers). Below: "Recent Orders" heading + `RecentOrdersTable`. Quick action buttons: "Add Product" (`/admin/products/new`), "Process Orders" (`/admin/orders?status=pending`).

---

## TASK-041: Admin Products CRUD Page

- Phase: 7
- Component: web
- Status: DONE
- Depends: TASK-040, TASK-045, TASK-046
- Files:
  - `web/src/app/admin/products/page.tsx` (create)
  - `web/src/app/admin/products/new/page.tsx` (create)
  - `web/src/app/admin/products/[id]/edit/page.tsx` (create)
  - `web/src/components/admin/products/ProductForm.tsx` (create)
  - `web/src/components/admin/products/ColorVariantRow.tsx` (create)
  - `web/src/components/admin/products/ImageUploader.tsx` (create)
- Description: Build admin product management pages.

  **`web/src/app/admin/products/page.tsx`**: Fetch `GET /api/admin/products` (all including inactive). Table: SKU (gold), Name, Category, MRP, Selling Price, Total Stock (sum all color stocks), Status (`isActive` toggle), Edit/Delete action buttons. Search bar (filters client-side by name/SKU). Category filter dropdown. Pagination (client-side or server-side). "Add New Product" button top-right → link to `/admin/products/new`.

  **`web/src/components/admin/products/ImageUploader.tsx`**: `'use client'`. Drag-and-drop file input. Shows preview grid. Props: `images: string[]`, `onChange: (images: string[]) => void`. Uploads to `/api/upload` (stub) or uses local storage placeholder.

  **`web/src/components/admin/products/ColorVariantRow.tsx`**: `'use client'`. One row per color: color name `<input>`, hex color picker `<input type="color">`, stock `<input type="number">`, image URLs `<input>`, remove row button. Props: `color: ProductColor`, `onChange`, `onRemove`.

  **`web/src/components/admin/products/ProductForm.tsx`**: `'use client'`. Large form component. Fields: SKU (auto + editable), Name, Frame Type, Material, Category (select), Lens Compatibility (checkboxes: prescription, bluecut, zeropower, progressive), Colors (dynamic `ColorVariantRow` list with "Add Color" button), Dimensions (4 number inputs: frame width, lens width, bridge width, temple length), MRP + Selling Price + auto-computed Discount %, BESTSELLER toggle, Active toggle, Feature Tags (tag input chip), SEO Title + Description, `ImageUploader`. On submit: call `POST /api/admin/products` (new) or `PUT /api/admin/products/[id]` (edit). Shows success toast. Uses `react-hook-form` + Zod validation.

  **`web/src/app/admin/products/new/page.tsx`**: Renders `<ProductForm />` with no initial data. Title "Add New Product".

  **`web/src/app/admin/products/[id]/edit/page.tsx`**: Fetches product via `GET /api/admin/products/[id]`. Renders `<ProductForm initialData={product} />`. Title "Edit Product — EG-XXXX".

---

## TASK-042: Admin Orders Management Page

- Phase: 7
- Component: web
- Status: DONE
- Depends: TASK-040, TASK-047, TASK-048
- Files:
  - `web/src/app/admin/orders/page.tsx` (create)
  - `web/src/app/admin/orders/[orderId]/page.tsx` (create)
  - `web/src/components/admin/orders/OrderStatusTimeline.tsx` (create)
  - `web/src/components/admin/orders/OrderDetailCard.tsx` (create)
  - `web/src/components/admin/orders/PrescriptionImageViewer.tsx` (create)
- Description: Build admin order management pages.

  **`web/src/app/admin/orders/page.tsx`**: `'use client'`. Tab bar for status filter: All | Pending | Confirmed | Processing | Shipped | Delivered | Cancelled | Returned. Fetch `GET /api/admin/orders?status=X`. Table: Order ID (gold, link), Customer name, Product (first item name), Total, Date, Status `Badge`, "View" button. Search by order ID or customer. Date range filter.

  **`web/src/components/admin/orders/OrderStatusTimeline.tsx`**: Vertical step list showing `order.statusHistory`. Each item: dot (gold if current, grey if past, outline if future), status label, timestamp, note if present.

  **`web/src/components/admin/orders/PrescriptionImageViewer.tsx`**: `'use client'`. If `order.items[0].prescriptionImage` or linked Prescription has `uploadedFile`, show image in a modal lightbox on click. Shows "Verified" badge if `order.prescriptionVerified`.

  **`web/src/components/admin/orders/OrderDetailCard.tsx`**: Card showing all order info: customer info, delivery address, item details (frame + lens + power), pricing breakdown, payment info, tracking.

  **`web/src/app/admin/orders/[orderId]/page.tsx`**: Fetch `GET /api/admin/orders/[orderId]`. Render: `OrderDetailCard`, `OrderStatusTimeline`, `PrescriptionImageViewer`. Action panel (right column): Update Status dropdown (`<select>` with all statuses) + "Update" button → `PUT /api/admin/orders/[orderId]`. Tracking: courier + number inputs + "Save Tracking" button. Internal note textarea + "Add Note" button. "Mark Prescription Verified" toggle. "Flag Order" toggle.

---

## TASK-043: Admin Inventory Page

- Phase: 7
- Component: web
- Status: DONE
- Depends: TASK-040, TASK-049
- Files:
  - `web/src/app/admin/inventory/page.tsx` (create)
- Description: Build the admin inventory management page.

  **`web/src/app/admin/inventory/page.tsx`**: `'use client'`. Fetch `GET /api/admin/inventory`. Table showing each Product × Color variant as a row: SKU, Product Name, Color Name, Color Swatch (hex circle), Stock Count (editable inline — click to edit, press Enter to save via `PUT /api/admin/inventory/[productId]`), Status (`In Stock` green / `Low Stock` yellow if <10 / `Out of Stock` red if 0). Filter: "Show Low Stock Only" toggle. "Mark Out of Stock" button per row. Sort by stock count ascending to surface critical items. Export CSV button (client-side generate).

---

## TASK-044: Admin Users Page

- Phase: 7
- Component: web
- Status: DONE
- Depends: TASK-040, TASK-050
- Files:
  - `web/src/app/admin/users/page.tsx` (create)
  - `web/src/app/admin/users/[userId]/page.tsx` (create)
- Description: Build admin customer management pages.

  **`web/src/app/admin/users/page.tsx`**: `'use client'`. Fetch `GET /api/admin/users`. Table: User ID, Name, Mobile, Email, Orders Count, Total Spend, Membership Status, Joined Date, "View" button. Search by name/mobile/email. Filter by membership status.

  **`web/src/app/admin/users/[userId]/page.tsx`**: Fetch `GET /api/admin/users/[userId]`. Show: profile card (name, mobile, email, role, membership, joined date), saved addresses list, prescriptions list (with status), full orders table. No edit capability for customer data (read-only).

---

## TASK-045: API GET/POST /api/admin/products

- Phase: 8
- Component: server
- Status: DONE
- Depends: TASK-002, TASK-008
- Files:
  - `web/src/app/api/admin/products/route.ts` (create)
  - `web/src/app/api/admin/stats/route.ts` (create)
- Description: Implement admin product list/create routes and dashboard stats.

  **`web/src/app/api/admin/products/route.ts`**:
  - `GET` — Admin-only. No `isActive` filter (returns all including inactive). Support `search`, `category`, `frameType`, `isActive` query params. No pagination limit restriction (or higher limit). Return `{ products, total }`.
  - `POST` — Admin-only. Same logic as public `POST /api/products` (can share a service function). Validate with productSchema. Auto-generate SKU. Return created product.

  **`web/src/app/api/admin/stats/route.ts`**: Admin-only. MongoDB aggregation pipeline on `Order` collection:
  - Orders today: `createdAt >= startOfDay`.
  - Orders this week: `createdAt >= startOfWeek`.
  - Orders this month: `createdAt >= startOfMonth`.
  - Revenue (sum of `total`) for same three periods.
  - Pending orders count: `status: 'pending'`.
  - New users this week: User `createdAt >= startOfWeek`, `role: 'customer'`.
  - Low stock count: Products where any `colors.stock < 10`.
  Return: `{ orders: { today, week, month }, revenue: { today, week, month }, pending, lowStock, newCustomers }`.

---

## TASK-046: API PUT/DELETE /api/admin/products/[id]

- Phase: 8
- Component: server
- Status: DONE
- Depends: TASK-045
- Files:
  - `web/src/app/api/admin/products/[id]/route.ts` (create)
- Description: Implement admin single product get, update, and delete routes.

  **`GET /api/admin/products/[id]`**: Admin-only. Find by `_id` (includes inactive products). Return full document.

  **`PUT /api/admin/products/[id]`**: Admin-only. Validate partial body with productSchema (use `.partial()`). Use `findByIdAndUpdate` with `{ $set: body }`, `{ new: true, runValidators: true }`. Return updated product.

  **`DELETE /api/admin/products/[id]`**: Admin-only. If query param `?hard=true` AND `auth.role === 'admin'`: permanently delete (`findByIdAndDelete`). Else: soft delete (`isActive: false`). Return `200 { success: true, deleted: 'soft' | 'hard' }`.

---

## TASK-047: API GET /api/admin/orders

- Phase: 8
- Component: server
- Status: DONE
- Depends: TASK-005, TASK-008
- Files:
  - `web/src/app/api/admin/orders/route.ts` (create)
- Description: Implement admin order listing.

  **`GET /api/admin/orders`**: Admin-only. Query params: `status` (filter), `dateFrom`, `dateTo` (ISO strings), `search` (by orderId or customer name/mobile), `page` (default 1), `limit` (default 25). Build Mongoose query. Populate `user` fields (`name`, `mobile`, `email`). Sort by `createdAt: -1`. Return `{ orders, total, page, totalPages }`.

---

## TASK-048: API PUT /api/admin/orders/[orderId]/status

- Phase: 8
- Component: server
- Status: DONE
- Depends: TASK-047
- Files:
  - `web/src/app/api/admin/orders/[orderId]/route.ts` (create)
- Description: Implement admin single order retrieval and update (status, tracking, notes, refund, prescription verification).

  **`GET /api/admin/orders/[orderId]`**: Admin-only. Find order by `orderId` string. Populate `user` (full profile), link and fetch `Prescription` if applicable. Return full document.

  **`PUT /api/admin/orders/[orderId]`**: Admin-only. Body can contain any of:
  - `{ status }` → validate status is in enum, push `{ status, timestamp: now, note: body.note }` to `statusHistory`, update `order.status`.
  - `{ trackingNumber, courierPartner }` → update those fields.
  - `{ internalNote }` → push `{ note, addedBy: auth.userId, addedAt: now }` to `internalNotes`.
  - `{ prescriptionVerified: true }` → set `order.prescriptionVerified = true`.
  - `{ paymentStatus: 'refunded' }` → update `paymentStatus`.
  - `{ isFlagged }` → update flag.
  Use `findOneAndUpdate` with `{ new: true }`. Return updated order.

---

## TASK-049: API GET /api/admin/inventory

- Phase: 8
- Component: server
- Status: DONE
- Depends: TASK-002, TASK-008
- Files:
  - `web/src/app/api/admin/inventory/route.ts` (create)
  - `web/src/app/api/admin/inventory/[productId]/route.ts` (create)
- Description: Implement admin inventory APIs.

  **`GET /api/admin/inventory`**: Admin-only. Fetch all Products (active and inactive) with only `sku`, `name`, `isActive`, `colors` fields. Optionally filter `?lowStock=true` (returns only products with at least one `colors.stock < 10`). Return flat list or grouped by product.

  **`PUT /api/admin/inventory/[productId]`**: Admin-only. Two update modes based on body:
  - `{ colorName, stock }` → find the color in `product.colors` array by `name`, update its `stock`. Use `findOneAndUpdate` with `$set: { 'colors.$[elem].stock': stock }` with `arrayFilters: [{ 'elem.name': colorName }]`.
  - `{ isActive }` → update product `isActive` field.
  Return updated product.

---

## TASK-050: API GET /api/admin/users

- Phase: 8
- Component: server
- Status: DONE
- Depends: TASK-001, TASK-005, TASK-008
- Files:
  - `web/src/app/api/admin/users/route.ts` (create)
  - `web/src/app/api/admin/users/[userId]/route.ts` (create)
- Description: Implement admin user management APIs.

  **`GET /api/admin/users`**: Admin-only. Query `User` collection with `role: 'customer'` (or role not 'admin'). Use MongoDB aggregation to join with `Order` collection and compute: `orderCount` (count of orders), `totalSpend` (sum of `order.total`). Query params: `search` (by name/mobile/email via `$regex`), `page`, `limit` (default 25), `membership` (`true`/`false`). Return `{ users: [...with orderCount + totalSpend], total, page, totalPages }`.

  **`GET /api/admin/users/[userId]`**: Admin-only. Fetch user by `_id`. Fetch user's orders (`Order.find({ user: userId })`). Fetch user's prescriptions (`Prescription.find({ user: userId })`). Return `{ user, orders, prescriptions }`.

---

*End of EyeGlaze Task List*
*Total Tasks: 50 | Phases: 8 | Components: server, web, mobile, shared*
