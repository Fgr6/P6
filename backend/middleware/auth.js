const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
      /*recup du token*/
      const token = req.headers.authorization.split(' ')[1];
      /*decodage*/
      const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
      /*recup de l'id*/
      const userId = decodedToken.userId;
      req.auth = {
        userId: userId
      };
      /*comparaison des id*/
      if(req.body.userId && req.body.userId !== userId) {
        throw 'User ID non valide !';
      }else {
        next();
      }
    } catch (error) {
        res.status(401).json({ error });
    }
};