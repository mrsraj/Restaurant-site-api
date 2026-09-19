import handle from '../../utils/controller.js';
import service1 from '../../services/categories/list.service.js';
export const list = handle(service1, 200);
