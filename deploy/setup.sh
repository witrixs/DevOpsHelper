#!/usr/bin/env bash
# Run as root on the production server after Docker Engine + Compose are installed.
# Create deploy user first:
#   useradd --system --create-home --shell /bin/bash devopshelper-deploy
#   # add SSH key for that user
set -euo pipefail
cd "$(dirname "$0")/.."

docker info >/dev/null
docker compose version
id devopshelper-deploy >/dev/null

install -d -m 755 /opt/devopshelper /opt/devopshelper/assets
install -d -m 700 -o devopshelper-deploy -g devopshelper-deploy /opt/devopshelper/incoming

if [ ! -e /opt/devopshelper/.env ]; then
  install -m 600 deploy/.env.example /opt/devopshelper/.env
  echo "Created /opt/devopshelper/.env — edit secrets before first release"
fi

install -m 644 deploy/compose.yml /opt/devopshelper/compose.yml
install -m 755 deploy/release.sh /usr/local/sbin/devopshelper-release

printf 'devopshelper-deploy ALL=(root) NOPASSWD: /usr/local/sbin/devopshelper-release\n' \
  > /etc/sudoers.d/devopshelper-deploy
chmod 440 /etc/sudoers.d/devopshelper-deploy
visudo -cf /etc/sudoers.d/devopshelper-deploy
