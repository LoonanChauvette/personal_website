# Personal Academic Website - Loonan Chauvette

A clean, minimalist academic website built with Astro and Tailwind CSS, following "The Digital Monograph" design philosophy.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Typst CLI (for CV compilation)

### Installation

```bash
# Install dependencies
npm install

# Compile CV from Typst source
npm run build:cv

# Start development server
npm run dev
```

Visit `http://localhost:4321` to view the site locally.

## 📦 Build & Deploy

### Production Build

```bash
npm run build
```

This will:
1. Compile the CV from `Assets/cv.typ` to `public/cv.pdf`
2. Build the static site to `dist/`

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

## 🏗️ Project Structure

```
/
├── src/
│   ├── pages/              # Route pages
│   │   ├── index.astro     # Home page
│   │   ├── cv.astro        # CV page
│   │   └── publications.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── Header.astro
│   │   └── Footer.astro
│   └── styles/
│       └── global.css
├── public/                 # Static assets
├── Assets/                 # Source files (CV, images)
└── AGENT.md               # Detailed documentation
```

## 📝 Content Updates

### Update CV
1. Edit `Assets/cv.typ`
2. Run `npm run build:cv`
3. Commit and deploy

### Add Publication
1. Edit `src/pages/publications.astro`
2. Add entry to `publications` array
3. Deploy

### Update Bio
Edit `src/pages/index.astro` directly.

## 🎨 Design System

The site follows a custom design system detailed in `DESIGN.md`:
- Warm paper background (#fcf9f8)
- High-contrast typography
- Tonal layering (no borders)
- Sharp edges (0px border radius)
- Noto Serif + Inter typefaces
- Blue accent for interactive elements only

## 📚 Documentation

See `AGENT.md` for comprehensive documentation including:
- Architecture decisions
- Design philosophy
- Content workflows
- Deployment instructions
- Maintenance guidelines

## 🛠️ Tech Stack

- **Framework**: Astro v4
- **Styling**: Tailwind CSS v3
- **Fonts**: Google Fonts (Noto Serif, Inter)
- **CV Generation**: Typst
- **Hosting**: Vercel

## 📄 License

Personal website - All rights reserved.

## 📧 Contact

Loonan Chauvette  
Email: loonan.chauvette@cervo.ulaval.ca  
GitHub: [github.com/LoonanChauvette](https://github.com/LoonanChauvette)  
LinkedIn: [linkedin.com/in/loonan-chauvette](https://linkedin.com/in/loonan-chauvette)

## Teaching demos

Reusable demos are maintained in the private [teaching-demos repository](https://github.com/LoonanChauvette/teaching-demos), deployed as a separate Vercel project. This website forwards `/demo/…` through the rewrites in `vercel.json`. Edit demos in that repository; do not restore independent copies in `public/demo/`.

Existing paths (`/demo/splatter.html`, `/demo/beating.html`, `/demo/traveling-wave.html`) remain valid. `/demo/` provides the searchable gallery. For a fixed presentation version, use `/demo/releases/v1/<demo-path>`, for example `/demo/releases/v1/splatter.html`. That route points to the immutable initial demo deployment; current `/demo/` paths follow new production releases. Future frozen releases need a separate rewrite before the general `/demo/` rule.
