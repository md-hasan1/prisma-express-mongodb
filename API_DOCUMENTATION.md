# Product Management API Documentation

A comprehensive REST API for product management with user authentication, OTP verification, profile management, and CRUD operations for products.

## 🌐 Base URLs

- **Local Development**: `http://localhost:5000/api/v1`
- **Production**: `https://product-management-seven-xi.vercel.app/api/v1`

## 📋 Table of Contents

- [Authentication](#authentication)
- [User Management](#user-management)
- [Product Management](#product-management)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

---

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

### Login
**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "fcmToken": "optional_fcm_token"
}
```

**Data Types**:
- `email`: string (valid email format, lowercase)
- `password`: string (min 8 chars)
- `fcmToken`: string (optional)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Logout
**Endpoint**: `POST /auth/logout`

**Request Body**: None

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User logged out successfully",
  "data": null
}
```

---

### Get My Profile
**Endpoint**: `GET /auth/profile`

**Headers**: 
- `Authorization`: Bearer token (required)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "country": "USA",
    "role": "USER",
    "status": "ACTIVE",
    "isCompleteProfile": true,
    "createdAt": "2026-02-03T10:30:00.000Z",
    "updatedAt": "2026-02-03T10:30:00.000Z"
  }
}
```

---

### Change Password
**Endpoint**: `PUT /auth/change-password`

**Headers**: 
- `Authorization`: Bearer token (required)

**Request Body**:
```json
{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Data Types**:
- `oldPassword`: string (min 8 chars)
- `newPassword`: string (min 8 chars, max 50 chars, must contain uppercase, lowercase, number, and symbol)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "message": "Password changed successfully"
  }
}
```

---

### Forgot Password
**Endpoint**: `POST /auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Data Types**:
- `email`: string (valid email format, lowercase)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "message": "OTP sent to your email"
  }
}
```

---

### Resend OTP
**Endpoint**: `POST /auth/resend-otp`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Data Types**:
- `email`: string (valid email format, lowercase)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "OTP resent to your email",
  "data": {
    "message": "OTP resent to your email"
  }
}
```

---

### Verify OTP
**Endpoint**: `POST /auth/verify-otp`

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": 1234
}
```

**Data Types**:
- `email`: string (valid email format, lowercase)
- `otp`: number (4-digit integer, 1000-9999)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "message": "OTP verified successfully",
    "sortTimeToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Reset Password
**Endpoint**: `POST /auth/reset-password`

**Headers**: 
- `Authorization`: Bearer token (required - use short-time token from verify OTP)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "NewPassword123!"
}
```

**Data Types**:
- `email`: string (valid email format, lowercase)
- `password`: string (min 8 chars, max 50 chars, must contain uppercase, number)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Password reset successfully",
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

## 👥 User Management

### Register User
**Endpoint**: `POST /users/register`

**Request Body**:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "country": "USA",
  "password": "Password123!",
  "fcmToken": "optional_fcm_token"
}
```

**Data Types**:
- `fullName`: string (min 1 char, max 100 chars, letters and spaces only, regex: `/^[a-zA-Z\s]*$/`)
- `email`: string (valid email format, lowercase)
- `country`: string (min 1 char, max 50 chars)
- `password`: string (min 8 chars, max 50 chars, must contain uppercase, lowercase, number, and symbol)
- `fcmToken`: string (optional)

**Response** (201 CREATED):
```json
{
  "statusCode": 201,
  "success": true,
  "message": "User registered successfully!",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "country": "USA",
    "role": "USER",
    "status": "INACTIVE",
    "createdAt": "2026-02-03T10:30:00.000Z"
  }
}
```

**Note**: After registration, user status is `INACTIVE` and an OTP is sent to the email for account verification.

---

### Complete Profile
**Endpoint**: `PUT /users/complete-profile`

**Headers**: 
- `Authorization`: Bearer token (required)
- `Content-Type`: multipart/form-data

**Request Body (form-data)**:
```
data: {"fullName": "John Doe", "country": "USA"}  (text)
image: <file>  (file - optional)
```

**Data Types**:
- `data`: JSON string containing:
  - `fullName`: string (min 1 char, max 100 chars, letters and spaces only)
  - `country`: string (min 1 char, max 50 chars)
- `image`: File (optional - profile image)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile completed successfully!",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "John Doe",
    "email": "john@example.com",
    "country": "USA",
    "profileImage": "https://cloudinary.com/image.jpg",
    "role": "USER",
    "status": "ACTIVE",
    "isCompleteProfile": true,
    "createdAt": "2026-02-03T10:30:00.000Z",
    "updatedAt": "2026-02-03T11:00:00.000Z"
  }
}
```

