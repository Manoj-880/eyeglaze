# EyeGlaze — User Buy Flow Verification

**Date:** 2026-06-16

---

## Step 1: Mobile Auth — PASS

| Check | Result |
|---|---|
| `login_screen.dart` — Mobile + Email options | PASS — two `_AuthOptionCard` entries: "Continue with Mobile Number" → `PhoneLoginScreen`, "Continue with Email" → `EmailLoginScreen` |
| `phone_login_screen.dart` — +91 prefix | PASS — hardcoded `+91` label with chevron, left of input field |
| `phone_login_screen.dart` — SEND OTP button | PASS — `GoldButton(label: 'SEND OTP', ...)` calls `apiService.sendOtp()` then pushes `OtpScreen` |
| `phone_login_screen.dart` — numeric keypad | PASS — custom `_NumPad` widget with 0-9 + backspace keys |
| `otp_screen.dart` — 6-box input | PASS — `List.generate(6, ...)` of `TextField(maxLength:1)` with auto-focus advance |
| `otp_screen.dart` — VERIFY button | PASS — `GoldButton(label:'VERIFY')` calls `apiService.verifyOtp()` |
| `otp_screen.dart` — redirect to HomeScreen | PASS — on success: `Navigator.pushAndRemoveUntil(HomeScreen, ...)` clears stack |

---

## Step 2: Home & Browse — PASS

| Check | Result |
|---|---|
| `home_screen.dart` — hero carousel | PASS — `_HeroBanner` with dot indicators and `currentIndex` state |
| `home_screen.dart` — categories | PASS — `_CategorySection` with 5 category chips, each calls `ProductsScreen(category:)` |
| `home_screen.dart` — bottom nav | PASS — 5-item `BottomNavigationBar`: Home, Categories, Wishlist, Orders, Account |
| `products_screen.dart` — product grid | PASS — `GridView.builder` with `childAspectRatio: 0.62`, 2 columns |
| `products_screen.dart` — category filters | PASS — horizontal `ListView` of 6 category chips with selection state, triggers `_loadProducts()` |

---

## Step 3: Product Detail — PASS (after fix)

| Check | Result |
|---|---|
| Image carousel | PASS — `_ImageCarousel` with left/right chevron controls, `_ThumbnailStrip` with 5 slots |
| Color picker | PASS — `Wrap` of circular color swatches with gold border when selected |
| Specs | PASS — `_FrameSpecs` row: Frame Width, Lens Width, Bridge, Temple lengths |
| ADD TO CART button | PASS (after fix) — was sending key `product` instead of `productId`; **fixed** |
| BUY WITH LENS button | PASS — creates `LensWizardState`, pushes `LensTypeScreen` via `ChangeNotifierProvider.value` |

**Fix applied:** `product_detail_screen.dart` `_addToCart()` — changed `'product': p.id` to `'productId': p.id` to match the cart API's expected field name.

---

## Step 4: Lens Wizard — PASS (after fixes)

### lens_type_screen.dart
| Check | Result |
|---|---|
| 5 lens types | PASS — `single_vision`, `progressive`, `zero_power`, `bluecut`, `photochromic` with names, descriptions, prices |
| CONTINUE button | PASS — disabled until selection; navigates to `LensPowerScreen` with wizard state |

### lens_power_screen.dart
| Check | Result |
|---|---|
| SPH/CYL/AXIS for R+L | PASS — `_PowerRow` for R and L, each with three `_DropCell` pickers (bottom sheet modal) |
| PD | PASS — displayed as `62.0 mm` with "Measure PD" link |
| CONTINUE button | PASS — calls `wizard.setPower(re:, le:, pupillaryDistance:)` then pushes `LensQualityScreen` |

### lens_quality_screen.dart
| Check | Result |
|---|---|
| 4 quality tiers | PASS — HMC + Blue Cut (Rs 999, recommended), HMC (Rs 699), Blue Cut (Rs 899), HC (Rs 799) |
| CONTINUE button | PASS — calls `wizard.setLensQuality()` then pushes `LensCheckoutScreen` |

### lens_checkout_screen.dart
| Check | Result |
|---|---|
| Order summary | PASS — shows product line, lens type, power, quality, price breakdown |
| Frame price | FIXED — was hardcoded `1.0`; now reads `wizard.product?.sellingPrice ?? 1.0` |
| Coupon field | FIXED — Apply button was a no-op; wired to `api.validateCoupon()`, updates discount |
| PROCEED TO PAYMENT | FIXED — was only showing a snackbar; now calls `api.addToCart()` with full lens config |

**Fixes applied to `lens_checkout_screen.dart`:**
1. Added `ApiService`/`AuthService` imports.
2. `framePrice` now uses `wizard.product?.sellingPrice ?? 1.0` instead of literal `1.0`.
3. `_discount` changed from `final` to mutable field; added `_applyingCoupon` and `_placingOrder` booleans.
4. New `_applyCoupon()` method: calls `api.validateCoupon(code, orderTotal)`, sets `_discount`, shows result snackbar.
5. New `_proceedToPayment()` method: builds `lensConfig` map (lensType, lensSubType, lensQuality, lensPrice, power R/L, pd), calls `api.addToCart()` with `productId` and `lens` fields matching the cart API contract.
6. Coupon Apply button wired to `_applyCoupon(wizard)` with spinner during load.
7. PROCEED TO PAYMENT button wired to `_proceedToPayment(wizard)` with loading label.

---

## Step 5: Cart & Order APIs — PASS

### `web/src/app/api/cart/route.ts` POST
| Check | Result |
|---|---|
| Accepts `productId` | PASS — destructures `{ productId, color, qty, lens }` from body |
| Accepts `lensConfig` via `lens` field | PASS — `...(lens || {})` spreads lensType, lensSubType, lensQuality, lensPrice, power into cart item |
| Validates product exists | PASS — `Product.findById(productId)` with 404 on miss |
| Deduplication | PASS — checks existing item by productId + color + lensType |

### `web/src/app/api/orders/route.ts` POST
| Check | Result |
|---|---|
| Creates order from cart | PASS — fetches populated cart, maps to `orderItems` |
| Re-validates prices server-side | PASS — recalculates framePrice, lensPrice, fittingCharge server-side; never trusts client totals |
| Coupon validation | PASS — DB lookup, supports percent/flat discount with `maxDiscount` cap |
| Cart cleared after order | PASS — `cart.items = []` then `cart.save()` |
| Order ID format | PASS — `EGO-YYYYMMDD-XXXX` |

---

## Overall Verdict: PASS (4 issues fixed)

| # | File | Issue | Status |
|---|---|---|---|
| 1 | `mobile/lib/screens/products/product_detail_screen.dart` | `_addToCart` sent `'product'` key; cart API expects `'productId'` — cart items would always fail | Fixed |
| 2 | `mobile/lib/screens/lens/lens_checkout_screen.dart` | `framePrice` hardcoded to `1.0` in checkout summary, ignoring actual product price | Fixed |
| 3 | `mobile/lib/screens/lens/lens_checkout_screen.dart` | Coupon Apply button was a no-op (`onTap: () {}`) | Fixed |
| 4 | `mobile/lib/screens/lens/lens_checkout_screen.dart` | PROCEED TO PAYMENT showed only a snackbar; never called the cart or order API | Fixed |

The complete flow — Auth → Home → Products → Product Detail → Lens Wizard (Type → Power → Quality → Checkout) → Cart API → Order API — is correctly wired end to end after the above fixes.
