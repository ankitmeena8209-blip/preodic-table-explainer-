# ⚛️ Periodic Table Explainer - Atomic Labs

An interactive, high-performance web application providing an immersive exploration of all **118 elements** in the Periodic Table. Built with dynamic filtering, real-time search, 3D electron shell visualization, and rich atomic metadata.

![Vercel Deploy](https://img.shields.io/badge/Deploy%20with-Vercel-black?style=for-the-badge&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-r125-black?style=for-the-badge&logo=three.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-blue?style=for-the-badge&logo=tailwindcss)

---

## ✨ Features

- 🧪 **Complete 118-Element Database**: Detailed data for every element including atomic mass, electron configurations, shells, valencies, oxidation states, density, melting/boiling points, discovery history, and real-world applications.
- 🎨 **Interactive 18-Column Layout**: Authentic periodic grid with Lanthanide and Actinide series, color-coded categories, and visual status badges.
- 🌌 **Interactive 3D Atom Model**: Live 3D Canvas powered by Three.js rendering nuclear core and revolving multi-shell electrons for element detail views.
- 🔍 **Instant Search & Category Filtering**: Filter by Alkali Metals, Transition Metals, Metalloids, Noble Gases, Halogens, etc., or search instantly by name, symbol, or atomic number.
- ⚡ **Zero-Build Lightweight Setup**: Pure modern client-side HTML, CSS, and Vanilla JavaScript—blazing fast load times and instant Vercel deployment compatibility.

---

## 🚀 Deploying to Vercel

This repository is pre-configured with `vercel.json` for zero-config Vercel deployment:

1. Import this GitHub repository into your **[Vercel Dashboard](https://vercel.com/new)**.
2. Select **Framework Preset**: `Other` (or static site).
3. Leave Build Command and Output Directory as default.
4. Click **Deploy**!

---

## 🛠️ Local Development

To run locally without a build tool:

```bash
# Option 1: Using npx serve
npx serve .

# Option 2: Using Python simple server
python -m http.server 8000
```

Open `http://localhost:3000` (or `http://localhost:8000`) in your browser.

---

## 📁 Repository Structure

```
├── index.html         # Main SPA entry point
├── js/
│   ├── app.js          # Core app engine, router & 3D Three.js renderer
│   └── elements-data.js# Complete dataset for all 118 elements
├── vercel.json        # Vercel deployment & security headers config
├── package.json       # Node package configuration & local serve scripts
└── README.md          # Documentation
```

---

## 📄 License

Distributed under the MIT License.
