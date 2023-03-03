[![CircleCI](https://dl.circleci.com/status-badge/img/gh/JonasGroenbek/shops-service/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/JonasGroenbek/shops-service/tree/main)

#### How to run

All the below will assume docker, docker-compose user is part of the docker user organization and have privileges

###### With docker-compose

`cp ./.env.example ./.env && cp ./scheduler/.env.example ./scheduler/.env && docker-compose up`

###### With docker

`cp ./.env.example ./.env && ./run-database.sh && npm i && npm run start:dev` optionally pass -v flag to the run-database script if you want to mount a volume

###### With postgres (13+) available

`cp ./.env.example ./.env && npm run migration:up && npm i && npm run start:dev`

#### How to run tests

Unfortunately the tests are not availalbe to run on the docker-compose database. To run the test suite docker is required and running `npm run test` should be sufficient. If the project has not been set up `cp ./.env.example ./.env && npm i && npm run test` would do.

#### Documentation

`http://localhost:{port}/docs`
# saas-pos
