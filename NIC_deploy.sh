#!/bin/bash
set -e

# Proxy settings — applied to this script and all child processes
export http_proxy="http://192.0.2.12:8080"
export https_proxy="http://192.0.2.12:8080"
export HTTP_PROXY="http://192.0.2.12:8080"
export HTTPS_PROXY="http://192.0.2.12:8080"
export ftp_proxy="http://192.0.2.12:8080"
export FTP_PROXY="http://192.0.2.12:8080"
 
git pull

# Run with sudo — scripts have their own env/Docker setup
 
# Only delete regular files — the glob also matches dirs like /var/log/unattended-upgrades
sudo find /var/log -maxdepth 1 -type f \( -name '*.gz' -o -name '*-????????' \) -delete
sudo journalctl --vacuum-size=100M || true
for f in mail.log mail.info mail.warn mail.err mail syslog.1 warn sudo.log aide; do
  if sudo test -f "/var/log/$f"; then
    sudo truncate -s 0 "/var/log/$f"
  fi
done


sudo docker system prune -f

sudo docker-compose build --pull \
  --build-arg http_proxy=http://192.0.2.12:8080 \
  --build-arg https_proxy=http://192.0.2.12:8080 \
  --build-arg HTTP_PROXY=http://192.0.2.12:8080 \
  --build-arg HTTPS_PROXY=http://192.0.2.12:8080 \
  --build-arg ftp_proxy=http://192.0.2.12:8080 \
  --build-arg FTP_PROXY=http://192.0.2.12:8080 \
  --no-cache app


sudo docker-compose up -d app
sudo docker system prune -f
sudo docker-compose up -d app
