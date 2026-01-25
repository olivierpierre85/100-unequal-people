# Copilot Instructions - 100 Unequal People

## Project Overview
**100 Unequal People** is a Vue 3 + Vite web application that illustrates wealth and income inequality in Belgium using 100 fictional profiles based on real demographic and economic data. The app allows users to explore profiles sorted by wealth or income, with filtering by region and demographic attributes.

## Architecture

### Tech Stack
- **Framework**: Vue 3 (Composition API + `<script setup>`)
- **Router**: Vue Router 4 (lazy-loaded routes)
- **Build Tool**: Vite 7 with PostCSS + Autoprefixer
- **Styling**: Tailwind CSS 3 (dark theme with gradient text, glass-morphism effects)
- **Deployment**: Static site (build output optimized for production)

### Key Files & Structure
- [src/data/profiles.js](src/data/profiles.js) - **Critical**: 100 hardcoded profiles with id, demographics (age/gender/region), and economics (income/wealth/percentiles)
- [src/views/ProfilesView.vue](src/views/ProfilesView.vue) - Main data display: sortable table, regions use color-coded badges (Flanders=yellow, Wallonia=red, Brussels=blue)
- [src/views/LandingPage.vue](src/views/LandingPage.vue) - Hero landing page with call-to-action; uses radial gradients and animated blur elements
- [src/router/index.js](src/router/index.js) - Two routes: `/` (landing), `/profiles` (lazy-loaded)

### Data Flow
```
profiles.js (hardcoded data)
    ↓
ProfilesView.vue (import + display)
    ├→ sortBy reactive ref (wealth/income)
    ├→ sortedProfiles computed (sorts by selected metric)
    └→ formatMoney utility for display
```

## Core Conventions & Patterns

### Profile Data Structure
Every profile follows this schema (see [src/data/profiles.js](src/data/profiles.js)):
```javascript
{
  id: number,
  demographics: { age, gender, region: "Flanders"|"Wallonia"|"Brussels" },
  economics: { netMonthlyIncome, netWealth, incomePercentile, wealthPercentile }
}
```

**Region color mapping** in ProfilesView: Yellow (Flanders), Red (Wallonia), Blue (Brussels) — use `:class` binding with dynamic Tailwind classes.

### Reactive Sorting Pattern
- Use `ref()` for sort state, `computed()` for derived sorted lists
- Destructuring spread operator for immutability: `[...profiles.value].sort(...)`
- Two-axis sorting: wealth (default) and income (both ascending from lowest to highest)

### Styling Approach
- **Dark theme**: `bg-neutral-950` (base), `bg-neutral-900` (cards), `text-white` for contrast
- **Gradients**: `bg-gradient-to-r from-purple-400 to-blue-400` on headers; glass effect uses `backdrop-blur-md` + `bg-white/5`
- **Interactions**: `:hover` states, `transition-colors`, `group` utilities for linked hover effects
- **Responsive**: `md:` breakpoints for text sizing and layout shifts

### Code Style
- No external component library; all components built with Tailwind + Vue directives
- `v-for` with `:key` using stable IDs; `v-if` for conditional renders
- Event handlers: `@click`, `@keydown` with inline arrow functions or computed toggles
- Scoped styles in `<style scoped>` only when CSS-in-JS is insufficient

## Development Workflow

### Commands
```bash
npm run dev      # Start Vite dev server (hot reload on http://localhost:5173)
npm run build    # Production build → dist/ directory
npm run preview  # Preview production build locally
```

### Hot Module Replacement (HMR)
- Vite auto-refreshes on `.vue`, `.js`, and `.css` changes
- Tailwind changes require browser refresh (PostCSS pipeline)

## Integration Points & Future Extensions

### Expected Features (from README)
- **Filtering**: Tags for language, employment status (retired vs. working), ancestry
- **Questionnaire**: User input to match self to closest profile + chart showing hierarchy placement
- **Data Enrichment**: ChatGPT-generated life scenarios (holidays, spending habits, concert access, homeownership)
- **Comparison axes**: Income vs. wealth 2D positioning

### Adding New Data
- Append profiles to [src/data/profiles.js](src/data/profiles.js) (maintain id uniqueness)
- Each profile must have complete `demographics` and `economics` objects
- Update percentile values if dataset grows to maintain 1–100 ranking accuracy

### Adding New Views/Routes
- Create `.vue` file in [src/views/](src/views/)
- Add route object to [src/router/index.js](src/router/index.js)
- Use lazy import: `component: () => import('../views/NewView.vue')`

## Tips for AI Agents

1. **Profile mutations**: Always work with copies when sorting/filtering—avoid mutating the source array
2. **Region logic**: Reference the three hardcoded regions; use Tailwind `:class` binding for color consistency
3. **Percentile fields**: Already exist in data; use for charts, comparisons, or future histogram features
4. **Styling consistency**: Match existing dark/gradient theme; avoid inline styles—use Tailwind classes
5. **Performance**: 100 profiles is lightweight; prioritize readability over optimization; lazy-load routes
