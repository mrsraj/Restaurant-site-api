const { EventEmitter } = require('node:events');
// Internal notifications contain IDs only; sockets refetch through authorized REST routes.
module.exports = new EventEmitter();
