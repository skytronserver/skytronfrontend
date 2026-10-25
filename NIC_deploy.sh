#!/bin/bash
set -e

# Proxy settings — applied to this script and all child processes
export http_proxy="http://192.0.2.12:8080"
export https_proxy="http://192.0.2.12:8080"
export HTTP_PROXY="http://192.0.2.12:8080"
export HTTPS_PROXY="http://192.0.2.12:8080"
export ftp_proxy="http://192.0.2.12:8080"
export FTP_PROXY="http://192.0.2.12:8080"
# Internal VMs must not go through the proxy
export no_proxy="localhost,127.0.0.1,10.192.136.0/24"
export NO_PROXY="$no_proxy"

# Second frontend VM behind the load balancer. Set SECONDARY_HOST= to skip it.
SECONDARY_HOST="${SECONDARY_HOST-Admin@10.192.136.212}"
# Repo location on the second VM (defaults to the same path as here)
SECONDARY_DIR="${SECONDARY_DIR:-$(pwd)}"
IMAGE="skytron-frontend:latest"
IMAGE_TAR="/tmp/skytron-frontend-image.tar.gz"

cleanup_logs() {
  # Only delete regular files — the glob also matches dirs like /var/log/unattended-upgrades
  sudo find /var/log -maxdepth 1 -type f \( -name '*.gz' -o -name '*-????????' \) -delete
  sudo journalctl --vacuum-size=100M || true
  for f in mail.log mail.info mail.warn mail.err mail syslog.1 warn sudo.log aide; do
    if sudo test -f "/var/log/$f"; then
      sudo truncate -s 0 "/var/log/$f"
    fi
  done
}

git pull

cleanup_logs

sudo docker system prune -f

sudo docker-compose build --pull \
  --build-arg http_proxy=http://192.0.2.12:8080 \
  --build-arg https_proxy=http://192.0.2.12:8080 \
  --build-arg HTTP_PROXY=http://192.0.2.12:8080 \
  --build-arg HTTPS_PROXY=http://192.0.2.12:8080 \
  --build-arg ftp_proxy=http://192.0.2.12:8080 \
  --build-arg FTP_PROXY=http://192.0.2.12:8080 \
  --no-cache app

# Remove the old container (and its anonymous volume) before starting the new
# one. docker-compose 1.x crashes with "KeyError: 'ContainerConfig'" when it
# tries to recreate a container in place on newer Docker engines — that is
# why a manual prune + rerun used to be needed.
sudo docker-compose rm -fsv app
sudo docker-compose up -d --no-build app
sudo docker system prune -f

echo "==> Deployed on $(hostname)"

# ---------- Second VM: copy repo + .env and ship the image built above ----------
if [ -z "$SECONDARY_HOST" ]; then
  echo "==> SECONDARY_HOST empty, skipping second VM"
  exit 0
fi

echo "==> Deploying to $SECONDARY_HOST:$SECONDARY_DIR"

# Reuse one SSH connection so the password (if no key is set up) is asked only once
SSH_CTL="/tmp/nic-deploy-ssh-%r@%h:%p"
SSH_OPTS=(-o ControlMaster=auto -o ControlPath="$SSH_CTL" -o ControlPersist=10m)
trap 'ssh "${SSH_OPTS[@]}" -O exit "$SECONDARY_HOST" 2>/dev/null || true; rm -f "$IMAGE_TAR"' EXIT

ssh "${SSH_OPTS[@]}" "$SECONDARY_HOST" "mkdir -p '$SECONDARY_DIR'"

# Copy the working tree, including .env (gitignored, so git pull there would miss it)
tar -czf - --exclude=./node_modules --exclude=./build --exclude=./.git . \
  | ssh "${SSH_OPTS[@]}" "$SECONDARY_HOST" "tar -xzf - -C '$SECONDARY_DIR'"

# Ship the exact image just built here instead of rebuilding on the second VM
sudo docker save "$IMAGE" | gzip > "$IMAGE_TAR"
sudo chmod a+r "$IMAGE_TAR"
scp "${SSH_OPTS[@]}" "$IMAGE_TAR" "$SECONDARY_HOST:$IMAGE_TAR"

# -t so sudo on the remote side can prompt for a password if needed
ssh -t "${SSH_OPTS[@]}" "$SECONDARY_HOST" "set -e
  cd '$SECONDARY_DIR'
  sudo docker load -i '$IMAGE_TAR'
  rm -f '$IMAGE_TAR'
  sudo docker-compose rm -fsv app
  sudo docker-compose up -d --no-build app
  sudo docker system prune -f
  echo \"==> Deployed on \$(hostname)\""
