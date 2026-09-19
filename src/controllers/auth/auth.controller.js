import handle from '../../utils/controller.js';
import service1 from '../../services/auth/login.service.js';
import service2 from '../../services/auth/request-password-reset.service.js';
import service3 from '../../services/auth/reset-password.service.js';
export const login = handle(service1, 201);
export const requestPasswordReset = handle(service2, 200);
export const resetPassword = handle(service3, 200);
