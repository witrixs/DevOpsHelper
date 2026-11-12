#!/usr/bin/env bash
set -euo pipefail

release="${1:?Commit SHA required}"
[[ "$release" =~ ^[a-f0-9]{40}$ ]]

cd /opt/devopshelper
exec 9>/opt/devopshelper/deploy.lock
flock -x 9

test -s .env
archive="/opt/devopshelper/incoming/$release.tar.gz"
test -s "$archive"

docker load -i "$archive"
image="devopshelper:$release"
docker image inspect "$image" >/dev/null

previous=$(cat /opt/devopshelper/current-image 2>/dev/null || true)

container=$(docker create "$image")
trap 'docker rm "$container" >/dev/null 2>&1 || true' EXIT
docker cp "$container:/app/web/dist/assets/." /opt/devopshelper/assets/ 2>/dev/null || mkdir -p /opt/devopshelper/assets
docker rm "$container" >/dev/null
trap - EXIT

compose() {
  DEVOPSHELPER_IMAGE="$1" docker compose --project-name devopshelper --file /opt/devopshelper/compose.yml up -d --no-build --force-recreate
}

restore() {
  if [ -n "$previous" ]; then
    compose "$previous"
  fi
}

if ! compose "$image"; then
  restore
  exit 1
fi

host="$(awk -F= '/^APP_HOST=/{gsub(/^[ \t"\047]+|[ \t"\047]+$/, "", $2); print $2; exit}' .env)"
port="$(awk -F= '/^APP_PORT=/{gsub(/^[ \t"\047]+|[ \t"\047]+$/, "", $2); print $2; exit}' .env)"
host="${host:-127.0.0.1}"
port="${port:-8000}"
case "$host" in 0.0.0.0|::|[::]) host=127.0.0.1 ;; esac

healthy=false
for attempt in $(seq 1 30); do
  if curl --fail --silent --max-time 2 "http://${host}:${port}/api/health" >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done

if [ "$healthy" != true ]; then
  echo "Healthcheck failed — rolling back"
  restore
  exit 1
fi

printf '%s\n' "$image" > /opt/devopshelper/current-image
rm -f "$archive"
echo "Released $image"
