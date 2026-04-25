sudo docker-compose build
sudo docker-compose up -d

sudo ln -s /etc/nginx/sites-available/api.conf /etc/nginx/sites-enabled/

sudo systemctl reload nginx




sudo docker-compose build \
  --build-arg http_proxy=http://192.0.2.12:8080 \
  --build-arg https_proxy=http://192.0.2.12:8080 \
  --build-arg HTTP_PROXY=http://192.0.2.12:8080 \
  --build-arg HTTPS_PROXY=http://192.0.2.12:8080 \
  --build-arg ftp_proxy=http://192.0.2.12:8080 \
  --build-arg FTP_PROXY=http://192.0.2.12:8080 \
  --no-cache app

# Remove old container first to avoid docker-compose 1.29.2 ContainerConfig bug
sudo docker-compose rm -f -s app

sudo docker-compose up -d app
 

