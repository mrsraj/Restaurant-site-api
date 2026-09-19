import handle from '../../utils/controller.js';
import service1 from '../../services/payments/create-order.service.js';
import service2 from '../../services/payments/verify.service.js';
import service3 from '../../services/payments/report-failure.service.js';
export const createOrder = handle(service1, 201);
export const verify = handle(service2, 200);
export const reportFailure = handle(service3, 200);