---

### Update Profile
**Endpoint**: `PUT /users/profile`

**Headers**: 
- `Authorization`: Bearer token (required)
- `Content-Type`: multipart/form-data

**Request Body (form-data)**:
```
data: {"fullName": "Jane Updated", "country": "Canada", "isCompleteProfile": true}  (text)
image: <file>  (file - optional)
```

**Data Types**:
- `data`: JSON string containing:
  - `fullName`: string (min 1 char, max 100 chars, letters and spaces only) - optional
  - `country`: string (max 50 chars) - optional
  - `isCompleteProfile`: boolean - optional
- `image`: File (optional - profile image)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Profile updated successfully!",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "Jane Updated",
    "email": "jane@example.com",
    "country": "Canada",
    "profileImage": "https://cloudinary.com/image.jpg",
    "role": "USER",
    "status": "ACTIVE",
    "isCompleteProfile": true,
    "createdAt": "2026-02-03T10:30:00.000Z",
    "updatedAt": "2026-02-03T12:00:00.000Z"
  }
}
```

---

### Update User By ID (Admin Only)
**Endpoint**: `PUT /users/:id`

**Path Parameters**:
- `id`: string (MongoDB ObjectId)

**Request Body**:
```json
{
  "fullName": "Jane Admin Update",
  "country": "UK",
  "role": "USER",
  "status": "ACTIVE",
  "isCompleteProfile": true
}
```

**Data Types**:
- `fullName`: string (min 1 char, max 100 chars, letters and spaces only) - optional
- `country`: string (max 50 chars) - optional
- `role`: string (enum: "ADMIN", "SUPER_ADMIN", "USER", "GUST", "SCHOOL", "SHOP", "STUDENT", "PROFESSIONAL") - optional
- `status`: string (enum: "ACTIVE", "INACTIVE", "BLOCKED") - optional
- `isCompleteProfile`: boolean - optional

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User updated successfully!",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fullName": "Jane Admin Update",
    "email": "jane@example.com",
    "country": "UK",
    "role": "USER",
    "status": "ACTIVE",
    "isCompleteProfile": true,
    "createdAt": "2026-02-03T10:30:00.000Z",
    "updatedAt": "2026-02-03T13:00:00.000Z"
  }
}
```

---

## 📦 Product Management

All product endpoints require authentication.

### Create Product
**Endpoint**: `POST /products`

**Headers**: 
- `Authorization`: Bearer token (required)
- `Content-Type`: multipart/form-data

**Request Body (form-data)**:
```
data: {
  "name": "Premium Headphones",
  "description": "High quality wireless headphones",
  "price": 149.99,
  "stock": 25,
  "category": "Electronics",
  "brand": "Sony",
  "isDiscounted": true,
  "discountPercent": 10,
  "tags": ["audio", "wireless", "premium"],
  "isActive": true,
  "weight": 0.25,
  "colors": ["Black", "Silver"],
  "dimensions": "20 x 18 x 8 cm"
}  (text - JSON string)
image: <file>  (file - optional)
```

**Data Types**:
- `data`: JSON string containing:
  - `name`: string (min 1 char, max 100 chars) - **required**
  - `description`: string (max 1000 chars) - optional
  - `price`: number (positive) - **required**
  - `stock`: number (non-negative integer) - **required**
  - `category`: string (max 50 chars) - optional
  - `brand`: string (max 50 chars) - optional
  - `isDiscounted`: boolean - optional
  - `discountPercent`: number (0-100) - optional
  - `tags`: array of strings (max 10 items, each max 30 chars) - optional
  - `isActive`: boolean - optional
  - `weight`: number (non-negative) - optional
  - `colors`: array of strings (max 10 items, each max 30 chars) - optional
  - `dimensions`: string (max 100 chars) - optional
- `image`: File (optional - will be uploaded to Cloudinary)

