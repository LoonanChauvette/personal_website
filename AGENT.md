# Agent Notes - Personal Academic Website

## Project Overview

This is a personal academic website for Loonan Chauvette, PhD candidate in Rehabilitation Sciences at Université Laval. The site serves as an online presence showcasing academic work, CV, and publications.

**Live Site**: TBD (Vercel deployment pending)  
**Repository**: TBD

---

## Tech Stack

### Core Framework
- **Astro v4.16.19** - Static site generator chosen for:
  - Minimal JavaScript output (content-focused)
  - Excellent build performance
  - Native Tailwind integration
  - Perfect for academic/portfolio sites
  - Compatible with Node 20.x

### Styling
- **Tailwind CSS v3.4.19** - Utility-first CSS framework
- **Custom Design System** - Tokens defined in `tailwind.config.mjs` based on `DESIGN.md`
- **Google Fonts** - Noto Serif (headings) + Inter (body text)

### Content Management
- **Typst** - CV compilation from `Assets/cv.typ` to PDF
- Static Astro pages for content (no CMS needed)

### Hosting
- **Vercel** - Optimized for static sites, zero-config deployment

---

## Architecture

### Directory Structure

```
personal_website/
├── src/
│   ├── pages/              # Route pages
│   │   ├── index.astro     # Home page
│   │   ├── cv.astro        # CV page (web version)
│   │   └── publications.astro  # Publications (peer-reviewed only)
│   ├── layouts/
│   │   └── BaseLayout.astro    # Base layout with SEO
│   ├── components/
│   │   ├── Header.astro    # Sticky navigation with backdrop blur
│   │   └── Footer.astro    # Social links footer
│   └── styles/
│       └── global.css      # Tailwind imports + custom utilities
├── public/
│   ├── headshot.jpg        # Profile photo
│   ├── cv.pdf             # Compiled from Typst
│   └── favicon.svg        # Simple "L" monogram
├── Assets/                 # Source files
│   ├── cv.typ             # Typst CV source (single source of truth)
│   └── headshot.jpg       # Original photo
├── astro.config.mjs       # Astro configuration
├── tailwind.config.mjs    # Design system tokens
├── package.json           # Dependencies & scripts
├── DESIGN.md             # Design system documentation
└── AGENT.md              # This file
```

### Key Design Decisions

