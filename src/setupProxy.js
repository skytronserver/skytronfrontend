const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/mappls",
        createProxyMiddleware({
            target: "https://search.mappls.com",
            changeOrigin: true,
            secure: false,
            pathRewrite: {
                "^/mappls": "",
            },
            onProxyReq: function (proxyReq) {
                proxyReq.setHeader("origin", "https://search.mappls.com");
            },
        })
    );

    app.use(
        "/mappls-place",
        createProxyMiddleware({
            target: "https://place.mappls.com",
            changeOrigin: true,
            secure: false,
            pathRewrite: {
                "^/mappls-place": "",
            },
            onProxyReq: function (proxyReq) {
                proxyReq.setHeader("origin", "https://place.mappls.com");
            },
        })
    );
};
