// generateModule.js
const fs = require("fs");
const path = require("path");

const MODULES_DIR = path.join(__dirname, "app/modules");

const toCamel = (str) =>
  str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (m) => m.toLowerCase());

const toPascal = (str) => {
  const camel = toCamel(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
};

const generateModule = (rawModuleName) => {
  if (!rawModuleName) {
    console.error("Please provide a module name!");
    process.exit(1);
  }

  const moduleName = toCamel(rawModuleName); // prisma model name should match this
  const Pascal = toPascal(rawModuleName);

  const modulePath = path.join(MODULES_DIR, moduleName);

  if (fs.existsSync(modulePath)) {
    console.error(`Module '${moduleName}' already exists!`);
    process.exit(1);
  }

  fs.mkdirSync(modulePath, { recursive: true });

  const files = {
    // 1) controller
    controller: `
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ${moduleName}Service } from "./${moduleName}.service";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { ${moduleName}FilterableFields } from "./${moduleName}.constant";

const create${Pascal} = catchAsync(async (req: Request, res: Response) => {
  const result = await ${moduleName}Service.createIntoDb(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "${Pascal} created successfully!",
    data: result,
  });
});

const get${Pascal}s = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ${moduleName}FilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await ${moduleName}Service.getListFromDb(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "${Pascal}s retrieved successfully!",
    data: result,
  });
});

const get${Pascal}ById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ${moduleName}Service.getByIdFromDb(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "${Pascal} retrieved successfully!",
    data: result,
  });
});

const update${Pascal} = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ${moduleName}Service.updateIntoDb(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "${Pascal} updated successfully!",
    data: result,
  });
});

const delete${Pascal} = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ${moduleName}Service.deleteItemFromDb(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "${Pascal} deleted successfully!",
    data: result,
  });
});

export const ${moduleName}Controller = {
  create${Pascal},
  get${Pascal}s,
  get${Pascal}ById,
  update${Pascal},
  delete${Pascal},
};
    `,

    // 2) service (includes search/filter + pagination like your user.services)
    service: `
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { I${Pascal}FilterRequest } from "./${moduleName}.interface";
import { ${moduleName}SearchAbleFields } from "./${moduleName}.constant";

const createIntoDb = async (payload: any) => {
  const result = await prisma.${moduleName}.create({
    data: payload,
  });

  return result;
};

const getListFromDb = async (
  params: I${Pascal}FilterRequest,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.${Pascal}WhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: ${moduleName}SearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    } as any);
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    } as any);
  }

  const whereConditions: Prisma.${Pascal}WhereInput =
    andConditions.length > 0 ? ({ AND: andConditions } as any) : ({} as any);

  const result = await prisma.${moduleName}.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },

    // TODO: customize select if needed
    // select: { id: true, createdAt: true, updatedAt: true }
  });

  const total = await prisma.${moduleName}.count({
    where: whereConditions,
  });

  return {
    meta: { page, limit, total },
    data: result,
  };
};

const getByIdFromDb = async (id: string) => {
  const result = await prisma.${moduleName}.findUnique({
    where: { id },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "${Pascal} not found");
  }

  return result;
};

const updateIntoDb = async (id: string, payload: any) => {
  // ensure exists
  await prisma.${moduleName}.findUniqueOrThrow({ where: { id } });

  const result = await prisma.${moduleName}.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteItemFromDb = async (id: string) => {
  // ensure exists
  await prisma.${moduleName}.findUniqueOrThrow({ where: { id } });

  const result = await prisma.${moduleName}.delete({
    where: { id },
  });

  return result;
};

export const ${moduleName}Service = {
  createIntoDb,
  getListFromDb,
  getByIdFromDb,
  updateIntoDb,
  deleteItemFromDb,
};
    `,

    // 3) routes (REST default; you can rename endpoints like /register if you want per module)
    routes: `
import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import { ${moduleName}Validation } from "./${moduleName}.validation";
import { ${moduleName}Controller } from "./${moduleName}.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// create
router.post(
  "/",
  auth(),
  validateRequest(${moduleName}Validation.createSchema),
  ${moduleName}Controller.create${Pascal}
);

// list (supports searchTerm + filters + pagination)
router.get("/", auth(), ${moduleName}Controller.get${Pascal}s);

// details
router.get("/:id", auth(), ${moduleName}Controller.get${Pascal}ById);

// update
router.put(
  "/:id",
  auth(),
  validateRequest(${moduleName}Validation.updateSchema),
  ${moduleName}Controller.update${Pascal}
);

// delete
router.delete("/:id", auth(), ${moduleName}Controller.delete${Pascal});

export const ${moduleName}Routes = router;
    `,

    // 4) validation
    validation: `
import { z } from "zod";

const createSchema = z.object({
  body: z.object({
    // TODO: update fields
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    // TODO: update fields
    name: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const ${moduleName}Validation = {
  createSchema,
  updateSchema,
};
    `,

    // 5) constant (your user.costant style)
    constant: `
export const ${moduleName}FilterableFields = [
  "searchTerm",
  // TODO: add filter fields, e.g. "name", "status"
];

export const ${moduleName}SearchAbleFields = [
  // TODO: add searchable fields, e.g. "name"
  "name",
];
    `,

    // 6) interface (your user.interface style)
    interface: `
export interface I${Pascal} {
  id?: string;
  // TODO: add model fields
  name?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type I${Pascal}FilterRequest = {
  searchTerm?: string | undefined;
  // TODO: add filter fields
  name?: string | undefined;
};
    `,
  };

  const map = {
    controller: `${moduleName}.controller.ts`,
    service: `${moduleName}.service.ts`,
    routes: `${moduleName}.routes.ts`,
    validation: `${moduleName}.validation.ts`,
    constant: `${moduleName}.constant.ts`,
    interface: `${moduleName}.interface.ts`,
  };

  for (const [key, content] of Object.entries(files)) {
    const filePath = path.join(modulePath, map[key]);
    fs.writeFileSync(filePath, content.trim() + "\n");
    console.log(`Created: ${filePath}`);
  }

  console.log(`Module '${moduleName}' created successfully!`);
};

// Run script
const [, , moduleName] = process.argv;
generateModule(moduleName);
