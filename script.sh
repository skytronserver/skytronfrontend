echo "Stopping and removing all running containers..."
docker-compose down

echo "Pruning all unused Docker images..."
docker image prune -a -f

echo "Pulling the latest changes from the nic_prod branch..."
git fetch origin nic_prod
git reset --hard origin/nic_prod


echo "Pulling the latest changes from the nic_prod branch..."
if ! git pull origin nic_prod; then
    echo "❌ Failed to pull latest changes"
    exit 1
fi

echo "Rebuilding Docker images..."
docker-compose build --no-cache

echo "Starting the containers..."
docker-compose up -d

echo "Process completed successfully!"
