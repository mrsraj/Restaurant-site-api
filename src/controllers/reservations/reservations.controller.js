import handle from '../../utils/controller.js';
import service1 from '../../services/reservations/create.service.js';
import service2 from '../../services/reservations/list.service.js';
import service3 from '../../services/reservations/update.service.js';
export const create = handle(service1, 201);
export const list = handle(service2, 200);
export const update = handle(service3, 200);
