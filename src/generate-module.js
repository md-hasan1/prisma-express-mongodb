const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, 'app/modules');

const generateModule = moduleName => {
  if (!moduleName) {
    console.error('Please provide a module name!');
    process.exit(1);
  }

  const modulePath = path.join(MODULES_DIR, moduleName);

  if (fs.existsSync(modulePath)) {
    console.error(`Module '${moduleName}' already exists!`);
    process.exit(1);
  }

  // Create module folder
  fs.mkdirSync(modulePath, { recursive: true });

  // Capitalize module name
  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

  const capitalizedModule = capitalize(moduleName);

  // Generate files
  const files = {
    controller: `
import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { ${moduleName}Service } from './${moduleName}.service';

const create${capitalizedModule} = catchAsync(async (req, res) => {
  const result = await ${moduleName}Service.createIntoDb(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: '${capitalizedModule} created successfully',
    data: result,
  });
});

const get${capitalizedModule}List = catchAsync(async (req, res) => {
  const result = await ${moduleName}Service.getListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: '${capitalizedModule} list retrieved successfully',
    data: result,
  });
});

const get${capitalizedModule}ById = catchAsync(async (req, res) => {
  const result = await ${moduleName}Service.getByIdFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: '${capitalizedModule} details retrieved successfully',
    data: result,
  });
});

const update${capitalizedModule} = catchAsync(async (req, res) => {
  const result = await ${moduleName}Service.updateIntoDb(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: '${capitalizedModule} updated successfully',
    data: result,
  });
});

const delete${capitalizedModule} = catchAsync(async (req, res) => {
  const result = await ${moduleName}Service.deleteItemFromDb(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: '${capitalizedModule} deleted successfully',
    data: result,
  });
});

export const ${moduleName}Controller = {
  create${capitalizedModule},
  get${capitalizedModule}List,
  get${capitalizedModule}ById,
  update${capitalizedModule},
  delete${capitalizedModule},
};
    `,

    service: `
import prisma from "../../../shared/prisma";
import { UserStatus } from '@prisma/client';
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";


const createIntoDb = async (data: any) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.${moduleName}.create({ data });
    return result;
  });

  return transaction;
};

const getListFromDb = async () => {
  
    const result = await prisma.${moduleName}.findMany();
    return result;
};

const getByIdFromDb = async (id: string) => {
  
    const result = await prisma.${moduleName}.findUnique({ where: { id } });
    if (!result) {
      throw new Error('${capitalizedModule} not found');
    }
    return result;
  };



const updateIntoDb = async (id: string, data: any) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const result = await prisma.${moduleName}.update({
      where: { id },
      data,
    });
    return result;
  });

  return transaction;
};

const deleteItemFromDb = async (id: string) => {
  const transaction = await prisma.$transaction(async (prisma) => {
    const deletedItem = await prisma.${moduleName}.delete({
      where: { id },
    });

    // Add any additional logic if necessary, e.g., cascading deletes
    return deletedItem;
  });

  return transaction;
};
;

export const ${moduleName}Service = {
createIntoDb,
getListFromDb,
getByIdFromDb,
updateIntoDb,
deleteItemFromDb,
};
    `,

    routes: `
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ${moduleName}Controller } from './${moduleName}.controller';
import { ${moduleName}Validation } from './${moduleName}.validation';

const router = express.Router();

router.post(
'/',
auth(),
validateRequest(${moduleName}Validation.createSchema),
${moduleName}Controller.create${capitalizedModule},
);

router.get('/', auth(), ${moduleName}Controller.get${capitalizedModule}List);

router.get('/:id', auth(), ${moduleName}Controller.get${capitalizedModule}ById);

router.put(
'/:id',
auth(),
validateRequest(${moduleName}Validation.updateSchema),
${moduleName}Controller.update${capitalizedModule},
);

router.delete('/:id', auth(), ${moduleName}Controller.delete${capitalizedModule});

export const ${moduleName}Routes = router;
    `,

    validation: `
import { z } from 'zod';

const createSchema = z.object({

    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),

});

const updateSchema = z.object({

    name: z.string().optional(),
    description: z.string().optional(),

});

export const ${moduleName}Validation = {
createSchema,
updateSchema,
};
    `,
  };

  for (const [key, content] of Object.entries(files)) {
    const filePath = path.join(modulePath, `${moduleName}.${key}.ts`);
    fs.writeFileSync(filePath, content.trim());
    console.log(`Created: ${filePath}`);
  }

  console.log(`Module '${moduleName}' created successfully!`);
};

// Run script
const [, , moduleName] = process.argv;
generateModule(moduleName);
