#!/bin/bash
source .env
PASSWORD="$POSTGRES_PASSWORD"
NAME="$POSTGRES_DB"
PORT="$POSTGRES_PORT"

has_param() {
    local term="$1"
    shift
    for arg; do
        if [[ $arg == "$term" ]]; then
            return 0
        fi
    done
    return 1
}

if has_param '-v' "$@"; then
echo "With volume"
docker run -d --name shops-postgres -e POSTGRES_PASSWORD="$PASSWORD" -v ${HOME}/postgres-data/:/var/lib/postgresql/data -p "$PORT":"$PORT" postgres:13.4 && npm run migration:up
else
echo "Without volume"
docker run -d --name shops-postgres -e POSTGRES_PASSWORD="$PASSWORD" -p "$PORT":"$PORT" postgres:13.4 && npm run migration:up
fi