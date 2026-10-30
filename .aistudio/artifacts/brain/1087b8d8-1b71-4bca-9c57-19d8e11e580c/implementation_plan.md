# Implementation Plan - Exclusively Bespoke Guided Perfume Studio

Transform Scentify Perfume Studio into an exclusively bespoke fragrance destination where customers can only craft their own custom perfumes through a single-screen guided studio experience with intelligent harmony checks, visual pyramid balance, and strict 3-ingredient enforcement.

## User Decisions & Clarifications
1. **Rule Enforcement**: Strictly block adding more than 3 ingredients. When a customer has 3 ingredients selected and attempts to select another, prevent addition and display a clear, elegant warning message explaining harmonic balance.
2. **Crafting Experience**: Single studio screen featuring guided recommendations, harmony analysis, note tier guidance (Top, Heart, Base), and olfactory balance indicators.
3. **Storefront & Homepage**: Showcase scent families and ingredient stories with direct calls-to-action guiding customers into the studio; remove all pre-crafted/ready-made perfume purchase flows.

---

## Proposed Changes

### 1. Scentify Guided Studio (`src/components/ScentifyView.tsx`)
- **Strict 3-Ingredient Limit & Warning Notice**:
  - Enforce the 3-ingredient ceiling strictly (no auto-swapping or silently overflowing).
  - When reaching 3 ingredients and attempting to click a 4th, trigger a warning dialog/toast:
    *"Formula Limit Reached: A harmonious bespoke perfume is composed of at most 3 botanical ingredients (Top, Heart, and Base notes). Please deselect an ingredient before adding another."*
  - Add an active ingredient counter chip (e.g., `1/3`, `2/3`, `3/3 - Complete`).
- **Single-Screen Guided Recommendations & Harmony Checks**:
  - **Olfactory Pyramid Guidance**: Visual slots showing Top opening, Heart floral/fruit body, and Base warmth with helpful guidance on which tier is currently missing.
  - **Harmony & Balance Meter**: Dynamic harmony score, longevity projection, and scent profile description updated in real time as notes change.
  - **Guided Pairing Suggestions**: Smart badges highlighting ingredients that naturally harmonize with the current selections based on perfumery rules.
  - **Master Formula Inspirations**: Allow customers to load curated starting formulas (e.g., "Chiang Rai Dawn", "Monsoon Bloom") as guided starting points, which populate the 3 notes and can then be customized.

### 2. Homepage & Storefront Pivot (`src/components/HomeView.tsx` & `src/components/Navbar.tsx`)
- **Navigation Labeling**:
  - Update Navbar link from generic "Collection" to "Ingredient Library" / "Botanicals" to make it immediately obvious that Scentify is a bespoke formulation studio rather than an off-the-shelf perfume store.
- **Hero & Story Sections**:
  - Present featured flacons as bespoke formulation examples/recipes rather than buy-it-now products.
  - Every CTA ("Create your perfume", "Explore Botanicals", "Begin creating") seamlessly directs the customer to the Scentify guided studio.
  - Showcase all 6 botanical families (Citrus, Floral, Woody, Fruity, Fresh, Sweet) as raw ingredient palettes to inspire custom creation.

### 3. Ingredient Library Quick-Add Protection (`src/components/IngredientLibraryView.tsx` & `src/App.tsx`)
- Update "Quick Add to Blend" in the Ingredient Library and Search Modal:
  - If the customer already has 3 ingredients in their composition, prevent addition and display an informative warning message directing them to open the studio to adjust their blend.
  - If under 3 ingredients, assign the note to the appropriate olfactory slot (Citrus/Fresh -> Top, Floral/Fruity/Sweet -> Heart, Woody/Resinous -> Base).

### 4. Cart & Data Integrity (`src/data/perfumeData.ts` & `src/components/CartView.tsx`)
- Remove the pre-crafted "Signature Bottle" from `INITIAL_CART_ITEMS` and `INITIAL_ORDER`.
- Ensure all items in the cart are strictly bespoke custom formulations with customer notes, bottle size, and formula details.
- Add an empty-state CTA in CartView encouraging customers to craft their signature scent if their cart is empty.

---

## Verification Plan

### Automated & Build Validation
- Run `lint_applet` to confirm no TypeScript or ESLint errors.
- Run `compile_applet` to ensure clean Vite production build.

### Manual Verification Steps
1. **Strict 3-Ingredient Limit Test**:
   - In Scentify Studio, select 3 ingredients (e.g., Bergamot, Jasmine, Sandalwood).
   - Click a 4th ingredient (e.g., Rose or Grapefruit).
   - Verify that the selection is strictly blocked and the warning banner/alert appears.
   - Deselect an existing ingredient and verify that selecting another ingredient succeeds.
2. **Guided Recommendations & Harmony Checks Test**:
   - Select 1 ingredient; check that the studio highlights recommended pairings and indicates which tiers (Heart, Base) are needed.
   - Select 2 and 3 ingredients; check that the harmony meter and olfactory profile update smoothly.
3. **Storefront & Navigation Audit**:
   - Check Homepage, Navbar, Ingredient Library, and Search modal.
   - Verify that no pre-crafted ready-made perfume purchase flows exist anywhere in the app.
