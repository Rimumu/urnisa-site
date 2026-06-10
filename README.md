# Urnisa Site

A single‑page web experience for **Urnisa**, a Twitch streamer. The site showcases live streams, chat overlays, merchandise, a bingo dashboard, a Minecraft‑based game and more.

## Quick links

- **Live stream**: <https://www.twitch.tv/urnisa_>

## Project structure

```
urnisa-site/
├─ public/                     # Static assets
├─ src/
│  ├─ components/              # UI components
│  ├─ data/                    # Static data files
│  ├─ hooks/                   # Custom hooks
│  ├─ pages/                   # Routes
│  ├─ constants.ts             # API and other constants
│  ├─ App.tsx                  # App entry point
│  └─ index.tsx                # TypeScript entry
├─ vite.config.ts              # Vite configuration
├─ vite-env.d.ts               # Vite env types
├─ tsconfig.json               # TypeScript config
├─ package.json                # Dependencies
└─ README.md                   # Current file
```

## Tech stack

- **React** with **Vite**
- **Tailwind CSS** for styling, with dark‑theme and glass‑morphism design patterns
- **Framer Motion** for smooth UI transitions
- **TypeScript** for type safety