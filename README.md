<div align="center">

# 📋 Project Management App

**Plan projects, assign tasks, and keep your whole team in sync, all in one workspace.**

[**🚀 Live Demo**](https://pm-client-two.vercel.app) · [Features](#-features) · [Tech Stack](#-tech-stack) · [Run Locally](#-run-it-locally) · [API](#-api-reference)

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?logo=vercel&logoColor=white)

</div>

---

## ✨ About

A full-stack project management tool in the spirit of Jira and Trello, built for small teams. Create a workspace, invite teammates by email, start projects, break them into tasks, assign work, comment on tasks, and track progress on a dashboard with a calendar and analytics charts.

It started as a team learning project built from an online tutorial. I then set it up independently with my own Clerk and Neon accounts, deployed both the frontend and the backend on Vercel, and fixed several real-world issues: authentication errors, task-creation failures, member sync, and secret handling. The details are in the "What I Added and Fixed" section below.

**Live app:** https://pm-client-two.vercel.app

---

## 🚀 Features

**Workspaces and teams**
- Sign up and log in with Clerk
- Workspaces built on Clerk Organizations, with Admin and Member roles
- Invite teammates to a workspace by email
- A team page that lists everyone in the workspace
- Each project has its own team, chosen from the workspace members

**Projects**
- Create projects with a description, status (Active, Planning, Completed, On Hold, Cancelled), priority, start and end dates, and a team lead
- Project overview with progress, team members, and settings
- Per-project tabs: Tasks, Calendar, Analytics, Settings

**Tasks**
- Create tasks with a title, description, type (Task, Bug, Feature, Improvement, Other), priority, status (To Do, In Progress, Done), assignee, and due date
- Filter tasks by status, type, priority, and assignee
- Comment on tasks to discuss work with the team
- "My Tasks" list in the sidebar and on the dashboard

**Dashboard and insights**
- Stats cards: total projects, completed projects, my tasks, overdue tasks
- Project overview cards with progress bars
- Recent activity panel
- Calendar view of due dates
- Analytics charts (Recharts): tasks by status, type, and priority, plus completion rate, active tasks, overdue tasks, and team size
- Light and dark mode

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, Redux Toolkit, React Router, Axios, Recharts, Lucide icons |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL on Neon, accessed with Prisma ORM |
| Authentication | Clerk (sessions, organizations, invitations) |
| Background jobs and email | Inngest and Nodemailer (optional, see Known Limitations below) |
| Deployment | Vercel (two projects: client and server) |

---

## 🏗️ How It Works

```
 Browser (React + Redux)
        │  Clerk session token in the Authorization header
        ▼
 Express API  ──►  Clerk middleware verifies the token
        │
        ▼
 Prisma ORM  ──►  PostgreSQL (Neon)
```

1. The user signs in through Clerk in the React app.
2. The app sends API requests with the Clerk session token.
3. The Express server verifies the token and finds the user.
4. Controllers check workspace and project membership, then read or write data through Prisma.
5. Each time the app loads your workspaces, a sync step copies the user, their organizations, and every accepted member from Clerk into the database, so invited teammates appear without needing webhooks.

---

## 🗂️ Project Structure

```
project-management/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── pages/              # Dashboard, Projects, ProjectDetails, TaskDetails, Team, Settings
│       ├── components/         # Dialogs, sidebar, charts, calendar, task and project views
│       ├── features/           # Redux slices (workspace, theme)
│       └── configs/api.js      # Axios instance
├── server/                     # Express backend
│   ├── controllers/            # workspace, project, task, comment logic
│   ├── routes/                 # API routes
│   ├── middlewares/            # Auth middleware (Clerk)
│   ├── configs/                # Prisma client, Clerk-to-database sync, mailer
│   ├── inngest/                # Background functions (optional emails)
│   └── prisma/schema.prisma    # Database schema
└── README.md
```

---

## 🗄️ Database Schema

