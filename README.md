# ExpenseTrack

A full-stack expense tracker where each user has a private account, their own transactions, and their own monthly budget.

**Live demo:** https://expense-tracker-three-bay-14.vercel.app/
**Note:** the backend runs on a free plan, so the first request after a quiet period can take up to a minute to wake up.

![ExpenseTrack dashboard]![(Screenshot.png)]

## Features

- Register and log in with a secure account (passwords are hashed, sessions use JWT)
- Add, edit and delete transactions
- Each user only sees their own data
- Monthly budget with a progress bar and remaining amount
- Income vs. expenses chart for the last 6 months
- Spending-by-category chart
- Filter by type and category, and search by title
- Responsive layout that works on phone and laptop

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Recharts, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas with Mongoose
- **Auth:** JSON Web Tokens, bcryptjs
- **Hosting:** Vercel (frontend), Render (backend)

## Run it locally

1. Clone the repo and install dependencies:
    ```
    npm install
    cd server
    npm install
    ```
2. Create `server/.env` with:
    ```
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret
    ```
3. Start the backend: `cd server`, then `node server.js`
4. Start the frontend from the project root: `npm run dev`

## What I learned

## What I Learned

Building ExpenseTrack taught me how a full-stack app fits together. I connected a React frontend hosted on Vercel to a Node and Express backend hosted on Render, and learned how both talk to a MongoDB Atlas database. I also learned how to protect user data with JWT authentication, so each account only sees its own transactions and budget. Most of all, I got better at debugging: tracing a problem through the browser console, the Network tab and server logs until I found the real cause.

## Author

TellyBobo - https://t.co/Unb0ZMb680
