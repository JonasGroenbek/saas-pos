#!/bin/bash
source .env
PASSWORD="$TEST_POSTGRES_PASSWORD"
PORT="$TEST_POSTGRES_PORT"

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
    docker run -d --restart=always --name shops-test-postgres -e POSTGRES_PASSWORD="$PASSWORD" -v ${HOME}/postgres-data/:/var/lib/postgresql/data -p "$PORT":5432 postgres:13.4 && npm run migration:test:up
else
    echo "Without volume"
    docker run -d --restart=always --name shops-test-postgres -e POSTGRES_PASSWORD="$PASSWORD" -p "$PORT":5432 postgres:13.4 && npm run migration:test:up
fi