# RajGPT Client

This is the frontend application for RajGPT, a modern ChatGPT clone interface built for speed and responsiveness.

## Tech Stack
*   **Framework:** React 19 via Vite
*   **Styling:** Tailwind CSS v4
*   **Routing:** React Router DOM (v7)
*   **Markdown Rendering:** React Markdown & PrismJS
*   **Date Formatting:** Moment.js

## Directory Structure
*(Typical Vite Structure)*
```text
client/
├── public/           # Static assets
├── src/              # React components, contexts, and assets
│   ├── assets/       
│   ├── components/   # UI components (Chats, Input boxes, etc.)
│   ├── context/      # React Context (Auth, Chat State)
│   ├── App.jsx       # Main application routing
│   └── main.jsx      # Entry point
├── index.html        # Main HTML template
├── package.json      # Dependencies
└── vite.config.js    # Vite configuration
```

## Setup & Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   If your Vite application requires backend connection strings, ensure you define them (e.g., `VITE_API_URL` or similar, depending on your setup) according to where your local `server` is running.

3. **Start the Development Server:**
   This command starts the Vite dev server with hot module replacement (HMR).
   ```bash
   npm run dev
   ```

## Production Build

To bundle the application for production deployment:
```bash
npm run build
```
The output will be placed in the `dist/` directory, ready to be served by any static file host.
