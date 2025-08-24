# Store Rating Web Application

A comprehensive web application for store ratings with user management and role-based access control. Built with Express.js backend, MySQL database, and React.js frontend.

## Features

### 🔐 Authentication & User Management
- **User Registration & Login**: Secure authentication system with JWT tokens
- **Role-Based Access Control**: Three user roles (Admin, Store Owner, Normal User)
- **Password Management**: Secure password requirements and update functionality
- **Profile Management**: User profile updates and management

### 🏪 Store Management
- **Store Registration**: Add new stores to the platform
- **Store Information**: Name, email, address, and owner details
- **Store Search**: Search stores by name and address
- **Store Ratings**: View average ratings and total rating counts

### ⭐ Rating System
- **1-5 Star Ratings**: Rate stores from 1 to 5 stars
- **Rating Management**: Submit, update, and delete ratings
- **Rating History**: Track user rating history
- **Store Analytics**: View store performance metrics

### 👨‍💼 Admin Features
- **Dashboard Statistics**: Total users, stores, and ratings overview
- **User Management**: Add, edit, delete, and manage user roles
- **Store Management**: Add, edit, and delete stores
- **Advanced Filtering**: Search and filter users/stores by various criteria
- **System Monitoring**: Track recent activity and system health

### 🏪 Store Owner Features
- **Store Dashboard**: View store performance and ratings
- **Rating Analytics**: See average rating and total ratings
- **User Feedback**: View detailed feedback from customers

## Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **MySQL** database with **mysql2** driver
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **helmet** for security headers
- **express-rate-limit** for rate limiting

### Frontend
- **React.js** with **React Router** for navigation
- **Tailwind CSS** for styling
- **React Hook Form** for form management
- **Axios** for HTTP requests
- **React Hot Toast** for notifications
- **Lucide React** for icons

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Store_Rating_Web_App
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=store_rating_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 5. Database Setup
1. Create a MySQL database:
```sql
CREATE DATABASE store_rating_db;
```

2. The application will automatically create tables and insert a default admin user on first run.

### 6. Start the Application

#### Development Mode
```bash
# Start backend (from root directory)
npm run dev

# Start frontend (from root directory)
npm run client
```

#### Production Mode
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## Default Admin Account

The system automatically creates a default admin account:
- **Email**: admin@storeapp.com
- **Password**: admin123!

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/password` - Update password
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/ratings` - Get user rating history
- `GET /api/users/store` - Get user's store (store owners)

### Stores
- `GET /api/stores` - Get all stores with ratings
- `GET /api/stores/:id` - Get store details
- `GET /api/stores/search` - Search stores
- `GET /api/stores/owner/store` - Get store owner's store

### Ratings
- `POST /api/ratings` - Submit rating
- `PUT /api/ratings/:id` - Update rating
- `DELETE /api/ratings/:id` - Delete rating
- `GET /api/ratings/store/:storeId` - Get user's rating for store
- `GET /api/ratings/store/:storeId/all` - Get all ratings for store

### Admin (Admin only)
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/users` - Get all users with filtering
- `GET /api/admin/stores` - Get all stores with filtering
- `POST /api/admin/users` - Create new user
- `POST /api/admin/stores` - Create new store
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `DELETE /api/admin/stores/:id` - Delete store

## Form Validation Rules

### User Registration/Update
- **Name**: 20-60 characters
- **Email**: Valid email format
- **Address**: Maximum 400 characters
- **Password**: 8-16 characters, must include uppercase letter and special character

### Store Creation
- **Name**: Maximum 100 characters
- **Email**: Valid email format
- **Address**: Maximum 400 characters

### Rating Submission
- **Rating**: 1-5 stars (integer)
- **Comment**: Optional, maximum 1000 characters

## Database Schema

### Users Table
- `id` (Primary Key)
- `name` (VARCHAR 60)
- `email` (VARCHAR 255, Unique)
- `password` (VARCHAR 255, Hashed)
- `address` (VARCHAR 400)
- `role` (ENUM: admin, user, store_owner)
- `created_at`, `updated_at` (Timestamps)

### Stores Table
- `id` (Primary Key)
- `name` (VARCHAR 100)
- `email` (VARCHAR 255, Unique)
- `address` (VARCHAR 400)
- `owner_id` (Foreign Key to Users)
- `created_at`, `updated_at` (Timestamps)

### Ratings Table
- `id` (Primary Key)
- `user_id` (Foreign Key to Users)
- `store_id` (Foreign Key to Stores)
- `rating` (INT 1-5)
- `comment` (TEXT)
- `created_at`, `updated_at` (Timestamps)
- Unique constraint on (user_id, store_id)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Comprehensive server-side validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configurable CORS settings
- **SQL Injection Prevention**: Parameterized queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

## Changelog

### Version 1.0.0
- Initial release
- Complete user management system
- Store rating functionality
- Role-based access control
- Admin dashboard
- Responsive React frontend
