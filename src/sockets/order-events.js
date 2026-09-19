import { EventEmitter } from 'node:events';

// Internal notifications contain IDs only; sockets refetch through authorized REST routes.
export default new EventEmitter();
