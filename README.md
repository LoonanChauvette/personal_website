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
