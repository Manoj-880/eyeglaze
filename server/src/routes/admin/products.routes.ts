import { Router } from 'express';
import {
  getAdminProducts,
  createAdminProduct,
  getAdminProductById,
  updateAdminProduct,
  deleteAdminProduct,
  getProductsMetadata,
} from '../../controllers/admin/products.controller';

const router = Router();

router.get('/', getAdminProducts);
router.get('/metadata', getProductsMetadata);
router.post('/', createAdminProduct);
router.get('/:id', getAdminProductById);
router.put('/:id', updateAdminProduct);
router.delete('/:id', deleteAdminProduct);

export default router;