Models: `User`, `Workspace`, `WorkspaceMember`, `Project`, `ProjectMember`, `Task`, `Comment`.

| Enum | Values |
|---|---|
| WorkspaceRole | ADMIN, MEMBER |
| ProjectStatus | ACTIVE, PLANNING, COMPLETED, ON_HOLD, CANCELLED |
| TaskStatus | TODO, IN_PROGRESS, DONE |
| TaskType | TASK, BUG, FEATURE, IMPROVEMENT, OTHER |
| Priority | LOW, MEDIUM, HIGH |

Relationships: a workspace has many members and projects; a project has many members and tasks; a task belongs to a project, has one assignee, and has many comments.

---

## 🔌 API Reference

All routes require a valid Clerk session token.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/workspaces` | Get the user's workspaces with projects, tasks, and members |
| POST | `/api/projects` | Create a project |
| PUT | `/api/projects` | Update a project |
| POST | `/api/projects/:projectId/addMember` | Add a workspace member to a project |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| POST | `/api/tasks/delete` | Delete tasks |
| POST | `/api/comments` | Add a comment to a task |
| GET | `/api/comments/:taskId` | Get the comments of a task |

---

## 💻 Run It Locally

**Prerequisites:** Node.js 18 or newer, and free accounts on [Clerk](https://clerk.com) and [Neon](https://neon.tech).

**1. Set up the services**
- In Clerk, create an application and turn on **Organizations**. Copy the publishable key and the secret key.
- In Neon, create a project and copy the connection string.

**2. Configure environment variables**

Copy the example files and fill in your own values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env`
```
NODE_ENV=development
PORT=5000
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
DIRECT_URL=
```

`client/.env`
```
VITE_CLERK_PUBLISHABLE_KEY=
VITE_BASEURL=http://localhost:5000
```

**3. Start the backend**
```bash
cd server
npm install
npx prisma db push
npm run server
```
The API runs on http://localhost:5000.

**4. Start the frontend** (in a second terminal)
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173, sign up, and create an organization when prompted.

---

## ☁️ Deployment (Vercel)

The app is deployed as two Vercel projects from the same repository.

**Server**
- Root directory: `server`
- Environment variables: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `DATABASE_URL`, `DIRECT_URL`

**Client**
- Root directory: `client` (Vite preset)
- Environment variables: `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_BASEURL` (the deployed server URL, without a trailing slash)

Every push to `main` redeploys both projects automatically.

---

## What I Added and Fixed

- **Authentication:** Fixed 401 errors caused by Clerk "pending" sessions by updating session handling in the auth middleware and every controller.
- **Reliable task creation:** Task creation no longer fails when the email service is unavailable; the email step is isolated from the core operation.
- **Member sync:** Built a Clerk-to-database sync (Node.js and Prisma upserts) that imports the user, organizations, and accepted members with their roles, so invitations work without webhooks.
- **Security:** Removed hardcoded database credentials, moved all secrets to environment variables, and added `.env.example` files.
- **Dependency patch:** Upgraded Inngest to a patched version after Vercel blocked deployment over a vulnerability.
- **Deployment:** Set up and deployed the client and server independently on Vercel with Neon and Clerk.

---

## Known Limitations

- "Task assigned" and due-date emails need Inngest and Brevo (SMTP) keys, so they are off by default.
- The app uses Clerk development keys, which have usage limits.
- The free Neon database sleeps when idle, so the first request after a long pause can be slow.
- Only a project's team lead can edit its tasks.

---

## 🗺️ Planned Improvements

- Kanban board with drag and drop
- Let assignees update the status of their own tasks
- Invite people to a single project by email
- Input validation, tests, and a CI pipeline
- Paginated API responses for large workspaces

---

## 🙌 Credits

Built as a team learning project following an online tutorial. The deployment, bug fixes, member sync, and security cleanup described above were done afterwards on my own setup.
