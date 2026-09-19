import handle from '../../utils/controller.js';
import service1 from '../../services/orders/create.service.js';
import service2 from '../../services/orders/list.service.js';
import service3 from '../../services/orders/get.service.js';
import service4 from '../../services/orders/update.service.js';
export const create = handle(service1, 201);
export const list = handle(service2, 200);
export const get = handle(service3, 200);
export const update = handle(service4, 200);
