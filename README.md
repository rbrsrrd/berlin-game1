# CODE BERLINZ

A real-time, 2v2, Codenames-style word game with shareable room links.
Modern loading screen → main menu (English) → gear icon for language → create/join room → 4-seat lobby → live synced game across any device (phone, tablet, computer).

## How the game works (matches the original Codenames rules)
- 25 words on a 5×5 board. One team starts with 9 words, the other with 8, plus 7 neutral words and 1 assassin.
- Exactly 4 players per room: Red Spymaster, Red Operative, Blue Spymaster, Blue Operative.
- The Spymaster sees the full color key at all times and can only send **one word + one number** as a clue.
- The Operative on the active team clicks words to guess. Correct guesses let them keep guessing (up to number+1 total); a neutral or opposing word ends the turn; the assassin ends the game instantly.
- First team to reveal all of its words wins.

## Run it locally
```bash
npm install
npm start
```
Then open `http://localhost:3000` in a browser.

## Deploy on your own server
This is a plain Node.js app (Express + Socket.io) — deploy it anywhere that runs Node (a VPS, Render, Railway, Fly.io, a Docker container, etc.):

1. Copy this whole folder to your server.
2. `npm install`
3. Set the `PORT` environment variable if your host requires a specific port (defaults to 3000).
4. `npm start` (or run it under `pm2`/`systemd` so it stays alive).
5. Put it behind HTTPS (e.g. Nginx + Let's Encrypt, or your host's built-in SSL) — this makes clipboard "copy link" and mobile browsers behave best.

Room links look like: `https://yourdomain.com/room/AB3XZ` — anyone who opens that link lands straight in the lobby to grab a free seat.

**Note:** rooms are stored in memory. If the server restarts, active rooms are lost — that's normal for a lightweight party-game server and keeps things simple and fast.

## Adding more words
Open `words.js`. `AR_WORDS` and `EN_WORDS` are plain arrays of strings — add as many as you like (paste in a list of thousands if you want a huge pool; duplicates are fine, they'll just shuffle in). The board always draws 25 random words from whichever language the room's spymaster set in the lobby.

## Adding more languages (UI translation)
Open `public/i18n.js`:
1. Add a new entry to the `LANGUAGES` array, e.g. `{ code: 'it', label: 'Italiano', dir: 'ltr' }`.
2. Copy an existing language block inside `I18N` (e.g. the `en` block) and translate every value.
That's it — it will automatically appear in the gear-icon language menu.

## Project structure
```
server.js        Express + Socket.io backend: rooms, seating, turn logic, win conditions
words.js          Word banks (Arabic + English)
public/index.html Screens: loading, menu, lobby, game, settings
public/style.css  Espionage-themed responsive UI (mobile/tablet/desktop)
public/app.js     Client logic: i18n, screens, realtime rendering
public/i18n.js    Translation dictionaries
```
