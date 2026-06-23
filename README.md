# 🚀 Crowdfunding Platform

A full-stack crowdfunding web application where users can create campaigns, back projects they believe in, and admins can moderate the platform — built as a JS project.

---

## 📌 Project Overview

The Crowdfunding Platform allows users to:
- Browse and search approved crowdfunding campaigns
- Register and log in with a personal account
- Create their own campaigns with images, goals, and deadlines
- Pledge money to campaigns they support
- Track their own campaigns and pledges from a personal dashboard

Admins can:
- Approve or reject submitted campaigns
- Ban or unban users
- View all pledges and platform activity

---

## ✨ Features

### 👤 User Features
- **Register & Login** — secure client-side authentication with session stored in localStorage
- **Browse Campaigns** — view all approved campaigns with search by title and filter by category
- **Campaign Details** — view full campaign info, progress bar, backer list, and days remaining
- **Pledge** — contribute any amount to a campaign with a confirmation step
- **Create Campaign** — submit a new campaign with title, description, category, goal, deadline, and image
- **Dashboard** — manage your own campaigns (edit/delete) and view your pledge history

### 🛡️ Admin Features
- **User Management** — view all users, ban or unban accounts
- **Campaign Moderation** — approve or reject pending campaigns
- **Pledge Overview** — view all pledges across the platform

### 🔐 Auth & Authorization
- Role-based access control (`user` / `admin`)
- Protected routes redirect unauthenticated users to login
- Banned users are blocked from accessing the platform
- Admin dashboard is restricted to admin role only

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (ES6 Modules) |
| Backend | json-server (mock REST API) |
| Database | db.json (file-based JSON database) |
| Authentication | Custom client-side session via localStorage |
| Package Manager | npm |
| Runtime | Node.js |

---

## 📁 Folder Structure

```
Fundify - Crowdfunding Platform/public/
├── HTML Pages
│   ├── index.html
│   ├── login.html
│   ├── signup.html
│   ├── campign.html
│   ├── create-campign.html
│   ├── my-campign.html
│   ├── my-pledges.html
│   └── AdminDashboard.html
│
├── Assets/
│   └── images/
│
├── CSS/
│   ├── style.css
│   ├── login.css
│   ├── signup.css
│   ├── campign.css
│   ├── create-campign.css
│   ├── my-campign.css
│   ├── my-pledges.css
│   └── AdminDashboard.css
│
└── Scripts/
    ├── app.js
    ├── shared.js
    ├── login.js
    ├── signup.js
    ├── campign.js
    ├── create-campign.js
    ├── my-campign.js
    ├── my-pledges.js
    └── AdminDashboard.js
---

## ⚙️ How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine
- npm (comes with Node.js)

### Steps

**1. Clone the repository**
```bash
git clone https://github.com/imanwael39/Crowdfunding-Platform-.git
cd Crowdfunding-Platform-
```

**2. Install dependencies**
```bash
npm install
```

**3. Increase JSON Server payload limit** *(required for image upload as Base64)*

This step is necessary to prevent errors when creating campaigns with images. Open this file:

```
node_modules/milliparsec/dist/index.js
```

Find this line:

```js
const defaultPayloadLimit
```

And increase its value to 10MB:

```js
const defaultPayloadLimit = 10485760; // 10MB
```

Save the file before starting the server.

**4. Start the backend server**
```bash
npm start
```

This starts json-server on `http://localhost:3000` and watches `db.json` for changes.

**5. Open the frontend**

Open `index.html` in your browser directly, or use a live server extension in VS Code.

### Default Admin Account
To access the admin dashboard, log in with an account that has `"role": "admin"` in `db.json`.

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | Get all users |
| POST | `/users` | Register a new user |
| PATCH | `/users/:id` | Update user (ban/unban) |
| GET | `/campaigns` | Get all campaigns |
| POST | `/campaigns` | Create a new campaign |
| PATCH | `/campaigns/:id` | Update campaign (edit/approve/reject) |
| DELETE | `/campaigns/:id` | Delete a campaign |
| GET | `/pledges` | Get all pledges |
| POST | `/pledges` | Create a new pledge |

---

## 👨‍💻 Author

| Name | Role |
|---|---|
| Haseeb Mohamed | Developer — JS Project |

---

## 📝 Notes

- This project uses **json-server** as a mock backend for development and demo purposes. In a production environment, it would be replaced with a proper backend (e.g. Node.js/Express with a real database like PostgreSQL or MongoDB).
- Authentication is client-side only using localStorage — not suitable for production without a proper server-side auth system.
- All data resets if `db.json` is replaced or the server is redeployed from scratch.

---

*Built with ❤️ as a JS project — ITI*
