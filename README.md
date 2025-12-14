# sweet_Management
# Sweet Shop Management System

<div align="center">

![Sweet Management](https://img.shields.io/badge/Sweet%20Management-Fullstack%20App-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-FastAPI-blue?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=000)
![Vite](https://img.shields.io/badge/Vite-Dev%20Server-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/Security-JWT%20Auth-ff69b4?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

A professionally structured, beginner-friendly full-stack application demonstrating **Role-Based Access Control (RBAC)**, **JWT Authentication**, and **Test-Driven Development (TDD)** principles.

[Quick Start](#quick-start) • [Features](#features) • [Architecture](#architecture) • [API Docs](#api-documentation) • [AI Usage](#ai-usage)

</div>

---

## Table of Contents

1.  [Project Overview](#project-overview)
2.  [Key Features](#key-features)
3.  [Technical Architecture](#technical-architecture)
4.  [Role-Based Access Control (RBAC) Flow](#role-based-access-control-rbac-flow)
5.  [Quick Start](#quick-start)
6.  [Environment Variables](#environment-variables)
7.  [API Documentation](#api-documentation)
8.  [Troubleshooting](#troubleshooting)
9.  [Development Practices (TDD & Quality)](#development-practices-tdd--quality)
10. [AI Usage](#ai-usage)
11. [Screenshots](#screenshots)
12. [Test Report](#test-report)

---

## 1. Project Overview

The Sweet Shop Management System is a complete **full-stack application** built to manage the sales and inventory of a sweet shop. This project provides a robust demonstration of modern application development, focusing on security and maintainability.

### Core Goals:

* **Role-Based Access Control (RBAC):** Implementing security logic to distinguish between a standard `user` (shopper) and an elevated `admin` (manager).
* **JWT Authentication:** Using JSON Web Tokens to establish secure, stateless sessions for users.
* **Maintainable Code:** Adhering strictly to **Test-Driven Development (TDD)** for high reliability.

### Technology Stack:Screenshots

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Backend** | Python / FastAPI | Handles data, authentication, and security checks. |
| **Frontend** | React / Vite | The user interface (UI) and interaction logic. |
| **Database**| SQLite (Default) / PostgreSQL | Stores users, roles, and sweet inventory data. |

---


Dashboard Page

<img width="948" height="474" alt="image" src="https://github.com/user-attachments/assets/b68b61cc-f3c0-4b78-accc-d0b3825e74ee" />

Filter option

<img width="960" height="476" alt="image" src="https://github.com/user-attachments/assets/575089fb-7e3c-4b45-b8b6-edf541f2f039" />

Cart section

<img width="959" height="469" alt="image" src="https://github.com/user-attachments/assets/70f6ffd4-884a-4dde-8305-66ff088dcf40" />

Admin Login page

<img width="960" height="475" alt="image" src="https://github.com/user-attachments/assets/823b5bf4-792c-43ce-944e-9ae9d557384d" />

Admin Signup page

<img width="960" height="475" alt="image" src="https://github.com/user-attachments/assets/0bcc2d92-721f-44d7-9f0b-6630fb38d1f7" />

Admin Dashboard (CRUD)

<img width="949" height="475" alt="image" src="https://github.com/user-attachments/assets/35295dc0-3c22-4e05-a52c-005705b98055" />


## 2. Key Features

### Authentication & Security

| Feature | Description | Access |
| :--- | :--- | :--- |
| **Login/Signup** | Users can register new accounts and log in to receive a secure JWT token. | Public |
| **JWT Protection** | All administrative and inventory actions are secured by a required JWT token. | Protected |
| **Role Restriction** | Sensitive API endpoints (`DELETE`, `restock`) are only accessible by users with the `admin` role. | Admin Only |

### Sweet Shop Functionality

| Feature | Description | Access |
| :--- | :--- | :--- |
| **Inventory CRUD** | Full ability to **C**reate, **R**ead, **U**pdate, and **D**elete sweet items. | Protected / Admin Only |
| **Admin Restock** | Endpoint to increase the stock quantity of any sweet item. | **Admin Only** |
| **User Purchase** | Endpoint to simulate a purchase, atomically decreasing the stock quantity. | Protected |
| **Shop UI** | User dashboard with search, filters, and conditional purchase buttons (disabled if out of stock). | User View |

---

## 3. Technical Architecture

### Project Structure
```text
Sweet_Management/
  backend/
    main.py
    auth.py
    sweet_controller.py
    database.py
  frontend/
    .env
    package.json
    src/
      App.jsx
      main.jsx
      pages/
        AuthPage.jsx
        AdminDashboard.jsx
```

### High-Level Data Flow

The application follows a standard client-server pattern. 

1.  **Frontend (Client):** Sends requests with the JWT token in the Authorization header.
2.  **Backend (FastAPI):** An authentication middleware validates the JWT token.
3.  **Authorization:** A separate authorization layer checks the user's role before allowing access to the intended business logic (e.g., restocking or deleting).
4.  **Database:** The business logic interacts with the database layer to manage inventory data.

---

## 4. Role-Based Access Control (RBAC) Flow

RBAC is a critical security feature implemented across both tiers:

### Backend Role Check (Security Enforcement)

The backend is the security gate. For sensitive actions (like `DELETE` or `POST /restock`), the API strictly verifies the user's role extracted from the JWT. If the role is not `admin`, the request is rejected with a **HTTP 403 Forbidden** error.

### Frontend Routing (User Experience)

The frontend uses the user's role to manage navigation and UI components:

| Role | Initial Redirect | UI Access |
| :--- | :--- | :--- |
| `admin` | `/admin` | Can see and use the Admin Dashboard for management. |
| `user` | `/shop` | Can only see the Sweet Shop UI for browsing and purchasing. |

---

## 5. Quick Start

### Prerequisites

Please install the following tools:

* **Python 3.10+** (Backend language)
* **Node.js 18+** (Required for the React/Vite frontend)

### Step 1: Start the Backend (API Server)

1.  Open your terminal and navigate to the `backend/` directory.
2.  Run the FastAPI server:

    ```bash
    # This command starts the API on port 8001
    python -m uvicorn main:app --host 127.0.0.1 --port 8001
    ```

### Step 2: Start the Frontend (Web UI)

1.  Open a **second** terminal and navigate to the `frontend/` directory.
2.  Install dependencies and start the development server:

    ```bash
    npm install
    npm run dev
    ```

### Success!

Open your browser to the Frontend URL: `http://localhost:5173/#auth`

---

## 6. Environment Variables

### Frontend

File: `frontend/.env`

This variable defines the base URL for API calls.

```env
VITE_API_BASE_URL=http://127.0.0.1:8001
```

Note:

- If you change the backend port, you must update this value and restart the frontend (`npm run dev`).

### Backend (Database Configuration)

By default, the backend uses SQLite (file-based database):

- `backend/sweet_shop.db`

To use PostgreSQL (recommended for production), set `DATABASE_URL` before starting the backend.

Example (PowerShell):

```powershell
$env:DATABASE_URL = "postgresql+psycopg2://user:password@localhost:5432/sweet_shop"
```

If `DATABASE_URL` is not set or the database connection fails, the backend falls back to SQLite.

---

## 7. API Documentation

FastAPI automatically generates interactive API documentation (Swagger UI).

- Documentation URL: `http://127.0.0.1:8001/docs`

### Main endpoints summary

| Method | Endpoint | Access level | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create a new user account. |
| POST | `/api/auth/login` | Public | Login and receive a JWT token and role. |
| GET | `/api/sweets/` | Protected | View all sweets. |
| GET | `/api/sweets/search` | Protected | Search sweets by filters. |
| POST | `/api/sweets/` | Admin only | Add a new sweet. |
| PUT | `/api/sweets/{id}` | Admin only | Update a sweet. |
| DELETE | `/api/sweets/{id}` | Admin only | Delete a sweet. |
| POST | `/api/sweets/{id}/purchase` | Protected | Purchase (decreases stock). |
| POST | `/api/sweets/{id}/restock` | Admin only | Restock (increases stock). |

---

## 8. Troubleshooting

### Request timed out on login/signup

Checklist:

1. Is the backend running on port 8001?
2. Can you open the Swagger docs URL (`/docs`) in your browser?
3. Does `frontend/.env` have the correct `VITE_API_BASE_URL`?
4. Did you restart the frontend after editing `.env`?

### Port 8001 already in use

Start the backend on another port, for example 8002:

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8002
```

Update `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8002
```

Restart the frontend.

## 9. Development Practices (TDD and Quality)

- Test-driven approach: write a failing test, implement minimal code, refactor.
- Quality checks: linting and formatting.
- Security checks: verify admin-only endpoints return 403 for normal users.

---

## 10. AI Usage

Transparency: All assisted commits include a Co-authored-by windsurf.

Tools & Application:

Google Gemini AI: Used for brainstorming comprehensive TDD test case ideas (e.g., inventory conditions).

Windsurf: Used to analyze network traffic and confirm JWT token placement in the Authorization header during API connection setup.

Manual Verification :

Security Rules: Manually verified the backend correctly returns HTTP 403 when a non-admin user attempts a restricted action.

API Behavior: Confirmed that the purchase endpoint decreases stock correctly and that the restock endpoint only accepts positive integers.

---

