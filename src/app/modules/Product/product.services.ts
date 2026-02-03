import { UserRole } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { fileUploader } from "../../../helpars/fileUploader";
import pick from "../../../shared/pick";
import { productSearchAbleFields } from "./product.constant";
import prisma from "../../../shared/prisma";

const createProductIntoDb = async (
  data: any,
  id: string,
  file?: Express.Multer.File,
) => {
  if (!id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  let imageUrl = data.image;
  if (file) {
    const uploadResult = await fileUploader.uploadToCloudinary(file);
    imageUrl = uploadResult.Location;
  }
  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      category: data.category,
      image: imageUrl,
      userId: id,
      brand: data.brand,
      isDiscounted: data.isDiscounted || false,
      discountPercent: data.discountPercent,
      tags: data.tags || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      weight: data.weight,
      colors: data.colors || [],
      dimensions: data.dimensions,
    },
  });
  return product;
};

const getProductsFromDb = async (filters: any, options: any, id: string) => {
  // Add filtering logic if needed, e.g. searchTerm
  const where: any = {
    OR: [
      { user: { is: null } }, // Show global products to everyone
      { userId: id }, // Show user's own products
    ],
  };
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  // Admins see all products
  if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) {
    delete where.OR;
  }
  if (filters.searchTerm) {
    where.AND = [
      {
        OR: productSearchAbleFields.map((field) => ({
          [field]: { contains: filters.searchTerm, mode: "insensitive" },
        })),
      },
    ];
  }
  if (filters.category) {
    if (!where.AND) {
      where.AND = [];
    }
    where.AND.push({ category: filters.category });
  }
  return prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      category: true,
      image: true,
      userId: true,
      brand: true,
      isDiscounted: true,
      discountPercent: true,
      tags: true,
      isActive: true,
      weight: true,
      colors: true,
      dimensions: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          country: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
};

const getProductByIdFromDb = async (id: string, userId: string) => {
  const where: any = { id };
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  // Non-admins can only access global products or their own products
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    where.OR = [{ user: { is: null } }, { userId: userId }];
  }
  const result = await prisma.product.findFirst({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      category: true,
      image: true,
      userId: true,
      brand: true,
      isDiscounted: true,
      discountPercent: true,
      tags: true,
      isActive: true,
      weight: true,
      colors: true,
      dimensions: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profileImage: true,
          country: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
  return result;
};

const updateProductIntoDb = async (
  id: string,
  data: any,
  userId: string,
  file?: Express.Multer.File,
) => {
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
    const owned = await prisma.product.findFirst({
      where: { id, userId: user.id },
    });
    if (!owned) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You do not have access to this product",
      );
    }
  }
  let imageUrl = data.image;
  if (file) {
    const uploadResult = await fileUploader.uploadToCloudinary(file);
    imageUrl = uploadResult.Location;
  }
  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      category: data.category,
      image: imageUrl,
      brand: data.brand,
      isDiscounted: data.isDiscounted,
      discountPercent: data.discountPercent,
      tags: data.tags,
      isActive: data.isActive,
      weight: data.weight,
      colors: data.colors,
      dimensions: data.dimensions,
    },
  });
  return updated;
};

const deleteProductFromDb = async (
  id: string,
  user?: { id?: string; role?: string },
) => {
  if (!user?.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
  }
  const currentUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!currentUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Only admins can delete global products
  if (
    currentUser.role !== UserRole.ADMIN &&
    currentUser.role !== UserRole.SUPER_ADMIN
  ) {
    const owned = await prisma.product.findFirst({
      where: { id, userId: user.id },
    });
    if (!owned) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "You can only delete your own products",
      );
    }
  }
  try {
    return await prisma.product.delete({ where: { id } });
  } catch {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }
};

export const productService = {
  createProductIntoDb,
  getProductsFromDb,
  getProductByIdFromDb,
  updateProductIntoDb,
  deleteProductFromDb,
};
