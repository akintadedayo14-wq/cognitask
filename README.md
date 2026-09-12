# Cognitask

Cognitask is a full-stack AI assistant built with HTML, CSS, JavaScript, Node.js, Express, and the Google Gemini API.

## Live Demo

https://cognitask-kj52.onrender.com/

## Overview

Cognitask is a web-based AI assistant that allows users to communicate with an AI model through a responsive chat interface.

The application supports regular AI conversations as well as file-based requests, allowing users to attach files and ask the AI assistant to analyze them.

The project combines a browser-based frontend with a Node.js and Express backend that communicates securely with the Google Gemini API.

## Key Features

### AI Assistant

- Send messages to the AI assistant
- Receive AI-generated responses
- Ask general-purpose questions
- Start new conversations
- Continue previous conversations
- Manage recent conversations
- Delete conversations

### File Uploads

- Attach files to conversations
- Send uploaded files to the AI for analysis
- Support file uploads up to 20 MB
- Process files through the backend
- Automatically remove temporary uploaded files after processing

### Conversation Management

- Create new chats
- View recent chats
- Switch between conversations
- Delete conversations
- Maintain conversation history in the frontend

### User Interface

- Responsive AI chat interface
- Chat history sidebar
- New chat controls
- Message composer
- File attachment controls
- Attachment preview
- Loading and error states
- Mobile-friendly layout

## Technology Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- Google Gemini API
- Multer
- dotenv
- Git & GitHub
- Render

## Frontend

The frontend is built with HTML, CSS, and JavaScript.

It provides:

- AI chat interface
- Conversation history
- New chat functionality
- Message input
- File attachment interface
- Attachment preview
- Responsive layout
- Client-side conversation management

## Backend

The backend is built with Node.js and Express.

The Express server handles:

- AI chat requests
- Communication with the Gemini API
- File uploads
- Uploaded file processing
- Request validation
- Error handling
- Temporary file cleanup

The main AI endpoint is:

```text
POST /api/chat
```

The endpoint accepts a message and can also receive an uploaded file.

## AI Integration

Cognitask uses the Google Gemini API to generate AI responses.

The Gemini API is accessed from the Node.js backend rather than directly from the browser.

The Gemini API key is stored as an environment variable:

```text
GEMINI_API_KEY
```

This keeps the API key out of the frontend source code and repository.

## File Handling

File uploads are handled by Multer on the Express backend.

Uploaded files are temporarily stored on the server and sent to the Gemini API for processing.

After the request is completed, the application removes the temporary local file and attempts to remove the corresponding uploaded Gemini file.

The maximum local upload size is:

```text
20 MB
```

## Error Handling

The backend includes handling for common request and upload errors.

For example:

- Empty message and no file
- Files larger than 20 MB
- Upload errors
- Temporary AI service errors
- General server errors

The backend returns user-friendly error messages instead of exposing internal server details.

## Project Structure

```text
cognitask/
├── .gitignore
├── index.html
├── package-lock.json
├── package.json
├── script.js
├── server.js
└── styles.css
```

## Installation

Clone the repository and install the project dependencies:

```bash
git clone https://github.com/akintadedayo14-wq/cognitask.git
cd cognitask
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```text
GEMINI_API_KEY=your_gemini_api_key
```

The `.env` file should not be committed to GitHub.

## Running Locally

Start the application with:

```bash
npm start
```

The server runs on the port provided by the environment or port `3000` by default.

Open the application in a browser at:

```text
http://localhost:3000
```

## Deployment

Cognitask is deployed as a Node.js web service on Render.

The production deployment uses the project's Node.js server and environment variables for the Gemini API configuration.

## Security

Sensitive API credentials are stored using environment variables rather than being placed directly in the source code.

The Gemini API is accessed from the backend so the API key is not exposed to the frontend.

## API

### POST /api/chat

Sends a message to the AI assistant and optionally includes an uploaded file.

The endpoint returns an AI-generated response.

Example response:

```json
{
  "reply": "AI-generated response"
}
```

## What This Project Demonstrates

- Full-stack web application development
- AI API integration
- Google Gemini API integration
- REST API development with Express
- File upload handling
- Temporary file processing
- Frontend and backend integration
- Client-side conversation management
- Error handling
- Environment variable management
- Responsive frontend development
- Git and GitHub workflow
- Production deployment

## Deployment Platform

Cognitask is deployed on Render.

Live application:

https://cognitask-kj52.onrender.com/
