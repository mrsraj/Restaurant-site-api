import handle from '../../utils/controller.js';
import service1 from '../../services/uploads/create.service.js';
export const create = handle(service1, 201);
