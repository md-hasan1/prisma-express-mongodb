import { z } from "zod";

const productDataSchema = z.object({
  name: z.string().min(1, "Product name is required").max(100, "Product name must not exceed 100 characters"),
  description: z.string().max(1000, "Description must not exceed 1000 characters").optional(),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().min(0, "Stock must be a non-negative number"),
  category: z.string().max(50, "Category must not exceed 50 characters").optional(),
  brand: z.string().max(50, "Brand must not exceed 50 characters").optional(),
  isDiscounted: z.boolean().optional(),
  discountPercent: z.number().min(0).max(100, "Discount percent must be between 0 and 100").optional(),
  tags: z.array(z.string().max(30, "Each tag must not exceed 30 characters")).max(10, "Maximum 10 tags allowed").optional(),
  isActive: z.boolean().optional(),
  weight: z.number().min(0, "Weight must be non-negative").optional(),
  colors: z.array(z.string().max(30, "Each color must not exceed 30 characters")).max(10, "Maximum 10 colors allowed").optional(),
  dimensions: z.string().max(100, "Dimensions must not exceed 100 characters").optional(),
});

// ✅ Create: all required as defined above
export const createProductValidationSchema = productDataSchema;

// ✅ Update: all optional
export const updateProductValidationSchema = productDataSchema.partial();

export const productValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
};