**Response** (201 CREATED):
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Premium Headphones",
    "description": "High quality wireless headphones",
    "price": 149.99,
    "stock": 25,
    "category": "Electronics",
    "image": "https://cloudinary.com/product-image.jpg",
    "brand": "Sony",
    "isDiscounted": true,
    "discountPercent": 10,
    "tags": ["audio", "wireless", "premium"],
    "isActive": true,
    "weight": 0.25,
    "colors": ["Black", "Silver"],
    "dimensions": "20 x 18 x 8 cm",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2026-02-03T14:00:00.000Z",
    "updatedAt": "2026-02-03T14:00:00.000Z"
  }
}
```

---

### Get All Products
**Endpoint**: `GET /products`

**Headers**: 
- `Authorization`: Bearer token (required)

**Query Parameters** (all optional):
- `searchTerm`: string (searches in name, brand, category)
- `name`: string
- `category`: string
- `brand`: string
- `limit`: number (default: 10)
- `page`: number (default: 1)
- `sortBy`: string (default: "createdAt")
- `sortOrder`: string ("asc" | "desc", default: "desc")

**Example**: `GET /products?searchTerm=headphones&category=Electronics&limit=20&page=1`

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 45
    },
    "data": [
      {
        "id": "507f1f77bcf86cd799439012",
        "name": "Premium Headphones",
        "description": "High quality wireless headphones",
        "price": 149.99,
        "stock": 25,
        "category": "Electronics",
        "image": "https://cloudinary.com/product-image.jpg",
        "brand": "Sony",
        "isDiscounted": true,
        "discountPercent": 10,
        "tags": ["audio", "wireless", "premium"],
        "isActive": true,
        "weight": 0.25,
        "colors": ["Black", "Silver"],
        "dimensions": "20 x 18 x 8 cm",
        "userId": "507f1f77bcf86cd799439011",
        "createdAt": "2026-02-03T14:00:00.000Z",
        "updatedAt": "2026-02-03T14:00:00.000Z"
      }
    ]
  }
}
```

**Note**: 
- Regular users see: Global products (userId = null) + their own products
- Admins see: All products

---

### Get Product By ID
**Endpoint**: `GET /products/:id`

**Headers**: 
- `Authorization`: Bearer token (required)

**Path Parameters**:
- `id`: string (MongoDB ObjectId)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Premium Headphones",
    "description": "High quality wireless headphones",
    "price": 149.99,
    "stock": 25,
    "category": "Electronics",
    "image": "https://cloudinary.com/product-image.jpg",
    "brand": "Sony",
    "isDiscounted": true,
    "discountPercent": 10,
    "tags": ["audio", "wireless", "premium"],
    "isActive": true,
    "weight": 0.25,
    "colors": ["Black", "Silver"],
    "dimensions": "20 x 18 x 8 cm",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2026-02-03T14:00:00.000Z",
    "updatedAt": "2026-02-03T14:00:00.000Z"
  }
}
```

---

### Update Product
**Endpoint**: `PUT /products/:id`

**Headers**: 
- `Authorization`: Bearer token (required)
- `Content-Type`: multipart/form-data

**Path Parameters**:
- `id`: string (MongoDB ObjectId)

**Request Body (form-data)**:
```
data: {
  "name": "Updated Premium Headphones",
  "price": 139.99,
  "stock": 20,
  "discountPercent": 15
}  (text - JSON string, all fields optional)
image: <file>  (file - optional)
```

**Data Types**: Same as Create Product, but all fields are optional

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Updated Premium Headphones",
    "description": "High quality wireless headphones",
    "price": 139.99,
    "stock": 20,
    "category": "Electronics",
    "image": "https://cloudinary.com/updated-image.jpg",
    "brand": "Sony",
    "isDiscounted": true,
    "discountPercent": 15,
    "tags": ["audio", "wireless", "premium"],
    "isActive": true,
    "weight": 0.25,
    "colors": ["Black", "Silver"],
    "dimensions": "20 x 18 x 8 cm",
    "userId": "507f1f77bcf86cd799439011",
    "createdAt": "2026-02-03T14:00:00.000Z",
    "updatedAt": "2026-02-03T15:00:00.000Z"
  }
}
```

**Note**: Only the product owner or admin can update a product.

---

### Delete Product
**Endpoint**: `DELETE /products/:id`

**Headers**: 
- `Authorization`: Bearer token (required)

**Path Parameters**:
- `id`: string (MongoDB ObjectId)

