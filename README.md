# Backgammon.kz

Modern online backgammon platform with multiplayer, AI-powered coaching, progression systems, and Kazakh-inspired design.

You can access this website in https://farkhadbackgammon.netlify.app/

---

## About

This project started as a simple backgammon web app, but gradually evolved into a full platform focused on gameplay experience, replayability, and identity.

The goal was not just to recreate classic backgammon in the browser, but to make it feel modern and memorable:

- smooth gameplay,
- real-time multiplayer,
- strategic assistance for beginners,
- progression systems,
- and a recognizable visual style inspired by Kazakhstan.

The platform combines traditional board game mechanics with modern web technologies and social features.

---

## Main Features

### Gameplay

- Full backgammon rules implementation
- Dice rolling system
- Turn-based gameplay
- Legal move validation
- Win detection
- Highlighted available moves
- Local game saving

### Multiplayer

- Real-time online matches
- Play with friends via invite link
- Synced gameplay using WebSockets

### AI Features

- AI Coach after matches
- Strategic recommendations
- Move analysis and beginner tips

### User System

- Authentication
- Match history
- Saved player statistics
- Win/loss tracking

### UI / UX

- Responsive design
- Mobile-friendly layout
- Dark and light themes
- Sound effects
- Smooth animations

### National Identity

- Kazakh-inspired visual style
- Traditional atmosphere and sounds
- Custom themed skins

### Monetization Ideas

- Premium cosmetic skins
- Upgrade to Pro concept
- Tournament system potential

---

## Tech Stack

### Frontend

- React
- Vite
- TailwindCSS

### Backend / Database

- Supabase

### Realtime

- WebSockets

### Authentication

- Supabase Auth

### AI

- OpenRouter API

### Deployment

- Vercel

---

## Why This Project Is Different

Most browser backgammon games focus only on basic gameplay.

This project tries to go further by combining:

- competitive play,
- coaching systems,
- social interaction,
- cultural identity,
- and long-term engagement mechanics.

The idea was to make something that feels closer to a real product than a simple coding assignment.

---

## Future Improvements

Planned features:

- Ranked matchmaking
- Tournament mode
- Advanced AI opponent
- Replay system
- Seasonal events
- Clan/community system
- Mobile application

---

## Installation

Clone the repository:

git clone https://github.com/FarkhadSharif/backgammon-webapp.git

Install dependencies:

npm install

Start development server:

npm run dev

Environment Variables

Create a .env.local file:

VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
OPENROUTER_API_KEY=your_key

Author

Built by Farkhad Sharif
