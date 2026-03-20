import { Router } from 'express';

import authRouter          from './auth.js';
import usersRouter         from './users.js';
import modulesRouter       from './modules.js';
import materialTypesRouter from './materialTypes.js';
import materialsRouter     from './materials.js';
import settingsRouter      from './settings.js';
import systemRouter        from './system.js';

const router = Router();

router.use(authRouter);
router.use(usersRouter);
router.use(modulesRouter);
router.use(materialTypesRouter);
router.use(materialsRouter);
router.use(settingsRouter);
router.use(systemRouter);

export default router;
