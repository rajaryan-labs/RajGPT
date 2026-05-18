# RajGPT Server

This is the Node.js Express backend for the RajGPT application. It provides robust API endpoints for authentication, managing chat sessions, and interfacing with Google's native Generative AI models.

## Tech Stack
*   **Framework:** Node.js + Express
*   **Database:** MongoDB via Mongoose
*   **Authentication:** JSON Web Tokens (JWT) & bcryptjs
*   **AI Integration:** `@google/genai` (For Gemini Native Text Generation)
*   **Image Processing:** ImageKit SDK (For Image Uploads & Enhancements)
*   **Utilities:** CORS, dotenv, Axios

## Directory Structure

```text
server/
├── configs/          # API SDK initialization and database connection
│   ├── db.js         # MongoDB connection setup
│   ├── gemini.js     # Google GenAI SDK configuration
│   └── imagekit.js   # ImageKit configuration
├── controllers/      # REST endpoint logic handling and database operations
│   ├── messageController.js # Handles Gemini requests and ImageKit uploads
│   └── ...           
├── middlewares/      # Interceptors for requests (e.g. JWT Auth checks)
├── models/           # Mongoose Data Schemas (User, Chat, etc.)
├── routes/           # Express endpoint router definitions
│   ├── chatRoutes.js
│   ├── messageRoutes.js
│   └── userRoutes.js
├── server.js         # Application Entry Point
└── package.json      # Dependency management
```

## Setup & Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Ensure you have a `.env` file populated using the required keys in the root of the server folder:
   ```env
   PORT=5000
   MONGODB_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret

   # API Keys
   GEMINI_API_KEY=your_google_ai_studio_key 
   
   # ImageKit Context
   IMAGEKIT_PUBLIC_KEY=your_public_key
   IMAGEKIT_PRIVATE_KEY=your_private_key
   IMAGEKIT_URL_ENDPOINT=your_url_endpoint
   ```

3. **Start the Development Server:**
   This command starts the backend with `nodemon` for hot-reloading during development.
   ```bash
   npm run server
   ```

## REST API Endpoints Overview

*   **Users (`/api/user`)** 
    * `/register` - Enroll a new user
    * `/login` - Authenticate users and return JWT payloads 
*   **Chats (`/api/chat`)** 
    * Handlers for listing active user sessions and retrieving specific message histories.
*   **Messages (`/api/message`)** 
    * `/text` - Processes prompts through the `gemini-3-flash-preview` endpoint.
    * `/image` - Relays image generation requests / uploads media securely to ImageKit storage parameters.

## Special Note on Rate Limiting
If you receive a `429 Too Many Requests` or `error.status === 400` on any of the AI messaging endpoints, please check that your connected `GEMINI_API_KEY` project is successfully integrated with Google Cloud billing or aligns with the regional Free Tier policies on Google AI Studio.
