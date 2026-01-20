# Modern Tech Blog PWA

A responsive, progressive web application built with Vite and Vanilla JavaScript.

## Features

- **PWA**: Installable on Mobile and Desktop.
- **Glassmorphism Design**: Modern UI with dark mode.
- **SPA Routing**: Seamless navigation without page reloads.
- **Comments**: View comments for each post.
- **Admin**: Create new posts (saves to local JSON DB).

## Tech Stack

- **Vite**
- **Vanilla JavaScript** (ES6+)
- **CSS3** (Variables, Flexbox, Grid)
- **JSON Server** (Mock Backend)

## How to Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev:all
   ```
   This command runs both the Vite frontend and the JSON Server backend concurrently.

3. **Open App**:
   Visit the URL shown in the terminal (usually `http://localhost:5173`).

## Project Structure

- `src/main.js`: Core logic, router, and state management.
- `src/style.css`: All application styles.
- `db.json`: Local database for posts and comments.
- `vite.config.js`: PWA configuration.
