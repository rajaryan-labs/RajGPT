# QuickGPT

> **✨ Project Status: Completed**
> All major features including AI Chat, Image Generation, User Authentication, and Stripe Payments have been successfully implemented and deployed!

QuickGPT is a ChatGPT clone built using the MERN stack (MongoDB, Express, React, Node.js).

## Project Structure

- **client/**: Frontend application (React + Vite + Tailwind CSS)
- **server/**: Backend API (Node.js + Express + MongoDB)

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB installed (or use a cloud instance like MongoDB Atlas)

### Installation & Running

#### Server (Backend)

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on the example or add your `MONGO_URI` and `PORT`.
4.  Start the server:
    ```bash
    npm run dev
    ```

#### Client (Frontend)

1.  Navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## Features

- **AI Text Generation:** Powered by Google's native Generative AI SDK (Gemini).
- **AI Image Generation:** Prompts are converted into rich visuals using ImageKit.
- **User Authentication:** Secure JWT-based authentication system.
- **Session Management:** Stores and retrieves past chat sessions.
- **Rich Text Rendering:** Markdown parsing on the frontend.

## Documentation

For specific setup and architecture details, please consult the respective directory documentation:
- [Server Documentation](./server/README.md)
- [Client Documentation](./client/README.md)

## License

MIT
