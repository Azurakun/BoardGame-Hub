# 🎲 Digital Boardgame Companion Platform

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Flutter](https://img.shields.io/badge/Flutter-%3E%3D3.2.0-02569B?style=flat-square&logo=flutter&logoColor=white)](https://flutter.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey?style=flat-square&logo=express&logoColor=black)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com/)

A full-stack, cross-platform hub designed to enhance the physical board gaming experience. Browse game details, access interactive companion tools, read game wikis, and explore card databases — all in one place.

The platform includes a **React/Vite Web App** backed by an Express/MongoDB server, alongside a companion **Flutter Mobile App**.

> 🎨 Design Inspiration: [Original Figma Prototype](https://www.figma.com/design/AcjqmGDT8HVRAHGobUYL7z/Digital-Boardgame-Companion-Platform)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎮 **Game Explorer** | Browse game details, rule summaries, and general information |
| 🛠️ **Companion Tools** | Digital utilities for in-play use — dice rollers, score trackers, timers, and more |
| 🎴 **Card Viewer** | Navigate card databases with high-quality visual assets |
| 📚 **Game Wiki** | Read strategies, lore, and detailed mechanics for your favourite games |
| 🔒 **Admin Dashboard** | Secured portal to manage games, cards, and wiki content dynamically |
| 📱 **Cross-Platform** | Available on desktop via React and on mobile via a native Flutter app |

---

## 🧰 Tech Stack

### Web Application & Backend

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v7 |
| Styling & UI | Tailwind CSS, Radix UI, Material UI Icons, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | MongoDB (via Mongoose) |
| Language | TypeScript |

### Mobile Application (`flutter_app`)

| Layer | Technology |
|---|---|
| Framework | Flutter (≥ 3.2.0) |
| Language | Dart |
| State Management | Provider |
| Routing | GoRouter |
| UI Utilities | Google Fonts, Carousel Slider, Staggered Grid View, Lucide Icons |

---

## 📂 Project Structure

```text
├── flutter_app/         # Native mobile app (Flutter/Dart)
├── src/
│   ├── app/             # React frontend — components, pages, contexts
│   │   └── routes.tsx   # Web app routing configuration
│   ├── server/          # Express.js backend & Mongoose models
│   └── styles/          # Global CSS and Tailwind configuration
├── package.json
└── vite.config.ts
```

---

## 🗺️ Web App Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/wiki` | Boardgame Wiki |
| `/cards` | Global Card Viewer |
| `/game/:gameId` | Game Details |
| `/tools` | Interactive Game Tools |
| `/admin/login` | Admin Login |
| `/admin/dashboard` | Admin Content Management |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Flutter SDK v3.2.0+
- MongoDB (local or [Atlas](https://www.mongodb.com/atlas))

---

### Web Platform

**1. Install dependencies**
```bash
npm install
```

**2. Set up environment variables**

Create a `.env` file in the project root:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

**3. Start the frontend dev server**
```bash
npm run dev
```

**4. Start the backend server**
```bash
npm run server
```

**5. Build for production**
```bash
npm run build
```

---

### Flutter Mobile App

**1. Navigate to the Flutter directory**
```bash
cd flutter_app
```

**2. Fetch packages**
```bash
flutter pub get
```

**3. Run on your target platform**
```bash
flutter run
```

---

## 🤝 Acknowledgements

- UI originally prototyped in [Figma](https://figma.com)
- Built with open-source tools: [Radix UI](https://www.radix-ui.com/), [Tailwind CSS](https://tailwindcss.com/), [Flutter](https://flutter.dev/)
