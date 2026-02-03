



import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import { productService } from './product.services';
import { productFilterableFields } from './product.constant';




const createProduct = catchAsync(async (req, res) => {
  let data = req.body;
  if (typeof req.body.data === 'string') {
    data = JSON.parse(req.body.data);
  }
  const result = await productService.createProductIntoDb(data, req.user.id, req.file);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Product created successfully',
    data: result,
  });
});





const updateProduct = catchAsync(async (req, res) => {
  let data = req.body;
  if (typeof req.body.data === 'string') {
    data = JSON.parse(req.body.data);
  }
  const result = await productService.updateProductIntoDb(req.params.id, data, req.user.id, req.file);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product updated successfully',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const result = await productService.deleteProductFromDb(req.params.id, req.user.id  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product deleted successfully',
    data: result,
  });
});

const getProducts = catchAsync(async (req, res) => {
  const filters = pick(req.query, productFilterableFields);
  const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
  const result = await productService.getProductsFromDb(filters, options, req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Products retrieved successfully',
    data: result,
  });
});

const getProductById = catchAsync(async (req, res) => {
  const result = await productService.getProductByIdFromDb(req.params.id, req.user.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product details retrieved successfully',
    data: result,
  });
});

export const productController = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
