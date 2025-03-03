sudo docker-compose build
sudo docker-compose up -d
sudo docker system prune
sudo ln -s /etc/nginx/sites-available/www.conf /etc/nginx/sites-enabled/

sudo systemctl reload nginx