**Response** (200 OK):
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Product deleted successfully",
  "data": null
}
```

**Note**: Only the product owner or admin can delete a product.

---

## 📊 Data Models

### User Model

```typescript
{
  id: string;                    // MongoDB ObjectId
  fullName: string;              // Min 1 char, max 100 chars
  email: string;                 // Unique, valid email format
  country: string | null;        // Max 50 chars
  profileImage: string | null;   // URL from Cloudinary
  isCompleteProfile: boolean;    // Default: false
  expirationOtp: Date | null;    // OTP expiration timestamp
  otp: number | null;            // 4-digit number (1000-9999)
  password: string;              // Hashed with bcrypt
  fcmToken: string | null;       // Firebase Cloud Messaging token
  role: UserRole;                // Default: USER
  status: UserStatus;            // Default: ACTIVE
  createdAt: Date;               // Auto-generated
  updatedAt: Date;               // Auto-generated
}
```

**UserRole Enum**:
- `ADMIN`
- `SUPER_ADMIN`
- `USER`
- `GUST`
- `SCHOOL`
- `SHOP`
- `STUDENT`
- `PROFESSIONAL`

**UserStatus Enum**:
- `ACTIVE`
- `INACTIVE`
- `BLOCKED`

---

### Product Model

```typescript
{
  id: string;                    // MongoDB ObjectId
  name: string;                  // Min 1 char, max 100 chars (required)
  description: string | null;    // Max 1000 chars
  price: number;                 // Positive number (required)
  stock: number;                 // Non-negative integer (required)
  category: string | null;       // Max 50 chars
  image: string | null;          // URL from Cloudinary
  brand: string | null;          // Max 50 chars
  isDiscounted: boolean;         // Default: false
  discountPercent: number | null;// 0-100
  tags: string[];                // Array, max 10 items, each max 30 chars
  isActive: boolean;             // Default: true
  weight: number | null;         // Non-negative
  colors: string[];              // Array, max 10 items, each max 30 chars
  dimensions: string | null;     // Max 100 chars
  userId: string | null;         // MongoDB ObjectId (null for global products)
  createdAt: Date;               // Auto-generated
  updatedAt: Date;               // Auto-generated
}
```

---

## ⚠️ Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error message",
  "errorMessages": [
    {
      "path": "fieldName",
      "message": "Detailed error message"
    }
  ],
  "stack": "Error stack trace (only in development)"
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `201 CREATED` - Resource created successfully
- `400 BAD REQUEST` - Invalid request data/validation error
- `401 UNAUTHORIZED` - Missing or invalid authentication token
- `403 FORBIDDEN` - User doesn't have permission
- `404 NOT FOUND` - Resource not found
- `409 CONFLICT` - Resource already exists
- `500 INTERNAL SERVER ERROR` - Server error

### Validation Errors

**Example** - Invalid email format:
```json
{
  "success": false,
  "message": "Validation Error",
  "errorMessages": [
    {
      "path": "email",
      "message": "Invalid email address"
    }
  ]
}
```

**Example** - Password requirements not met:
```json
{
  "success": false,
  "message": "Validation Error",
  "errorMessages": [
    {
      "path": "password",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

---

## 🔒 Authorization Rules

### Product Access Control

1. **Global Products** (userId = null):
   - Visible to all authenticated users
   - Only admins can create global products
   - Only admins can update/delete global products

2. **User Products** (userId != null):
   - Users can only see their own products + global products
   - Admins can see all products
   - Only the product owner or admin can update/delete

3. **Admin Roles**:
   - `ADMIN` and `SUPER_ADMIN` have full access to all resources

---

## 📝 Notes

### Password Requirements

- Minimum 8 characters
- Maximum 50 characters
- Must contain at least one uppercase letter (A-Z)
- Must contain at least one lowercase letter (a-z)
- Must contain at least one number (0-9)
- Must contain at least one symbol (!@#$%^&*()_+)

### Full Name Requirements

- Letters and spaces only
- Regex pattern: `/^[a-zA-Z\s]*$/`
- Min 1 character, max 100 characters

### Email Handling

- All emails are automatically converted to lowercase
- Must be valid email format
- Unique per user

### File Upload

- Profile images and product images are uploaded to Cloudinary
- Supported via multipart/form-data
- Maximum file size depends on Cloudinary configuration

### OTP System

- 4-digit random number (1000-9999)
- Valid for 10 minutes
- Used for:
  - Account verification after registration
  - Password reset flow
- Email sent via configured email service

### Pagination

Default values:
- `limit`: 10
- `page`: 1
- `sortBy`: "createdAt"
- `sortOrder`: "desc"

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB database
- Cloudinary account (for image uploads)
- Email service configuration

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp example.env .env

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

```env
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

---

## 📞 Support

For questions or issues, please contact the development team or create an issue in the project repository.

---

**Version**: 1.0.0  
**Last Updated**: February 3, 2026
