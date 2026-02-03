
# Product Module API Documentation

> This API allows you to create, read, update, and delete products, including image upload to Cloudinary.

**Base URL:**
```
http://localhost:PORT/api/v1/products
```
Replace `PORT` with your server port (e.g., 5000).

---

## Endpoints

### 1. Create Product
- **Method:** POST
- **URL:** `{baseUrl}/api/v1/products`
- **Request Body:** `multipart/form-data`
  - `data` (string, required): JSON string of product fields
    - Example: `{ "name": "Sample Product", "price": 99.99, "stock": 10, "category": "Electronics" }`
  - `image` (file, optional): Product image file

**Example Request (form-data):**
| Key   | Type | Value |
|-------|------|-------|
| data  | Text | {"name":"Sample Product","price":99.99,"stock":10,"category":"Electronics"} |
| image | File | (select a file) |

**Example Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "abc123",
    "name": "Sample Product",
    "price": 99.99,
    "stock": 10,
    "category": "Electronics",
    "image": "https://res.cloudinary.com/.../image.jpg",
    "createdAt": "2026-02-01T12:00:00.000Z",
    "updatedAt": "2026-02-01T12:00:00.000Z"
  }
}
```

---

### 2. Get All Products
- **Method:** GET
- **URL:** `{baseUrl}/api/v1/products`
- **Query Params:**
  - `name` (string, optional)
  - `category` (string, optional)
  - `searchTerm` (string, optional)

**Example Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "id": "abc123",
      "name": "Sample Product",
      "price": 99.99,
      "stock": 10,
      "category": "Electronics",
      "image": "https://res.cloudinary.com/.../image.jpg",
      "createdAt": "2026-02-01T12:00:00.000Z",
      "updatedAt": "2026-02-01T12:00:00.000Z"
    }
    // ...more products
  ]
}
```

---

### 3. Get Product By ID
- **Method:** GET
- **URL:** `{baseUrl}/api/v1/products/:id`

**Example Response:**
```json
{
  "success": true,
  "message": "Product details retrieved successfully",
  "data": {
    "id": "abc123",
    "name": "Sample Product",
    "price": 99.99,
    "stock": 10,
    "category": "Electronics",
    "image": "https://res.cloudinary.com/.../image.jpg",
    "createdAt": "2026-02-01T12:00:00.000Z",
    "updatedAt": "2026-02-01T12:00:00.000Z"
  }
}
```

---

### 4. Update Product
- **Method:** PUT
- **URL:** `{baseUrl}/api/v1/products/:id`
- **Request Body:** `multipart/form-data`
  - `data` (string, required): JSON string of product fields to update
    - Example: `{ "name": "Updated Product", "price": 120.00, "stock": 5, "category": "Gadgets" }`
  - `image` (file, optional): New product image file

**Example Request (form-data):**
| Key   | Type | Value |
|-------|------|-------|
| data  | Text | {"name":"Updated Product","price":120.00,"stock":5,"category":"Gadgets"} |
| image | File | (select a file) |

**Example Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "abc123",
    "name": "Updated Product",
    "price": 120.00,
    "stock": 5,
    "category": "Gadgets",
    "image": "https://res.cloudinary.com/.../image.jpg",
    "createdAt": "2026-02-01T12:00:00.000Z",
    "updatedAt": "2026-02-01T12:10:00.000Z"
  }
}
```

---

### 5. Delete Product
- **Method:** DELETE
- **URL:** `{baseUrl}/api/v1/products/:id`

**Example Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "id": "abc123",
    "name": "Sample Product",
    "price": 99.99,
    "stock": 10,
    "category": "Electronics",
    "image": "https://res.cloudinary.com/.../image.jpg",
    "createdAt": "2026-02-01T12:00:00.000Z",
    "updatedAt": "2026-02-01T12:00:00.000Z"
  }
}
```

---

## Notes
- Image uploads use Cloudinary. Ensure your Cloudinary credentials are set in your environment variables.
- All endpoints are public by default. Add authentication as needed.
- Error responses follow a consistent format with `success`, `message`, and `errors` fields.

---

For questions or issues, please contact the maintainer.
