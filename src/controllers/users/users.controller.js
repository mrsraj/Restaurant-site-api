import handle from '../../utils/controller.js';
import service1 from '../../services/users/register.service.js';
import service2 from '../../services/users/list.service.js';
export const register = handle(service1, 201);
export const list = handle(service2, 200);
export const me = (req, res) => res.json({ ...req.user, user_id: req.user.id });
