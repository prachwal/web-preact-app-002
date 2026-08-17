# web-preact-app-002

Preact + TypeScript + Vite scaffold.

## Setup

```sh
npm install
```

## Commands

- `npm run dev` — start dev server (HMR)
- `npm run build` — typecheck (`tsc -b`) + production build (`vite build`)
- `npm run preview` — serve production build locally

## Stack

- [Preact](https://preactjs.com/) — UI
- [Vite](https://vite.dev/) — dev server / bundler
- TypeScript

## Structure

- `index.html` → `src/main.tsx` mounts `<App />` into `#app`
- `src/app.tsx` — main component
- `public/` — static assets served as-is (`icons.svg`, favicon)
- `src/assets/` — imported/bundled assets
