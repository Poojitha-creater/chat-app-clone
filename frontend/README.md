# Chat App Clone - Full Stack Assignment

This repository contains a full-stack chat application clone built using React (with Tailwind CSS) for the frontend and Node.js with Express for the backend (using mock APIs).

## 🚀 Deliverables

* **Frontend**: React + JavaScript + Tailwind CSS.
* **Backend**: Node.js Express with mock JSON APIs.
* **Code Sharing**: Deployed via GitHub.


## 🛠️ Prerequisites

* Node.js (v20.x or higher is recommended)
* npm (Node Package Manager)

## ⚙️ Local Setup and Run Instructions

You will need two separate terminal windows/tabs to run the Backend and Frontend concurrently.

### 1. Backend Setup and Run

The backend serves the API endpoints on port 3001.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    node server.js
    # You should see: Backend server running at http://localhost:3001
    ```

### 2. Frontend Setup and Run

The frontend is a Vite/React application served on port 5173.

1.  **Open a NEW terminal window/tab.**
2.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    # You should see: Local: http://localhost:5173/
    ```

### 3. View the Application

The application should automatically open or be viewable at: **`http://localhost:5173/`**

---

## 📄 Secondary README for Frontend (`/frontend/README.md`)

Create a file named `README.md` inside your `/frontend` directory:

```markdown
# Frontend (React + Tailwind CSS)

This directory contains the user interface and logic for the chat application.

## Local Development

Ensure the backend server is running first (see main repository README for instructions).

1. Install dependencies: `npm install`
2. Start the development server: `npm run dev`
