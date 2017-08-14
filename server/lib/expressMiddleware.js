const crossOriginMiddleware = (req, res, next) => {
  if (process.env.CROSS_SITE_ORIGINS) {
      let allowedOrigins = process.env.CROSS_SITE_ORIGINS.split(',');
 
      let origin = req.headers.origin;
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

      if(allowedOrigins.indexOf(origin) > -1){
          res.setHeader('Access-Control-Allow-Origin', origin);
      }
      
      return next();
  }
}


module.exports = {
  crossOrigin: crossOriginMiddleware
};