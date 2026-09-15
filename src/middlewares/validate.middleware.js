exports.body = (req, res, next) => {
  if (req.body !== undefined && (req.body === null || Array.isArray(req.body)))
    return res.status(400).json({ message: 'Request body must be a JSON object' });
  req.body ??= {};
  next();
};
exports.resourceId = (req, res, next) => {
  const match = /^\/(?:orders|menu-items|reservations)\/([^/]+)/.exec(req.path);
  if (match && (!/^[1-9]\d*$/.test(match[1]) || !Number.isSafeInteger(Number(match[1]))))
    return res.status(400).json({ message: 'Resource ID must be a positive integer' });
  next();
};
