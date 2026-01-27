const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/bhuvan-proxy',
    createProxyMiddleware({
      target: 'https://bhuvan-vec3.nrsc.gov.in',
      changeOrigin: true,
      pathRewrite: {
        '^/bhuvan-proxy': '/bhuvan',
      },
    })
  );
};
