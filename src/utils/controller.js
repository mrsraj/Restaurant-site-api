const handle = (service, status = 200) => async (req, res, next) => {
  try {
    const result = await service(req.body || {}, {
      user: req.user,
      restaurantId: req.restaurantId,
      params: req.params || {},
      file: req.file,
    });

    if (status === 204) return res.status(204).end();
    return res.status(status).json(result);
  } catch (error) {
    next(error);
  }
};

export default handle;
