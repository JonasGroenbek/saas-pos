[![CircleCI](https://dl.circleci.com/status-badge/img/gh/JonasGroenbek/shops-service/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/JonasGroenbek/shops-service/tree/main)

# saas-pos

## The application

This application is a multi tenant application, which means that each tenant (called organization in the project) shares ressources like data, services

## Running

All the below will assume docker, docker-compose user is part of the docker user organization and have privileges

##### With docker-compose

`cp ./.env.example ./.env && cp ./scheduler/.env.example ./scheduler/.env && docker-compose up`

##### With docker

`cp ./.env.example ./.env && ./run-database.sh && npm i && npm run start:dev` optionally pass -v flag to the run-database script if you want to mount a volume

##### With postgres (13+) available

`cp ./.env.example ./.env && npm run migration:up && npm i && npm run start:dev`

#### Testing

Unfortunately the tests are not availalbe to run on the docker-compose database. To run the test suite docker is required and running `npm run test` should be sufficient. If the project has not been set up `cp ./.env.example ./.env && npm i && npm run test` would do.

#### Online documentation

`http://localhost:{port}/docs`

## Code Conventions

#### Data

Since application is a multi tenant application with a pooled data partioning model. That means it uses shared resources, that goes for data as well.
This application specifically stores a tenantId (organizationId) on each table specific to an organization, which is used when querying data.

Whenever an authenticated user uses the application, he will pass an Identity to the application with an organizationId. This identity is passed to the
query implementations in order to achieve data isolation.

That means there are some responsibilities are left to the individual programmer.

entities

passing identity | null

identityFilter

organizationId on entities

insertions

#### Error handling

Generally speaking, error handling should be lifted up as high as possible. That means if error handling can be handled outside of implementations, like in guards or pipes it is preferred.

However, it often is required to do service specific error handling. When doing that, extract the validation functionality to an external funciton, to keep the functions as readable as possible.

##### Function with error handling (not preferred)

```ts
async registerUser(userDto: RegisterUserDto): Promise<User> {
  const conflictingUser = await this.userRepository.getOne({
    where: { email: email },
  });

  if (conflictingUser) {
    throw new HttpException('Email already exists', HttpStatus.CONFLICT);
  }
  //...
}
```

##### Function with error handling (preferred)

```ts
private async validateUserDoesNotExist(email: string) {
  const conflictingUser = await this.userRepository.getOne({
    where: { email: email },
  });

  if (conflictingUser) {
    throw new HttpException('Email already exists', HttpStatus.CONFLICT);
  }
}

async registerUser(userDto: RegisterUserDto): Promise<User> {
  await this.validateUserDoesNotExist();
  //...
}
```
