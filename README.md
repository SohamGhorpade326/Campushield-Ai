CampusShield AI 🛡️
An intelligent, anonymous reporting platform designed to enhance campus safety through technology. Built for the modern student, powered by AI for proactive administration.

Live Demo: https://campushield-ai.vercel.app/

Credentials for Judging 🧑‍⚖️
To review the administrator features, please use the following credentials to log in to the Admin Portal:

Email: sohamghorpade912@gmail.com

Password: 123456

A placeholder for a screenshot of your amazing app!

🚀 The Problem
Students often hesitate to report critical campus issues like harassment, safety hazards, or maintenance problems. This hesitation stems from fear of reprisal, social stigma, or the belief that their concerns won't be taken seriously. The result is a gap in communication where administrators are unaware of the real problems affecting student well-being.

✨ Our Solution: CampusShield AI
CampusShield AI bridges this gap by providing a secure, 100% anonymous channel for students to voice their concerns. It's more than just a reporting form; it's an intelligent platform that uses an AI simulation to provide administrators with immediate, actionable insights, enabling them to build a safer and more responsive campus environment.

🌟 Core Features
Anonymous Reporting: Students can submit reports with detailed descriptions without revealing their identity. A unique, secret ID is provided for tracking.

Multimedia & Geolocation Evidence: Users can upload photographic evidence (as Base64 strings) and tag their precise location.

🤖 AI-Powered Triage (Local Simulation): Every report is instantly analyzed by a smart simulation to generate:

Urgency Score (High, Medium, Low)

Sentiment Analysis

Suggested Category

Transparent Status Tracking: Students can use their unique ID to check the status of their report (Submitted, In Review, Action Taken, Resolved).

Comprehensive Admin Dashboard: A secure, password-protected portal for campus authorities to view, manage, and update all submitted reports.

📊 Analytics Dashboard: Administrators can view key metrics and gain insights from visualized data, including charts for reports by category and status.

📍 Community Safety Heatmap: A live, interactive map for students showing generalized locations of recent non-sensitive reports, promoting community awareness.

🚨 Emergency Alert System: Reports marked as "Emergency" with "High" AI-urgency trigger an immediate, high-priority alert on the admin dashboard for instant action.

🛠️ Technology Stack
Frontend: React.js, Tailwind CSS

Backend & Database: Google Firebase (Firestore, Authentication)

AI: Local Keyword-Based Simulation (Hackathon Mode)

Maps: Leaflet.js

Charts: Chart.js

Deployment: Vercel

⚙️ Setup and Deployment
To get a local copy up and running or deploy your own version, follow these steps.

Local Setup
Clone the repository:

git clone https://github.com/YourUsername/campushield-ai.git
cd campushield-ai

Install NPM packages:

npm install

Create src/firebaseConfig.js file:

In the src/ folder, create a new file named firebaseConfig.js.

This file is listed in .gitignore and will not be pushed to GitHub.

Add your Firebase project configuration to this file:

// src/firebaseConfig.js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  // ...and the rest of your keys
};

Run the application:

npm start

Vercel Deployment
Push to GitHub: Ensure your .gitignore file contains src/firebaseConfig.js and push your code.

Import Project on Vercel: Import your GitHub repository into a new Vercel project. The default Create React App settings are correct.

Add Environment Variables: In the Vercel project settings, go to "Environment Variables" and add all your Firebase config keys. Crucially, they must be prefixed with REACT_APP_.

REACT_APP_API_KEY = your-api-key-value

REACT_APP_AUTH_DOMAIN = your-auth-domain-value

(and so on for all keys)

Deploy: Vercel will automatically build and deploy the project when you push new commits to your main branch.

