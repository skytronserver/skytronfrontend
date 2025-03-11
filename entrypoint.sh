#!/bin/shset 
-e
# Replace environment variables in the Nginx confenvsubst 
'${API_DOMAIN} ${BHUVAN_DOMAIN} ${FONTS_DOMAIN} ${FONTS_STATIC_DOMAIN} ${OSM_DOMAIN}' < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf
# Execute the CMD from the Dockerfileexec 
"$@"