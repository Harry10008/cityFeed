# cityfeed - Discount Coupon Platform

A backend API for a discount coupon platform built with TypeScript, Node.js, and Express.

## Features

- User authentication and authorization
- Merchant management
- Admin dashboard
- Coupon creation and management
- Coupon redemption system
- Analytics and statistics

## Tech Stack

- TypeScript
- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- Zod Validation
- Winston Logger

## Project Structure

```
src/
├── config/                 # Configuration files
├── controllers/           # Route controllers
├── dto/                   # Data Transfer Objects
├── interfaces/           # TypeScript interfaces
├── middleware/          # Custom middleware
├── models/             # Mongoose models
├── repositories/       # Database repositories
├── routes/            # API routes
├── services/          # Business logic
├── utils/            # Utility functions
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Users
- POST /api/users/register - Register a new user
- POST /api/users/login - User login
- GET /api/users/profile - Get user profile
- PATCH /api/users/profile - Update user profile
- PATCH /api/users/membership - Update membership type

### Merchants
- POST /api/merchants/register - Register a new merchant
- POST /api/merchants/login - Merchant login
- GET /api/merchants/profile - Get merchant profile
- PATCH /api/merchants/profile - Update merchant profile
- GET /api/merchants/category/:category - Get merchants by category

### Admins
- POST /api/admins/register - Register a new admin
- POST /api/admins/login - Admin login
- GET /api/admins/profile - Get admin profile
- PATCH /api/admins/profile - Update admin profile
- PATCH /api/admins/permissions - Update admin permissions
- GET /api/admins/all - Get all admins

### Coupons
- POST /api/coupons - Create a new coupon
- GET /api/coupons/active - Get active coupons
- GET /api/coupons/category/:category - Get coupons by category
- GET /api/coupons/code/:code - Get coupon by code
- GET /api/coupons/:id - Get coupon by ID
- PATCH /api/coupons/:id - Update coupon
- POST /api/coupons/:id/redeem - Redeem a coupon
- GET /api/coupons/merchant/coupons - Get merchant's coupons
- GET /api/coupons/merchant/stats - Get merchant redemption stats
- GET /api/coupons/user/stats - Get user redemption stats

## Error Handling

The API uses a consistent error response format:

```json
{
  "status": "error",
  "message": "Error message"
}
```

For validation errors:

```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error message"
    }
  ]
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 