import { Router } from 'express';
import { IndexController } from '../controllers';

const router = Router();
const indexController = new IndexController();

router.get('/', indexController.getIndex.bind(indexController));

export default router;