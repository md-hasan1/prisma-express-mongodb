import { Router } from 'express';

import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { productValidation } from './product.validation';
import { productController } from './product.controller';
import { fileUploader } from '../../../helpars/fileUploader';
import auth from '../../middlewares/auth';

const router = express.Router();



// Create Product
router.post(
	'/',
	auth(),
	fileUploader.upload.single('image'),
	validateRequest(productValidation.createProductValidationSchema),
	productController.createProduct
);

// Get all Products
router.get('/', auth(), productController.getProducts);

// Get Product by ID
router.get('/:id', auth(), productController.getProductById);

// Update Product
router.put(
	'/:id',
	auth(),
	fileUploader.upload.single('image'),
	validateRequest(productValidation.updateProductValidationSchema),
	productController.updateProduct
);

// Delete Product
router.delete('/:id', auth(), productController.deleteProduct);

export default router;
