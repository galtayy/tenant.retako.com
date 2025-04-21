# Tenant Deposit Protection Web Application

A web application developed to digitally document the condition of rented properties during move-in and move-out processes, protecting tenants' deposits and shifting the burden of proof to landlords.

## Features

- User registration and login system
- Property information recording
- Creating move-in/move-out reports
- Photo uploads and damage descriptions
- Secure sharing links for landlords
- Report viewing status tracking

## Technology Stack

### Frontend
- React
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js
- JWT Authentication

### Database
- MySQL
- Sequelize ORM

### Storage
- Local storage (uploads folder)

## Installation

### Requirements
- Node.js
- MySQL

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create MySQL database:
```sql
CREATE DATABASE tenant_deposit_db;
```

4. Edit database connection information in the `.env` file.

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the React application:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login

### Reports
- `POST /api/properties` - Create a new property
- `GET /api/properties` - Get user's properties
- `POST /api/properties/:propertyId/reports` - Create a new report
- `GET /api/reports/:reportId` - Get report details
- `POST /api/reports/:reportId/photos` - Add photo to report
- `GET /api/reports/:reportId/photos` - Get report photos
- `PUT /api/reports/:reportId` - Update report
- `POST /api/reports/:reportId/send` - Send report to landlord
- `GET /api/reports` - Get all reports of the user

### Landlord Access
- `GET /api/view-report/:token` - View report with token
- `POST /api/viewed-report/:token` - Update report viewing status

## Directory Structure

```
tenant/
├── client/                     # Frontend application
│   ├── public/                 # Static files
│   └── src/                    # Source code
│       ├── components/         # React components
│       ├── contexts/           # Context API
│       └── pages/              # Page components
└── server/                     # Backend application
    ├── config/                 # Configuration files
    ├── controllers/            # Controllers
    ├── middlewares/            # Middlewares
    ├── models/                 # Database models
    ├── routes/                 # API routes
    └── uploads/                # Uploaded files
```

## License

This project is licensed under the MIT License.
