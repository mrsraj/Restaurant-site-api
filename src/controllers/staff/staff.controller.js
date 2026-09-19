import handle from '../../utils/controller.js';
import service1 from '../../services/staff/list.service.js';
import service2 from '../../services/staff/create.service.js';
export const list = handle(service1, 200);
export const create = handle(service2, 201);
