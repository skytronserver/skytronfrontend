#!/bin/sh
set -e

# Replace environment variables in the Nginx conf
envsubst '${API_DOMAIN} ${BHUVAN_DOMAIN} ${FONTS_DOMAIN} ${FONTS_STATIC_DOMAIN} ${OSM_DOMAIN}' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf    

# Reload nginx instead of starting a new instance
nginx -s reload || nginx -g 'daemon off;'
