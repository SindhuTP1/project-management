# Project Management App

A full-stack project management tool with workspaces, projects, tasks, comments, team members, and analytics.

**Tech stack:** React, Vite, Tailwind CSS, Redux Toolkit, Node.js, Express, Prisma, PostgreSQL (Neon), Clerk, Vercel

## About
A team learning project, built following an online tutorial. I set it up independently with my own Clerk and Neon accounts and made some fixes (Clerk session handling, task creation errors, and member sync).

## Run locally
1. Create free Clerk (enable Organizations) and Neon accounts.
2. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`, then fill in your values.
3. In `server`: `npm install`, `npx prisma db push`, `npm run server`
4. In `client`: `npm install`, `npm run dev`
5. Open http://localhost:5173

## Live demo
Coming soon.