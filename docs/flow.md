# EyeGlaze — Complete App Flow Document

> **Platform:** Mobile (iOS/Android)
> **Theme:** Dark (black background, gold/amber accent)
> **Tagline:** "See the World Clearer. Sharper. You. — Premium Eyewear for Every Version of You."
> **Last Updated:** 2026-06-16

---

## Table of Contents

1. [Auth Flow](#1-auth-flow)
2. [Home Flow](#2-home-flow)
3. [Product Listing & Detail Flow](#3-product-listing--detail-flow)
4. [Buy With Lens — 4-Step Wizard](#4-buy-with-lens--4-step-wizard)
5. [Add to Cart Flow](#5-add-to-cart-flow)
6. [Checkout Flow](#6-checkout-flow)
7. [Admin Flow](#7-admin-flow)

---

## 1. Auth Flow

### Screen 1.1 — Welcome / Login Gate

**Screen Name:** `WelcomeScreen`

**What the user sees:**
- EyeGlaze logo (gold, serif) at top center
- Heading: "Welcome to EyeGlaze"
- Subheading: "Login / Sign up to continue"
- Two primary option cards:
  - "Continue with Mobile Number" — icon: mobile phone, subtitle: "Login or sign up with OTP"
  - "Continue with Email" — icon: envelope, subtitle: "Login or sign up with OTP"
- Divider: "or"
- Trust badge strip (4 icons): 100% Secure Payment | 1 Year Warranty | Easy Returns | Fast Delivery
- Footer text: "By continuing, you agree to our **Terms of Use** and **Privacy Policy**" (both links highlighted in gold)
- Back arrow (top-left), Close/X (top-right)

**Actions available:**
| Action | Destination |
|--------|-------------|
| Tap "Continue with Mobile Number" | Screen 1.2 — Mobile Number Entry |
| Tap "Continue with Email" | Screen 1.4 — Email Entry |
| Tap "Terms of Use" | Terms of Use webview |
| Tap "Privacy Policy" | Privacy Policy webview |
| Tap Back (←) | Previous screen (guest browsing) |
| Tap X | Dismiss auth modal, return to browsing |

---

### Screen 1.2 — Mobile Number Entry

**Screen Name:** `MobileNumberScreen`

**What the user sees:**
- EyeGlaze logo at top center
- Back arrow (top-left)
- Heading: "Enter Mobile Number"
- Subheading: "We will send you an OTP to verify"
- Country code selector: "+91" with dropdown chevron
- Input field: "Enter mobile number" (placeholder)
- CTA button: "SEND OTP" (full-width, gold/amber fill)
- Divider: "or"
- Link: "Continue with Email" (gold text)
- Trust badge strip: 100% Secure Payment | 1 Year Warranty | Easy Returns | Fast Delivery
- Native numeric keypad rendered below (digits 0–9, backspace)

**Data collected:**
- Country dial code (default: +91 India)
- 10-digit mobile number

**Actions available:**
| Action | Destination |
|--------|-------------|
| Select country code dropdown | Country picker list |
| Type mobile number (via keypad) | Fills input field |
| Tap "SEND OTP" (valid number) | Screen 1.3 — OTP Verification (Mobile) |
| Tap "SEND OTP" (invalid/empty) | Inline validation error |
| Tap "Continue with Email" | Screen 1.4 — Email Entry |
| Tap Back (←) | Screen 1.1 — Welcome |

**What happens next:**
An SMS OTP is dispatched to the entered number. The user is taken to the OTP verification screen.

---

### Screen 1.3 — OTP Verification (Mobile)

**Screen Name:** `MobileOTPScreen`

**What the user sees:**
- Heading: "Enter OTP"
- Subheading: "Sent to +91 XXXXXXXXXX"
- 4 or 6-digit OTP input boxes (segmented)
- Countdown timer: "Resend OTP in 0:30"
- "Resend OTP" link (active after timer expires)
- "VERIFY" CTA button (full-width, gold fill)

**Data collected:**
- OTP code (4 or 6 digits)

**Actions available:**
| Action | Destination |
|--------|-------------|
| Enter correct OTP + tap "VERIFY" | Home Screen (new user) or Home Screen (returning user) |
| Enter incorrect OTP | Inline error: "Incorrect OTP. X attempts remaining." |
| Tap "Resend OTP" (after timer) | New OTP sent; timer resets |
| Tap Back (←) | Screen 1.2 — Mobile Number Entry |

**What happens next:**
On successful OTP verification, user is either registered (first-time) or logged in (returning). Redirected to Home Screen.

---

### Screen 1.4 — Email Entry

**Screen Name:** `EmailEntryScreen`

**What the user sees:**
- Heading: "Enter Email Address"
- Subheading: "We will send you an OTP to verify"
- Email input field
- "SEND OTP" CTA button (gold fill)
- Divider "or"
- "Continue with Mobile Number" link

**Data collected:**
- Email address

**Actions available:**
| Action | Destination |
|--------|-------------|
| Enter email + tap "SEND OTP" | Screen 1.5 — OTP Verification (Email) |
| Tap "Continue with Mobile Number" | Screen 1.2 — Mobile Number Entry |
| Tap Back (←) | Screen 1.1 — Welcome |

---

### Screen 1.5 — OTP Verification (Email)

**Screen Name:** `EmailOTPScreen`

**What the user sees:**
- Heading: "Enter OTP"
- Subheading: "Sent to user@example.com"
- OTP input boxes
- Resend timer + resend link
- "VERIFY" CTA button

**Actions available:**
| Action | Destination |
|--------|-------------|
| Enter correct OTP + "VERIFY" | Home Screen |
| Resend OTP | New email OTP dispatched |
| Tap Back (←) | Screen 1.4 — Email Entry |

---

### Auth Data Summary

| Field | Source | Stored |
|-------|--------|--------|
| Mobile number | Screen 1.2 | Yes — user profile |
| Country code | Screen 1.2 | Yes — user profile |
| Email address | Screen 1.4 | Yes — user profile |
| Auth token / session | OTP verification | Yes — local storage / secure store |
| Terms & Privacy acceptance | Implicit on continue | Yes — timestamp recorded |

---

## 2. Home Flow

### Screen 2.1 — Home Screen

**Screen Name:** `HomeScreen`

**Header (top bar):**
- Hamburger menu icon (top-left) — opens drawer nav
- EyeGlaze logo (center)
- Search icon (magnifier) — opens search
- Notification bell with badge (count: 3)
- Cart icon with badge (count: 3)

**Section A — Hero Banner (Carousel)**
- Full-width image card with model wearing glasses
- Label: "SEE THE WORLD"
- Headline: "CLEARER. SHARPER. YOU."
- Sub-copy: "Premium Eyewear for Every Version of You."
- CTA: "SHOP NOW →" (outlined gold button)
- Carousel dots (4 slides, first active)

**Section B — Trust Strip**
- 4 icon+label badges in a horizontal row:
  - 100% Authentic
  - Premium Quality
  - 7 Days Return
  - Free Shipping

**Section C — Shop by Category**
- Section header: "Shop by Category" + "View All ›" link
- Horizontal scrolling circular icon tiles (5 visible):
  1. Prescription Glasses
  2. Sunglasses
  3. Blue Light Glasses
  4. Contact Lenses
  5. Kids Eyewear

**Section D — Promotional Banners (2-column grid)**
- Banner 1: "UP TO 50% OFF — On Selected Sunglasses" + "SHOP NOW" button
- Banner 2: "NEW ARRIVALS — Just In! Explore the latest trends in eyewear." + "EXPLORE" button

**Section E — Quick Action Dock (horizontal icon strip)**
5 quick-action icons in a row:
1. Try On Virtual
2. Find Your Perfect Fit
3. Ask EyeGlaze AI Assistant (center, highlighted/elevated — primary action)
4. Upload Prescription
5. Track Order

**Bottom Navigation Bar (persistent):**
| Tab | Icon | Label |
|-----|------|-------|
| 1 | Home | Home |
| 2 | Grid | Categories |
| 3 | Heart | Wishlist |
| 4 | Bag | Orders |
| 5 | Person | Account |

**Actions available:**
| Action | Destination |
|--------|-------------|
| Tap hamburger menu | Slide-out drawer navigation |
| Tap search icon | Search screen |
| Tap notification bell | Notifications list |
| Tap cart icon | Cart screen |
| Swipe hero banner | Next/prev banner slide |
| Tap "SHOP NOW" (hero) | Product listing (all/featured) |
| Tap any category tile | Product listing filtered by category |
| Tap "View All" (categories) | Full categories screen |
| Tap "SHOP NOW" (promo 1) | Product listing — Sunglasses on sale |
| Tap "EXPLORE" (promo 2) | Product listing — New Arrivals |
| Tap "Try On Virtual" | AR virtual try-on screen |
| Tap "Find Your Perfect Fit" | Frame fit guide / quiz |
| Tap "Ask EyeGlaze AI Assistant" | AI chat assistant |
| Tap "Upload Prescription" | Prescription upload screen |
| Tap "Track Order" | Order tracking screen |
| Tap Home tab | Home Screen (current) |
| Tap Categories tab | Categories screen |
| Tap Wishlist tab | Wishlist screen |
| Tap Orders tab | Orders list screen |
| Tap Account tab | Account / profile screen |

---

## 3. Product Listing & Detail Flow

### Screen 3.1 — Product Listing / Category Page

**Screen Name:** `ProductListingScreen`

**What the user sees:**
- Filtered product grid (2-column or single-column)
- Each product card shows:
  - Product image (main photo)
  - "BESTSELLER" badge (if applicable)
  - Product name and frame type
  - Price with strikethrough MRP and discount %
  - Rating stars
  - "Add +" quick-add button (top-right of card)
- Filter / sort controls at top

**Actions available:**
| Action | Destination |
|--------|-------------|
| Tap product card | Screen 3.2 — Product Detail |
| Tap "Add +" button | Add to cart (quick add, no lens) |
| Apply filters | Filtered list refreshes |
| Sort | Sorted list refreshes |

---

### Screen 3.2 — Product Detail (Full View)

**Screen Name:** `ProductDetailScreen`

*Observed for two products: EG-2041 Matte Square Frame and EG-1067 Premium Clubmaster Frame.*

**Header:**
- Back arrow (←), hamburger menu (≡)
- EyeGlaze logo (center)
- Search, Wishlist (heart), Cart (with badge count) — top right

**Hero Image Gallery:**
- Full-width swipeable photo carousel
- "BESTSELLER" badge (top-left, if applicable)
- "360° VIEW" button (top-right) — triggers 3D/360 model viewer
- Navigation arrows (< >) on sides
- Dot indicators at bottom
- Thumbnail strip below carousel (5 thumbnails, last one is a model wearing the frame)

**Product Info Block:**
- Product code + Product name (e.g., "EG-2041 | Matte Square Frame")
- Star rating (e.g., ★★★★½ 4.7) + review count (198 reviews) + social proof ("400+ bought this week")
- Share icon | Wishlist (heart) icon

**Pricing Block:**
- "Frame Starting" label
- Price: ₹1 (promotional / starting price, strikethrough ₹999) + "50% OFF" badge
- Delivery info: Fast Delivery 2-4 Days | Just ₹99 Delivery Charge

**Color Selector:**
- Label: "Select Color: [Active Color Name]" (e.g., "Matte Black", "Black Gold")
- Color swatch circles (5 visible + "+3" overflow for more colors)
- Active swatch has checkmark

**Frame Measurements (4-icon spec strip):**
| Spec | Value (EG-2041) | Value (EG-1067) |
|------|-----------------|-----------------|
| Frame Width | 140 mm | 138 mm |
| Lens Width | 54 mm | 52 mm |
| Bridge Width | 18 mm | 18 mm |
| Temple Length | 145 mm | 145 mm |

**Frame Details Card:**
- Shield icon + "Frame Details" heading
- "VIEW DETAILS" link (expands full spec sheet)
- Frame Type: Square / Clubmaster
- Material: TR90 Premium (plastic) / Premium Metal
- Feature tags: Lightweight | Flexible | Skin Friendly | Durable | Corrosion Resistant (varies by model)
- Compatibility line: "Compatible with Prescription Lenses • Blue Cut • Zero Power • Progressive"

**Add Prescription Lenses Row (compact view):**
- Prescription lens icon + "Add Prescription Lenses — Starting from ₹499"
- "SELECT LENS" button — opens Buy With Lens wizard

**Sticky Bottom CTA Bar:**
- Left: Price display (₹1 / ₹999, 50% OFF)
- Center: "ADD TO CART" button (outlined)
- Right: "BUY WITH LENS" button (gold fill, primary CTA)

**Trust Strip (below CTAs):**
- 100% Authentic | Just ₹99 Delivery Charge | Fast Delivery 2-4 Days | 24/7 Support

**AI Help Banner:**
- "Need Help? Chat with our AI Assistant" + "CHAT NOW" button

**Note banner (compact listing view):** "Note: Lenses will be added after selecting power and type"

**Actions available:**
| Action | Destination |
|--------|-------------|
| Swipe image carousel | Next/prev product photo |
| Tap "360° VIEW" | 3D model viewer |
| Tap Share | Share sheet (native OS) |
| Tap Wishlist heart | Toggle wishlist; heart fills if added |
| Tap color swatch | Updates hero image + color label + specs |
| Tap "+3" overflow | Shows all available colors |
| Tap "VIEW DETAILS" (frame) | Expanded frame spec sheet |
| Tap "SELECT LENS" | Screen 4.1 — Buy With Lens Step 1 |
| Tap "ADD TO CART" | Frame added to cart (no lens); confirmation toast |
| Tap "BUY WITH LENS" | Screen 4.1 — Buy With Lens Step 1 |
| Tap "CHAT NOW" | AI assistant chat screen |
| Tap Search icon | Search screen |
| Tap Cart icon | Cart screen |
| Tap Back (←) | Product Listing Screen |

**Data output (to cart / wizard):**
- Product ID (e.g., EG-2041)
- Product name
- Selected color
- Frame price (₹1 promotional)
- Frame size specs

---

## 4. Buy With Lens — 4-Step Wizard

The wizard is triggered by tapping "BUY WITH LENS" or "SELECT LENS" on the Product Detail screen. It is a full-screen modal flow with a persistent 4-step progress bar at the top.

**Progress bar steps:** LENS TYPE → POWER → QUALITY → CHECKOUT

The selected frame is shown at the top of each step as a mini product card (image + name + color + size + "Change Frame" button).

---

### Step 1 — Choose Lens Type

**Screen Name:** `LensTypeScreen`

**What the user sees:**
- Step indicator: Step 1 of 4 (LENS TYPE active, orange dot)
- Mini frame card: product image | EG-2041 | Matte Square Frame | Matte Black | Size: 54-18-145 | Lens: Not Selected | [Change Frame] button
- Section header: "CHOOSE LENS TYPE — All lenses come with 100% UV Protection"
- List of lens type options (radio-select cards), each with icon, name, description, and starting price:

| # | Lens Type | Description | Starting Price |
|---|-----------|-------------|----------------|
| 1 | Single Vision | Best for distance or near vision with a single power | From ₹699 |
| 2 | Progressive | Clear vision at all distances (near, intermediate & far) without visible lines | From ₹2,499 |
| 3 | Zero Power (Plano) | For style only without any power | From ₹699 |
| 4 | Blue Cut | Protects eyes from harmful blue light | From ₹899 |
| 5 | Photochromic | Automatically adjusts to light. Darkens in sun, clear indoors | From ₹1,499 |

- Trust strip at bottom: 100% UV Protection | 1 Year Warranty | Scratch Resistant | Easy Returns
- CTA: "CONTINUE TO POWER →" (full-width, gold fill)
- Footer note: "All lenses are from Lenskart — Trusted quality, perfect clarity" (Lenskart logo)

**Data collected:**
- Selected lens type

**Actions available:**
| Action | Destination |
|--------|-------------|
| Tap any lens type card | Selects it (radio), updates CTA |
| Tap "Change Frame" | Frame selection / product listing |
| Tap "CONTINUE TO POWER" | Step 2 — Enter Power |
| Tap Back (←) | Product Detail Screen |

---

### Step 1B — Progressive Lens Sub-Selection (when Progressive is chosen)

**Screen Name:** `ProgressiveLensScreen`

*This sub-screen appears after choosing "Progressive" in Step 1, before the Power entry step.*

**What the user sees:**
- Step indicator: Step 2 of 4 (POWER active — but shown here as sub-step within lens flow)
- Mini frame card (same as Step 1)
- Section header: "PROGRESSIVE LENSES — One lens for all distances – near, intermediate and far. Learn more ⓘ"
- Sub-section: "CHOOSE YOUR PROGRESSIVE LENS"
- 4 progressive lens tier cards, each with lens image, name, badge, description, features, and price:

| Tier | Name | Badge | Key Features | Price |
|------|------|-------|--------------|-------|
| 1 | HC Progressive | BESTSELLER | Wide & clear vision with enhanced comfort and less distortion | ₹2,499/pair |
| 2 | Premium Progressive | — | High clarity with advanced lens design for better visual balance | ₹3,499/pair |
| 3 | Advanced Progressive | — | Smooth transitions with improved intermediate & near vision | ₹4,499/pair |
| 4 | Elite Progressive | — | Best-in-class clarity with personalized comfort for all-day use | ₹5,499/pair |

Feature icons per tier (examples):
- HC Progressive: Wide Vision | Distortion | Easy Adaptation | UV Protection
- Premium Progressive: Clear Vision | Better Sharpness | Reduces Glare | UV Protection
- Advanced Progressive: Smooth Transition | Wider Zones | Low Distortion | UV Protection
- Elite Progressive: Personalized Vision | Maximum Clarity | Fast Adaptation | UV Protection

- Explainer graphic at bottom: "How Progressive Lenses Work" — diagram showing Far / Intermediate / Near zones
- "Selected Lens" sticky footer: shows chosen tier + price + "Change" link
- CTA: "CONTINUE TO ADD-ONS →"

**Actions available:**
| Action | Destination |
|--------|-------------|
| Tap "Learn more" | Expandable info or modal about progressive lenses |
| Tap any tier card | Selects it (highlighted border), updates footer |
| Tap "Change" in footer | Returns to tier selection |
| Tap "CONTINUE TO ADD-ONS" | Step 2 — Power Entry |

---

### Step 2 — Enter Your Power

**Screen Name:** `PowerEntryScreen`

**What the user sees:**
- Step indicator: Step 2 of 4 (POWER active)
- Mini frame card with "Edit" link next to Lens Type
- Section header: "ENTER YOUR POWER — All fields are required"
- Two input tabs: **Enter Prescription** | **Enter Manually** (tab switcher)
- Power entry table for "Single Vision" (or whichever lens type selected):

| Eye | SPH (Sphere) | CYL (Cylinder) | AXIS |
|-----|-------------|----------------|------|
| R (Right) | -1.25 | -0.50 | 180 |
| L (Left) | -1.75 | -0.75 | 170 |

Each cell is a stepper / dropdown picker (tappable, shows numeric value).

- PD (Pupillary Distance) field:
  - Label: "PD (Pupillary Distance) ⓘ"
  - Value input: 62.0 mm
  - "Measure PD" link/button (gold, right-aligned) — opens PD measurement tool

- Upload option: "Don't have prescription? Upload Prescription" (camera/cloud icon, link)
- CTA: "CONTINUE TO QUALITY →" (full-width, gold fill)

**Data collected:**

| Field | Range / Format |
|-------|---------------|
| SPH Right | Numeric (e.g., -1.25, stepped by 0.25) |
| CYL Right | Numeric (e.g., -0.50, stepped by 0.25) |
| AXIS Right | Integer 0–180 |
| SPH Left | Numeric |
| CYL Left | Numeric |
| AXIS Left | Integer 0–180 |
| PD (Pupillary Distance) | Numeric in mm (e.g., 62.0) |

**Actions available:**
| Action | Destination |
|--------|-------------|
| Tap "Enter Prescription" tab | (active) — manual numeric entry |
| Tap "Enter Manually" tab | Same manual entry form |
| Tap any power field | Opens picker/stepper wheel |
| Tap "Measure PD" | PD measurement tool (camera-based AR or guide) |
| Tap "Upload Prescription" | Camera / file picker to upload prescription image |
| Tap "CONTINUE TO QUALITY" (valid data) | Step 3 — Lens Quality |
| Tap "CONTINUE TO QUALITY" (missing fields) | Validation error shown |
| Tap Back (←) | Step 1 — Lens Type |

---

### Step 3 — Select Lens Quality

**Screen Name:** `LensQualityScreen`

**What the user sees:**
- Step indicator: Step 3 of 4 (QUALITY active)
- Mini frame card
- Section header: "Select Lens Quality — Choose the quality and features for your lenses"
- "Recommended" badge on the top option
- 4 lens quality option cards (radio select), each with icon, name, description, feature badges, and price:

| # | Name | Description | Key Features | Price |
|---|------|-------------|--------------|-------|
| 1 | HMC + Blue Cut | Clear & comfortable vision with essential protection | Anti-Reflective (HMC Coating) | Blue Light Protection | Water & Dust Repellant | ₹999/pair |
| 2 | HMC | Anti-reflective coating for clear & comfortable vision | Anti-Reflective (HMC Coating) | Scratch Resistant | ₹699/pair |
| 3 | Blue Cut | Filters harmful blue light from digital screens | Blue Light Protection | ₹899/pair |
| 4 | HC (Hard Coated) | Scratch resistant coating for durable lenses | Scratch Resistant | ₹799/pair |

- Footer note: "All lenses include 100% UV Protection"
- CTA: "CONTINUE TO CHECKOUT →" (full-width, gold fill)

**Data collected:**
- Selected lens quality tier

**Actions available:**
| Action | Destination |
|--------|-------------|
| Tap any quality card | Selects it (radio, gold border), updates total |
| Tap "CONTINUE TO CHECKOUT" | Step 4 — Checkout / Order Summary |
| Tap Back (←) | Step 2 — Power Entry |

---

### Step 4 — Checkout / Order Summary

**Screen Name:** `CheckoutSummaryScreen`

**What the user sees:**
- Step indicator: Step 4 of 4 (CHECKOUT active, all prior steps checked)
- Heading: "Checkout — Review your order details"
- Mini frame card (same persistent card)
- "Edit" link (top-right of order summary card)

**ORDER SUMMARY block:**
| Line Item | Value |
|-----------|-------|
| Product name | EG-2041 Matte Square Frame |
| Color | Matte Black |
| Size | 54-18-145 |
| Qty | 1 |
| Lens Type | Single Vision |
| Power | R: -1.25/-0.50/180, L: -1.75/-0.75/170, PD: 62.0 mm |
| Lens Quality | HMC + Blue Cut |
| Frame Price | ₹1 |
| Lenses (HMC + Blue Cut) | ₹999 |
| Fitting ⓘ | ₹199 |
| Delivery Charge | ₹99 |
| **Subtotal** | **₹1,298** |

**Coupon / Promo Code:**
- "Apply Coupon" section with text input + "Apply" button

**EyeGlaze Membership Upsell Banner:**
- Gold crown icon + "EYEGLAZE MEMBERSHIP"
- "Join & get exclusive benefits: Free delivery, extended warranty & more!"
- Price: ₹99/year
- "Join Now" CTA button

**Total:**
- "Total Amount: ₹1,298"
- Savings line: "You will save ₹201 on this order"

**Trust strip:** 100% Secure Payment | 1 Year Warranty | Free Delivery | Easy Returns | Fast Delivery

**CTA:** "PROCEED TO PAYMENT →" (full-width, gold fill)

**Data output to payment gateway:**
- Order ID
- Frame details (product, color, size, qty)
- Lens details (type, power, quality)
- Pricing breakdown
- Applied coupon code (if any)
- Total payable amount

**Actions available:**
| Action | Destination |
|--------|-------------|
| Tap "Edit" | Returns to relevant step to modify |
| Enter coupon code + tap "Apply" | Validates coupon, updates pricing |
| Tap "Join Now" (membership) | Membership signup/purchase flow |
| Tap "PROCEED TO PAYMENT" | Payment gateway (UPI / Card / Netbanking / Wallet) |
| Tap Back (←) | Step 3 — Lens Quality |

---

## 5. Add to Cart Flow

### Trigger Points
- "ADD TO CART" button on Product Detail screen (frame only, no lens)
- "Add +" quick-add button on Product Listing card
- Completing Buy With Lens wizard and choosing to save for later rather than pay immediately

### Screen 5.1 — Add to Cart Confirmation

**What the user sees:**
- Toast / bottom sheet confirmation: "Added to Cart!"
- Item thumbnail, name, color, price
- Two CTAs: "VIEW CART" | "CONTINUE SHOPPING"

**Data added to cart:**
| Field | Value |
|-------|-------|
| Product ID | e.g., EG-2041 |
| Product name | Matte Square Frame |
| Color | Selected color |
| Frame price | ₹1 |
| Lens type | (if Buy With Lens path) |
| Lens power | (if entered) |
| Lens quality | (if selected) |
| Lens price | (if applicable) |
| Fitting charge | ₹199 (if lenses added) |
| Delivery charge | ₹99 |
| Qty | 1 |

### Screen 5.2 — Cart Screen

**Screen Name:** `CartScreen` (accessible via cart icon, badge shows item count)

**What the user sees:**
- List of cart items, each showing:
  - Product image thumbnail
  - Product name, color, size
  - Lens details (if applicable)
  - Quantity stepper (+/-)
  - Remove item (trash icon)
  - Per-item price
- Price summary at bottom:
  - Items subtotal
  - Lens charges
  - Delivery charge
  - Discount / coupon savings
  - **Total**
- "PROCEED TO CHECKOUT" CTA (gold fill)

**Actions available:**
| Action | Destination |
|--------|-------------|
| Adjust quantity | Cart recalculates |
| Remove item | Item removed, total updates |
| Tap "PROCEED TO CHECKOUT" | Checkout / address + payment flow |
| Tap Back | Previous screen |

---

## 6. Checkout Flow

### Screen 6.1 — Delivery Address

**Screen Name:** `DeliveryAddressScreen`

**What the user sees:**
- Saved addresses (if returning user)
- "Add New Address" option
- Address form fields:
  - Full name
  - Mobile number
  - Pincode
  - Address line 1 (house/flat/building)
  - Address line 2 (street/area/landmark)
  - City
  - State (auto-filled from pincode)
- Address type: Home | Work | Other
- "Save and Continue" CTA

**Data collected:**
- Delivery address (all fields above)
- Address type label

**Actions available:**
| Action | Destination |
|--------|-------------|
| Select saved address | Proceeds with that address |
| Fill new address + Save | Saves to profile, proceeds |
| Tap Back | Cart Screen |

---

### Screen 6.2 — Payment Screen

**Screen Name:** `PaymentScreen`

**What the user sees:**
- Order summary recap (collapsed)
- Payment method options:
  - UPI (Google Pay, PhonePe, Paytm, etc.)
  - Credit / Debit Card
  - Net Banking
  - Wallets
  - Cash on Delivery (if eligible)
- Coupon / gift card entry (if not already applied)
- Final total with savings highlighted
- "PAY NOW ₹X,XXX" CTA (gold fill)
- Trust badge: "100% Secure Payment"

**Data collected:**
- Payment method
- UPI ID or card details (handled by payment gateway, not stored by app)

**Actions available:**
| Action | Destination |
|--------|-------------|
| Select UPI | UPI app / QR flow |
| Select Card | Card entry form |
| Select Net Banking | Bank selector |
| Tap "PAY NOW" | Payment gateway processing |
| Tap Back | Delivery Address Screen |

---

### Screen 6.3 — Order Confirmation

**Screen Name:** `OrderConfirmationScreen`

**What the user sees:**
- Success animation / checkmark icon
- "Order Placed Successfully!"
- Order ID
- Estimated delivery date (e.g., "Delivered by [date]")
- Order summary (frame + lens details)
- "TRACK ORDER" CTA
- "CONTINUE SHOPPING" CTA

**Data output:**
- Order ID
- Tracking number (once dispatched)
- ETA

**Actions available:**
| Action | Destination |
|--------|-------------|
| Tap "TRACK ORDER" | Order tracking screen |
| Tap "CONTINUE SHOPPING" | Home Screen |

---

## 7. Admin Flow

*No admin screens were provided in the design images. The following flows are inferred from standard e-commerce admin patterns appropriate for an eyewear platform of this type.*

### Screen 7.1 — Admin Login

**Screen Name:** `AdminLoginScreen`

**What the admin sees:**
- Separate admin portal (web dashboard, not mobile app)
- Email + Password login form
- 2FA (OTP or authenticator app)

**Access roles:**
- Super Admin — full access
- Store Manager — products, orders, inventory
- Support Agent — orders, customer queries only

---

### Screen 7.2 — Admin Dashboard

**Screen Name:** `AdminDashboard`

**What the admin sees:**
- Key metrics cards:
  - Total Orders (today / this week / this month)
  - Revenue
  - Pending Orders
  - Low Stock Alerts
  - New Customers
- Recent orders table (quick view)
- Quick action shortcuts: Add Product | Process Orders | View Returns

---

### Screen 7.3 — Product Management

**Screen Name:** `AdminProductsScreen`

**What the admin sees:**
- Product list with search + filter (by category, frame type, price, stock status)
- Each row: Product ID | Name | Category | Price | Stock | Status | Actions

**Actions available:**
| Action | Effect |
|--------|--------|
| Add New Product | Product creation form |
| Edit Product | Edit form (same as create) |
| Toggle Active/Inactive | Hides product from storefront |
| Delete Product | Soft delete (archived) |
| Bulk import via CSV | Batch product upload |

**Product creation / edit form fields:**
- Product ID (auto-generated, e.g., EG-XXXX)
- Product name
- Frame type (Square, Round, Clubmaster, Aviator, Wayfarer, etc.)
- Material (TR90, Metal, Acetate, etc.)
- Available colors (color name + hex + swatch image)
- Frame dimensions: Frame Width, Lens Width, Bridge Width, Temple Length
- Lens compatibility: Prescription | Blue Cut | Zero Power | Progressive
- MRP
- Selling price
- Discount %
- Stock quantity per color variant
- Product images (main + gallery, minimum 4 + 1 model photo)
- 360° view asset upload
- BESTSELLER badge toggle
- Meta: SEO title, description
- Category tags
- Feature tags (Lightweight, Flexible, Skin Friendly, Durable, etc.)

---

### Screen 7.4 — Order Management

**Screen Name:** `AdminOrdersScreen`

**What the admin sees:**
- Order list with filters: All | Pending | Processing | Dispatched | Delivered | Cancelled | Returned
- Each row: Order ID | Customer | Product | Lens Config | Amount | Date | Status | Actions

**Order detail view shows:**
- Customer info (name, contact, delivery address)
- Frame ordered (product, color, size)
- Lens details (type, power: SPH/CYL/AXIS for R+L, PD, quality tier)
- Prescription image (if uploaded by customer)
- Payment method + transaction ID
- Order status timeline
- Tracking number + courier partner

**Actions available:**
| Action | Effect |
|--------|--------|
| Update order status | Moves order through pipeline |
| Assign tracking number | Updates customer-facing tracking |
| Process refund | Initiates refund to original payment method |
| Download invoice | Generates PDF invoice |
| Add internal note | Ops notes (not visible to customer) |
| Mark as flagged | Flags for review |

---

### Screen 7.5 — Inventory Management

**Screen Name:** `AdminInventoryScreen`

**What the admin sees:**
- Stock levels per product per color variant
- Low stock alerts (configurable threshold, e.g., < 10 units)
- Out of stock items highlighted in red
- Restock request form

**Actions available:**
| Action | Effect |
|--------|--------|
| Update stock count | Adjusts available inventory |
| Set low-stock alert threshold | Triggers admin notifications |
| Mark as out of stock | Removes "Add to Cart" on storefront |
| Bulk stock update via CSV | Batch inventory update |

---

### Screen 7.6 — Coupon & Promotions Management

**Screen Name:** `AdminPromotionsScreen`

**What the admin sees:**
- List of active / expired coupons
- Coupon creation form:
  - Code (e.g., SAVE20)
  - Discount type: % off or flat ₹ off
  - Discount value
  - Min order value
  - Max discount cap
  - Valid from / to dates
  - Usage limit (per user, total)
  - Applicable to: all products / specific categories / specific SKUs

---

### Screen 7.7 — Customer Management

**Screen Name:** `AdminCustomersScreen`

**What the admin sees:**
- Customer list: Name | Email | Mobile | Orders | Total Spend | Membership | Joined
- Customer detail: profile info, order history, saved prescriptions, wishlist, addresses
- Ability to issue manual refunds or credits

---

### Screen 7.8 — Lens & Prescription Management

**Screen Name:** `AdminPrescriptionsScreen`

*Specific to eyewear — not found in generic e-commerce.*

**What the admin sees:**
- All orders with uploaded prescription images
- Prescription verification status (Pending | Verified | Rejected)
- Optician review queue: view prescription image, verify SPH/CYL/AXIS/PD values match customer entry

**Actions available:**
| Action | Effect |
|--------|--------|
| Verify prescription | Marks order ready for lens cutting |
| Reject prescription | Notifies customer to re-upload |
| Override power values | Corrects OCR/manual entry errors |

---

### Screen 7.9 — Analytics & Reports

**Screen Name:** `AdminAnalyticsScreen`

**Key reports:**
- Revenue by date range / category / product
- Top-selling frames
- Top-selling lens types
- Conversion funnel (product view → lens wizard → checkout → payment)
- Cart abandonment rate (especially wizard drop-off by step)
- Customer retention / repeat order rate
- Membership revenue

---

## Global UI Patterns

### Color Palette
| Element | Color |
|---------|-------|
| Background | #0D0D0D (near black) |
| Primary accent | #D4922A (gold/amber) |
| CTA buttons (primary) | #D4922A fill, white text |
| CTA buttons (secondary) | Transparent, gold border, white text |
| Text (primary) | #FFFFFF |
| Text (secondary) | #999999 (grey) |
| Card backgrounds | #1A1A1A (dark grey) |
| Error | #FF4444 (red) |
| Success | #4CAF50 (green) |

### Typography
- Logo / brand: Serif, gold
- Headings: Bold, white
- Body: Regular, white / light grey
- Prices: Bold, white
- Discounts / savings: Gold / amber
- Links: Gold / amber underline

### Trust Signals (recurring)
- 100% Authentic / Secure Payment
- 1 Year Warranty
- Easy Returns / 7 Days Return
- Fast Delivery / Free Shipping
- 24/7 Support

### Lens Partner
- All lenses sourced from **Lenskart** (displayed in wizard footer: "All lenses are from Lenskart — Trusted quality, perfect clarity")

---

*End of EyeGlaze Flow Document*
