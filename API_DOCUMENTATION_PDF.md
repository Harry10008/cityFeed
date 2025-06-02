# cityfeed API Documentation

<div style="text-align: center; margin-bottom: 2rem;">
  <h1 style="color: #2563eb;">cityfeed API Documentation</h1>
  <p style="color: #4b5563;">Version 1.0.0</p>
</div>

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Security](#security)
9. [Development Guide](#development-guide)

## Introduction

cityfeed is a modern discount coupon platform that enables users to discover and redeem coupons from various merchants. This API documentation provides comprehensive information for frontend developers to integrate with the cityfeed platform.

### Key Features
- User authentication and authorization
- Merchant management
- Coupon creation and management
- Coupon redemption system
- Real-time statistics and analytics

## Getting Started

### Base URL
```
http://localhost:3000/api
```

### Environment Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with required environment variables
4. Start development server: `npm run dev`

### Required Environment Variables
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cityfeed
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

## Authentication

### JWT Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Token Format
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## API Endpoints

### User Management

#### Register User
```http
POST /users/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

#### Login User
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PATCH /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Updated",
  "phone": "9876543210",
  "address": "456 New St"
}
```

### Merchant Management

#### Register Merchant
```http
POST /merchants/register
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "email": "jane@business.com",
  "password": "password123",
  "phone": "1234567890",
  "address": "123 Business St",
  "businessName": "Jane's Store",
  "businessType": "retail",
  "businessAddress": "123 Business St"
}
```

#### Login Merchant
```http
POST /merchants/login
Content-Type: application/json

{
  "email": "jane@business.com",
  "password": "password123"
}
```

### Coupon Management

#### Create Coupon
```http
POST /coupons
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "SUMMER2024",
  "title": "Summer Sale",
  "description": "Get 20% off on all items",
  "category": "fashion",
  "discountType": "percentage",
  "discountValue": 20,
  "minPurchaseAmount": 100,
  "maxDiscountAmount": 500,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "maxRedemptions": 1000,
  "termsAndConditions": [
    "Valid only on full-priced items",
    "Cannot be combined with other offers"
  ]
}
```

#### Get Coupons
```http
GET /coupons
GET /coupons/:id
GET /coupons/code/:code
GET /coupons/merchant
GET /coupons/category/:category
GET /coupons/active
```

### Coupon Redemption

#### Redeem Coupon
```http
POST /coupons/:id/redeem
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 150
}
```

## Data Models

### User Model
```typescript
interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  membershipType: 'basic' | 'premium' | 'vip';
  isActive: boolean;
  role: 'user';
  createdAt: string;
  updatedAt: string;
}
```

### Merchant Model
```typescript
interface Merchant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  isActive: boolean;
  role: 'merchant';
  createdAt: string;
  updatedAt: string;
}
```

### Coupon Model
```typescript
interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  merchant: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  maxRedemptions?: number;
  currentRedemptions: number;
  termsAndConditions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Error Handling

### Error Response Format
```json
{
  "status": "error",
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Best Practices

### API Integration
1. Implement proper error handling
2. Use loading states for API calls
3. Cache responses when appropriate
4. Validate data before sending
5. Handle token expiration

### Security
1. Use HTTPS in production
2. Implement proper CORS policies
3. Sanitize user inputs
4. Follow password policies
5. Manage sessions properly

## Development Guide

### Local Development
1. Clone the repository
2. Install dependencies
3. Set up environment variables
4. Start the development server

### Testing
```bash
npm test
```

### Production Deployment
1. Set up production environment variables
2. Build the application
3. Deploy to your hosting platform

## Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation updates

---

<div style="text-align: center; margin-top: 2rem; color: #6b7280;">
  © 2024 cityfeed. All rights reserved.
</div> 