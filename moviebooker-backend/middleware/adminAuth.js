const auth = require('./auth');

const adminAuth = async (req, res, next) => {
  auth(req, res, () => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  });
};

module.exports = adminAuth;
