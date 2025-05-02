echo "Stopping and removing all running containers..."
docker-compose down

echo "Pruning all unused Docker images..."
docker image prune -a -f

echo "Pulling the latest changes from the main branch..."
git fetch origin main
git reset --hard origin/main

echo "Rebuilding Docker images..."
docker-compose build --no-cache

echo "Starting the containers..."
docker-compose up -d

echo "Process completed successfully!"