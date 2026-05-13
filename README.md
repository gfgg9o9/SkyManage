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
