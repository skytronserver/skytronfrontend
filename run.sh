sudo docker-compose build
sudo docker-compose up -d
sudo docker system prune

sudo rm /etc/nginx/sites-enabled/www.conf 
sudo rm /etc/nginx/sites-enabled/api.conf

sudo ln -s /etc/nginx/sites-available/www.conf /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api.conf /etc/nginx/sites-enabled/

sudo systemctl reload nginx
