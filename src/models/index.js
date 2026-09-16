// Registry keys match SQL table names.
module.exports = {
  restaurant_home: require('./restaurant-home.model'),
  categories: require('./category.model'),
  gallery: require('./gallery.model'),
  invoice: require('./invoice.model'),
  invoice_item: require('./invoice-item.model'),
  menu: require('./menu.model'),
  payment: require('./payment.model'),
  restaurant_info: require('./restaurant-info.model'),
  restaurants: require('./restaurant.model'),
  roles: require('./role.model'),
  table_reservation: require('./table-reservation.model'),
  users: require('./user.model')
};
