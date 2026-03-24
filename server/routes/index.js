import { Router } from 'express';

import authRouter          from './auth.js';
import usersRouter         from './users.js';
import modulesRouter       from './modules.js';
import materialTypesRouter from './materialTypes.js';
import materialsRouter     from './materials.js';
import productsRouter      from './products.js';
import ordersRouter        from './orders.js';
import customersRouter     from './customers.js';
import settingsRouter      from './settings.js';
import systemRouter        from './system.js';
import yearReviewRouter    from './yearReview.js';

const router = Router();

router.use(authRouter);
router.use(usersRouter);
router.use(modulesRouter);
router.use(materialTypesRouter);
router.use(materialsRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(customersRouter);
router.use(settingsRouter);
router.use(systemRouter);
router.use(yearReviewRouter);

export default router;
