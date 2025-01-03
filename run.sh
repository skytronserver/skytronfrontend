sudo docker-compose build
sudo docker-compose up -d


sudo docker stop skytron-backend-api-container
sudo docker rm skytron-backend-api-container
docker image prune -f