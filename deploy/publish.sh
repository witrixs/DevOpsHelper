#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_KEY:?Missing DEPLOY_KEY}"
: "${DEPLOY_KNOWN_HOSTS:?Missing DEPLOY_KNOWN_HOSTS}"
: "${DEPLOY_HOST:?Missing DEPLOY_HOST}"
: "${DEPLOY_USER:?Missing DEPLOY_USER}"
: "${GITHUB_SHA:?Missing GITHUB_SHA}"

[[ "$GITHUB_SHA" =~ ^[a-f0-9]{40}$ ]]
[[ "$DEPLOY_HOST" =~ ^[a-zA-Z0-9.-]+$ ]]
[[ "$DEPLOY_USER" =~ ^[a-zA-Z0-9_-]+$ ]]

port="${DEPLOY_PORT:-22}"
[[ "$port" =~ ^[0-9]+$ ]]

ssh_dir=$(mktemp -d)
trap 'rm -rf "$ssh_dir"' EXIT
chmod 700 "$ssh_dir"
printf '%s\n' "$DEPLOY_KEY" > "$ssh_dir/key"
printf '%s\n' "$DEPLOY_KNOWN_HOSTS" > "$ssh_dir/known_hosts"
chmod 600 "$ssh_dir/key" "$ssh_dir/known_hosts"

ssh_options=(
  -i "$ssh_dir/key"
  -o BatchMode=yes
  -o StrictHostKeyChecking=yes
  -o "UserKnownHostsFile=$ssh_dir/known_hosts"
  -o ConnectTimeout=15
  -p "$port"
)
remote="$DEPLOY_USER@$DEPLOY_HOST"

# Image is built on the CI runner and transferred without a registry.
docker save "devopshelper:$GITHUB_SHA" | gzip | ssh "${ssh_options[@]}" "$remote" \
  "cat > /opt/devopshelper/incoming/$GITHUB_SHA.tar.gz"

ssh "${ssh_options[@]}" "$remote" "sudo -n /usr/local/sbin/devopshelper-release $GITHUB_SHA"
