# Backgammon Web App

React + Vite single page app scaffold for a backgammon board UI.

## Scripts

```bash
npm install
npm run dev
```

## Supabase

Create `.env.local` from `.env.example` and use your Supabase project URL plus a
public anon/publishable key. Do not use a service role key or `sb_secret_*` key
in this browser app.

Run `supabase/schema.sql` in the Supabase SQL editor to create the `profiles`
table, row level security policies, and the auth trigger that stores profiles.

## Structure

```text
src/
  components/
    board/
      BackgammonBoard.jsx
      Bar.jsx
      BoardQuadrant.jsx
      BorneOffArea.jsx
      Point.jsx
    layout/
      GameHeader.jsx
  styles/
    index.css
  App.jsx
  main.jsx
```

The current implementation is intentionally static. Game rules, moves, dice,
turns, and checker state are left for the next phase.
