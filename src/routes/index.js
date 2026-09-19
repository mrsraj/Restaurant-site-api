import { Router } from 'express';
import authRoutes from './auth.routes.js';
import homeRoutes from './home.routes.js';
import usersRoutes from './users.routes.js';
import menuRoutes from './menu.routes.js';
import categoriesRoutes from './categories.routes.js';
import uploadsRoutes from './uploads.routes.js';
import ordersRoutes from './orders.routes.js';
import reservationsRoutes from './reservations.routes.js';
import paymentsRoutes from './payments.routes.js';
import restaurantsRoutes from './restaurants.routes.js';
import staffRoutes from './staff.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use(authRoutes);
router.use('/home', homeRoutes);
router.use('/users', usersRoutes);
router.use('/menu-items', menuRoutes);
router.use('/categories', categoriesRoutes);
router.use('/uploads', uploadsRoutes);
router.use('/orders', ordersRoutes);
router.use('/reservations', reservationsRoutes);
router.use(paymentsRoutes);
router.use('/restaurants', restaurantsRoutes);
router.use('/staff', staffRoutes);

export default router;
