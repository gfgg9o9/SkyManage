<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# SkyManage - Project Management Platform

A modern project management platform with AI integration, real-time collaboration, and advanced analytics.

## Project Structure

This is a monorepo with separated frontend and backend:

```
skymanage/
├── frontend/          # React frontend application
│   ├── src/         # Frontend source code
│   ├── package.json  # Frontend dependencies
│   └── vite.config.ts # Frontend build configuration
├── backend/           # Express.js backend API
│   ├── server.ts     # Backend server
│   └── package.json  # Backend dependencies
└── package.json      # Root package.json for running both services
```

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Firebase** for authentication and real-time database
- **Motion** for animations
- **i18next** for internationalization

### Backend
- **Express.js** with TypeScript
- **MongoDB Atlas** for data persistence
- **AWS S3** for file storage
- **Resend** for email services
- **Google Generative AI** for AI features

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in root directory
   - Configure all required environment variables

### Development

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Individual Services

Frontend only:
```bash
npm run dev:frontend
```

Backend only:
```bash
npm run dev:backend
```

### Production Build

```bash
npm run build
```

## Environment Variables

Required environment variables (create `.env` file):

```
# MongoDB
MONGODB_URI=your_mongodb_atlas_connection_string

# AWS S3
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key

# Google AI
GEMINI_API_KEY=your_gemini_api_key

# Frontend URL
VITE_APP_URL=https://your-domain.com
```

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/health` - Health check
- `GET /api/db-status` - Database status check
- `POST /api/invite` - Send project invitations
- `POST /api/upload-url` - Generate S3 upload URLs
- `POST /api/notify` - Send notifications

## Development Notes

- Frontend runs on port 5173 (Vite default)
- Backend runs on port 3001
- Frontend proxies `/api/*` requests to backend
- Firebase configuration is in `frontend/firebase-applet-config.json`




















1. Mock vs Real Data Confusion:

Problem: NotificationPanel mixes mock notifications with real invitations
Impact: Users see fake invitations that don't work
Fix: Remove mock notifications, only show real invitations from API
2. No Real Project Integration:

Problem: Accepting invitations doesn't add users to actual projects
Impact: Users can't access projects after accepting
Fix: Implement project member addition in acceptInvitation function
3. Temporary Storage Issues:

Problem: Backend uses in-memory storage (lost on restart)
Impact: All invitations disappear when server restarts
Fix: Deploy Firestore rules or implement persistent storage
4. Role System Mismatch:

Problem: Current roles are member | pm | admin but you want editor | viewer | admin
Impact: Role system doesn't match your requirements
Fix: Update role types throughout the system
5. Email Configuration Missing:

Problem: Email credentials not configured in .env
Impact: Email sending fails or uses simulation mode
Fix: Add EMAIL_USER, EMAIL_PASS, EMAIL_FROM to .env
6. Project ID Issues:

Problem: Backend creates temporary project IDs (temp_${Date.now()})
Impact: Invitations link to non-existent projects
Fix: Pass actual projectId from frontend to backend
7. Notification Sync Issues:

Problem: Notifications don't sync with invitation status changes
Impact: Old notifications remain after accepting/declining
Fix: Refresh notifications after status updates
8. Field Name Inconsistencies:

Problem: Backend uses inviteeEmail, frontend expects recipientEmail
Impact: Data mapping required, potential for errors
Fix: Standardize field names across backend and frontend