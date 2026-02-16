import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { IUser, IUserFilterRequest } from "./user.interface";
import * as bcrypt from "bcrypt";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma, UserRole, UserStatus } from "@prisma/client";
import { userSearchAbleFields } from "./user.costant";
import config from "../../../config";
import httpStatus from "http-status";
import e, { Request } from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import crypto from "crypto";
import emailSender from "../../../shared/emailSender";
import { generateOtpEmail } from "../../../shared/emaiHTMLtext";

// Create a new user
const createUserIntoDb = async (payload: IUser) => {
  // Check if user already exists
  const otp = Number(crypto.randomInt(1000, 9999));
  const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const existingUser = await prisma.user.findFirst({
    where: { email: payload.email },
     select: {
        id: true,
        fullName: true,
        email: true,
        country: true,
        role: true,
        status: true,
        createdAt: true,
      },
  });

  if (existingUser?.status === UserStatus.ACTIVE) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "User with this email already exists",
    );
  } else if (existingUser && existingUser.status === UserStatus.INACTIVE) {
    emailSender(
      existingUser.email,
      generateOtpEmail(otp),
      "Account Verification OTP",
    );
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        otp: otp,
        expirationOtp: otpExpiration,
      },
    });
    return existingUser;
  } else {
    if (!payload.password) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Password is required");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      payload.password,
      Number(config.bcrypt_salt_rounds),
    );

    const emailHtml = generateOtpEmail(otp);
    await emailSender(payload.email, emailHtml, "Account Verification OTP");

    // Create user
    const newUser = await prisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        country: payload.country,
        password: hashedPassword,
        role: payload.role || UserRole.USER,
        status: UserStatus.INACTIVE,
        fcmToken: payload.fcmToken,
        otp: otp,
        expirationOtp: otpExpiration,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        country: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return newUser;
  }
};

// Get all users with filtering and pagination
const getUsersFromDb = async (
  params: IUserFilterRequest,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.UserWhereInput[] = [];

  // Search by name or email
  if (searchTerm) {
    andConditions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Filter by other fields
  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      fullName: true,
      email: true,
      country: true,
      role: true,
      status: true,
      isCompleteProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditions,
  });

  if (result.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found");
  }

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// Get single user by ID
const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      country: true,
      role: true,
      status: true,
      isCompleteProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

// Update user profile
const updateProfile = async (
  req: Request & { user?: any },
  file?: Express.Multer.File,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  let profileImageUrl = existingUser.profileImage ?? "";

  // Upload image to Cloudinary if provided
  if (file) {
    const uploadResult = await fileUploader.uploadToCloudinary(file);
    profileImageUrl = uploadResult.Location;
  }

  // Parse data if it's a string
  let data = req.body.data || req.body;
  if (typeof req.body.data === "string") {
    data = JSON.parse(req.body.data);
  }

  const updateData: any = {};

  if (data.fullName) updateData.fullName = data.fullName;
  if (data.country) updateData.country = data.country;
  if (data.isCompleteProfile !== undefined)
    updateData.isCompleteProfile = data.isCompleteProfile;
  if (file) updateData.profileImage = profileImageUrl;

  const result = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      fullName: true,
      email: true,
      country: true,
      profileImage: true,
      role: true,
      status: true,
      isCompleteProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

// Complete user profile with data and image
const completeProfile = async (
  req: Request & { user?: any },
  file?: Express.Multer.File,
) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  let profileImageUrl = existingUser.profileImage ?? "";

  // Upload image to Cloudinary if provided
  if (file) {
    const uploadResult = await fileUploader.uploadToCloudinary(file);
    profileImageUrl = uploadResult.Location;
  }

  // Parse data if it's a string
  let data = req.body.data || req.body;
  if (typeof req.body.data === "string") {
    data = JSON.parse(req.body.data);
  }

  const updateData: any = {
    fullName: data.fullName || existingUser.fullName,
    country: data.country || existingUser.country,
    
    profileImage: profileImageUrl,
    isCompleteProfile: true,
  };

  const result = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      fullName: true,
      email: true,
      country: true,
      profileImage: true,
      role: true,
      status: true,
      isCompleteProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

// Update user by ID (admin only)
const updateUserIntoDb = async (payload: Partial<IUser>, id: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const updateData: any = {};

  if (payload.fullName) updateData.fullName = payload.fullName;
  if (payload.country) updateData.country = payload.country;
  if (payload.status) updateData.status = payload.status;
  if (payload.role) updateData.role = payload.role;
  if (payload.isCompleteProfile !== undefined)
    updateData.isCompleteProfile = payload.isCompleteProfile;

  const result = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      fullName: true,
      email: true,
      country: true,
      role: true,
      status: true,
      isCompleteProfile: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

export const userService = {
  createUserIntoDb,
  getUsersFromDb,
  getUserById,
  updateProfile,
  completeProfile,
  updateUserIntoDb,
};