#### 1. Design Philosophy: "The Digital Monograph"
The entire visual system follows the principles outlined in `DESIGN.md`:
- **Warm paper background** (#fcf9f8) for reduced eye strain
- **High contrast text** (#323233) avoiding pure black
- **Tonal layering** instead of borders/shadows
- **Sharp edges** (0px border radius throughout)
- **Asymmetric gutters** for editorial flow
- **Serif for authority** (Noto Serif for headings)
- **Sans for clarity** (Inter for body text)
- **Blue reserved for interaction** (#115cb9 for links only)

#### 2. Content Strategy
- **Home Page**: Bio, research interests, quick stats, call-to-actions
- **CV Page**: Web-friendly version with download button for PDF
- **Publications Page**: 11 peer-reviewed journal articles only (chronological, reverse)
  - Conference presentations excluded (referenced in note)
  - Author name "Chauvette, L." bolded in citations
  - DOI links when available

#### 3. PDF Generation
- CV maintained as single source: `Assets/cv.typ`
- Build script compiles to `public/cv.pdf` automatically
- Keeps web and PDF versions in sync
- Script: `npm run build:cv` (runs before main build)

#### 4. Responsive Design
- Mobile-first Tailwind classes throughout
- Asymmetric grid collapses gracefully on mobile
- Sticky header with backdrop blur
- All typography scales appropriately

#### 5. SEO & Accessibility
- OpenGraph + Twitter Card meta tags in BaseLayout
- Semantic HTML (proper heading hierarchy)
- Alt texts on images
- ARIA labels on icon-only links
- High contrast ratios meet WCAG AA

---

## Build & Deployment

### Development
```bash
npm run dev
# Runs Astro dev server on http://localhost:4321
```

### Production Build
```bash
npm run build
# 1. Compiles cv.typ → public/cv.pdf
# 2. Builds Astro static site to dist/
```

### Preview
```bash
npm run preview
# Preview production build locally
```

### Deployment to Vercel

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Production Deployment**:
   ```bash
   vercel --prod
   ```

#### Vercel Configuration Notes
- **Framework Preset**: Astro
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: 20.x (set in Vercel dashboard or vercel.json)

**IMPORTANT**: Vercel build environment needs Typst installed. Two options:
1. Use a Vercel build plugin/hook to install Typst
2. Pre-compile the PDF and commit `public/cv.pdf` to git (simpler, recommended for now)

**Current approach**: PDF is pre-compiled and committed. Update CV workflow:
1. Edit `Assets/cv.typ`
2. Run `npm run build:cv`
3. Commit both `.typ` and `.pdf`
4. Deploy

---

## Design System Reference

### Color Palette
- `surface`: #fcf9f8 (warm paper background)
- `surface-container`: #f0eded
- `surface-container-low`: #f6f3f2
- `surface-container-lowest`: #ffffff
- `on-surface`: #323233 (main text)
- `on-surface-variant`: #6b6b6a (secondary text)
- `primary`: #115cb9 (links, CTAs only)
- `primary-container`: #d7e2ff (hover backgrounds)
- `outline-variant`: #b2b2b1 (ghost borders)

### Typography Scale
- **Display**: 3.5rem / 2.75rem / 2.25rem (Noto Serif, page titles)
- **Headline**: 2rem / 1.75rem / 1.5rem (Noto Serif, section headers)
- **Title**: 1.375rem / 1.125rem / 0.875rem (Inter, subsection headers)
- **Body**: 1rem / 0.875rem / 0.75rem (Inter, main content)
- **Label**: 0.875rem / 0.75rem / 0.6875rem (Inter, metadata/caps)

### Spacing
Tailwind default scale used (4px base unit): `spacing-4` = 1rem, `spacing-8` = 2rem, etc.

### Components
- **Buttons**: Ghost border with ink-bleed hover effect
- **Links**: Primary color with underline, ink-bleed on hover
- **Cards**: Tonal layering (no borders/shadows)
- **Navigation**: Sticky header with 12px backdrop blur

---

## Content Update Workflows

### Update CV
1. Edit `Assets/cv.typ` (Typst source file)
2. Run `npm run build:cv` to regenerate PDF
3. Changes automatically reflected on next deploy

### Add Publication
1. Edit `src/pages/publications.astro`
2. Add new entry to `publications` array (reverse chronological)
3. Follow existing citation format
4. Ensure "Chauvette, L." is formatted for bold (handled by `formatAuthors()`)

### Update Bio/Research Interests
1. Edit `src/pages/index.astro`
2. Modify text in respective sections
3. Changes are static - no database required

### Change Photo
1. Replace `Assets/headshot.jpg` and `public/headshot.jpg`
2. Maintain aspect ratio (currently square)

---

## Known Limitations & Future Enhancements

### Current Limitations
1. **Content is hardcoded** - No CMS (intentional for simplicity)
2. **No search/filter** - Publications are simple chronological list
3. **English only** - No i18n support (per requirements)
4. **Typst dependency** - Vercel deployment requires Typst or pre-compiled PDF

### Potential Enhancements
- Add analytics (Vercel Analytics or Google Analytics)
- Implement publication search/filter functionality
- Add blog section for research updates
- Integrate Google Scholar metrics
- Add "Featured Research" section
- Contact form (currently just mailto link)
- RSS feed for publications

---

## Important Files to Keep Synced

1. **CV Source**: `Assets/cv.typ`
   - Single source of truth for CV content
   - Must run build script after changes

2. **Publications**: `src/pages/publications.astro`
   - Update when new papers published
   - Keep in sync with CV

3. **Design System**: `DESIGN.md` + `tailwind.config.mjs`
   - Reference DESIGN.md for visual decisions
   - Tokens defined in Tailwind config

---

## Browser Support

Modern browsers only (ES2020+):
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Graceful degradation for:
- Backdrop blur (fallback to solid background)
- CSS Grid (fallback to single column)

---

## Performance Metrics (Target)

- **Lighthouse Score**: 95+ across all categories
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 50KB JS (Astro minimal JS)
- **Image Optimization**: WebP with fallback

---

## Maintenance Notes

### Regular Updates Needed
- [ ] Publications (as papers are published)
- [ ] CV content (awards, positions, etc.)
- [ ] Headshot (every few years)

### Periodic Reviews
- [ ] Dependency updates (`npm outdated`)
- [ ] Security audits (`npm audit`)
- [ ] Accessibility testing (WAVE, axe DevTools)
- [ ] Cross-browser testing

---

## Contact & Support

**Site Owner**: Loonan Chauvette  
**Email**: loonan.chauvette@cervo.ulaval.ca  
**Built**: March 2026  
**Framework**: Astro v4 + Tailwind CSS  
**Hosting**: Vercel
