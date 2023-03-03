#!/bin/bash
docker image rm -f $(docker images -a -q)
docker rm -f $(docker ps -a -q)
docker volume rm -f $(docker volume ls -q)
docker container prune -f
docker image prune -f
docker volume prune -f