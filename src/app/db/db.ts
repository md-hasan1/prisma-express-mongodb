import { UserRole } from "@prisma/client";
import prisma from "../../shared/prisma";
import * as bcrypt from "bcrypt";
import config from "../../config";
export const initiateSuperAdmin = async () => {
  const hashedPassword=await bcrypt.hash('123456789',Number(config.bcrypt_salt_rounds))
  const payload: any = {
    fullName : "Super",
    email: "admin@gmail.com",
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const isExistUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (isExistUser) return;

  await prisma.user.create({
    data: payload,
  });
};

export const initiateDefaultProducts = async () => {
  const defaultProducts = [
    {
      name: "Laptop",
      description: "High performance laptop for professionals",
      price: 999.99,
      stock: 15,
      category: "Electronics",
      image: null,
      brand: "Dell",
      isDiscounted: true,
      discountPercent: 10,
      tags: ["electronics", "computers", "work"],
      isActive: true,
      weight: 1.8,
      colors: ["Silver", "Black"],
      dimensions: "35 x 24 x 1.8 cm",
    },
    {
      name: "Wireless Mouse",
      description: "Ergonomic wireless mouse with precision tracking",
      price: 29.99,
      stock: 50,
      category: "Accessories",
      image: null,
      brand: "Logitech",
      isDiscounted: false,
      discountPercent: 0,
      tags: ["accessories", "mouse", "wireless"],
      isActive: true,
      weight: 0.1,
      colors: ["Black", "White"],
      dimensions: "6 x 4 x 3 cm",
    },
    {
      name: "USB-C Cable",
      description: "Fast charging USB-C cable for all devices",
      price: 12.99,
      stock: 100,
      category: "Cables",
      image: null,
      brand: "Anker",
      isDiscounted: false,
      discountPercent: 0,
      tags: ["cables", "charging", "accessories"],
      isActive: true,
      weight: 0.05,
      colors: ["Black", "White", "Blue"],
      dimensions: "2 m",
    },
    {
      name: "Mechanical Keyboard",
      description: "RGB mechanical keyboard for gaming and typing",
      price: 89.99,
      stock: 25,
      category: "Peripherals",
      image: null,
      brand: "Corsair",
      isDiscounted: true,
      discountPercent: 15,
      tags: ["keyboard", "gaming", "rgb", "mechanical"],
      isActive: true,
      weight: 0.9,
      colors: ["Black", "White"],
      dimensions: "45 x 13 x 2.5 cm",
    },
    {
      name: "Monitor Stand",
      description: "Adjustable monitor stand with storage",
      price: 49.99,
      stock: 30,
      category: "Accessories",
      image: null,
      brand: "Generic",
      isDiscounted: false,
      discountPercent: 0,
      tags: ["monitor", "stand", "storage", "office"],
      isActive: true,
      weight: 2.5,
      colors: ["Black"],
      dimensions: "60 x 20 x 5 cm",
    },
  ];

  // Check if default products already exist
const existingCount = await prisma.product.count({
  where: {
    user: { is: null },
  },
});


  if (existingCount > 0) {
    console.log(`${existingCount} default products already exist. Skipping creation.`);
    return;
  }

  await prisma.product.createMany({
    data: defaultProducts,
  });
  console.log("5 default products created successfully!");
};
