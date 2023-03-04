[![CircleCI](https://dl.circleci.com/status-badge/img/gh/JonasGroenbek/shops-service/tree/main.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/JonasGroenbek/shops-service/tree/main)

# saas-pos

## The application

This is a **Multi Tenant Application**, which means that each tenant (called organization in the project) shares software instances. This has some interesting benefits.

1. It's cost effective
2. It's scalable
3. Don't have to manage environments independently
   ![](/assets/single_multi_tenant.png 'Text to show on mouseover')

Multi tenant applications have a couple of options between their data partitioning models, it usually comes down to if each tenant should have

1. Their own database (Silo Model)
2. Tenants share tables (Pooled)
3. Anything in between, often schemas (Bridge)

This application uses the **Pooled data partitioning model**.
![](/assets/partitioning_models.png 'Text to show on mouseover')

## Running

All the below will assume docker, docker-compose user is part of the docker user organization and have privileges

##### With docker-compose

`cp ./.env.example ./.env && cp ./scheduler/.env.example ./scheduler/.env && docker-compose up`

##### With docker

`cp ./.env.example ./.env && ./run-database.sh && npm i && npm run start:dev` optionally pass -v flag to the run-database script if you want to mount a volume

##### With postgres (13+) available

`cp ./.env.example ./.env && npm run migration:up && npm i && npm run start:dev`

#### Tests

Unfortunately the tests are not availalbe to run on the docker-compose database. To run the test suite docker is required and running `npm run test` should be sufficient. If the project has not been set up `cp ./.env.example ./.env && npm i && npm run test` would do.

#### Online documentation

`http://localhost:{port}/docs`

## Testing

## Code Conventions

#### Data

This application attempts to isolate all database specific logic as much as possible. This is done through repositories. Inside these repositories

Since application uses a pooled data partioning model, it stores a tenantId (organizationId) on each table specific to an organization, which is used when querying the data in a organization specific context.

Whenever an authenticated user uses the application, he will pass an Identity to the application with an `organizationId`. This identity is passed to the query implementations in order to achieve data isolation.

That means there are some responsibilities that the programmer has to attend to.

##### Entities

All entities needs an `organizationId` if they are specific to an organization, and it is **important that it is called exactly `organizationId`**.

```ts
@Entity({ name: 'some_entity' })
export class SomeEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'organization_id', type: 'int', nullable: true })
  organizationId: number;

  @ManyToOne(() => Organization, (organization) => organization.someEntities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id', referencedColumnName: 'id' })
  organization: Organization;
```

##### Identity

When querying in a organization context, it is important that the developer make sure that the repository accepts the `Identity` in the queries. This can be using the query configurations from `BaseRepository`. But the developer has to be vary, because the where clauses have to be implemented as well.

E.g delete query

```ts
  private createDeleteQuery(queryConfig: Delete): DeleteQueryBuilder<User> {
    let query: DeleteQueryBuilder<User>;
    const queryRunner = queryConfig.queryRunner;

    if (queryRunner) {
      query = queryRunner.manager
        .getRepository(User)
        .createQueryBuilder()
        .delete();
    } else {
      this.dataSource.manager.connection.getMetadata(User);
      query = this.createQueryBuilder().delete();
    }

    identityFilter(query, queryConfig.identity);

    if (queryConfig.id) {
      query.andWhere(`id = :id`, { id: queryConfig.id });
    }

    query.returning(this.getSelectColumns(query));

    return query;
  }
```

Here the `identityFilter(query, queryConfig.identity);` is responsible for the data isolation, and without it an organization would technically be allowed to delete another ones data.

For more granular control, something like below could also be used.

```ts
if (queryConfig.identity) {
  queryBuilder.andWhere(`organizationId = :organizationId`, {
    organizationId: identity.organizationId,
  });
}
```

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

## Modules

[Organization](/src/organization/organization.documentation.md)
@import "/src/organization/organization.documentation.md"
[Shop](/src/shop/shop.documentation.md)
@import "/src/shop/shop.documentation.md"
[User](/src/user/user.documentation.md)
@import "/src/user/user.documentation.md"
[Product](/src/product/product.documentation.md)
@import "/src/product/product.documentation.md"
[Orderline](/src/orderline/orderline.documentation.md)
@import "/src/orderline/orderline.documentation.md"
[Auth](/src/auth/auth.documentation.md)
@import "/src/auth/auth.documentation.md"
[Product Group](/src/product-group/product-group.documentation.md)
@import "/src/product-group/product-group.documentation.md"
[Stock Level](/src/stock-level/stock-level.documentation.md)
@import "/src/stock-level/stock-level.documentation.md"
[Role](/src/role/role.documentation.md)
@import "/src/role/role.documentation.md"
[Sale](/src/sale/sale.documentation.md)
@import "/src/sale/sale.documentation.md"
[Transaction](/src/transaction/transaction.documentation.md)
@import "/src/transaction/transaction.documentation.md"
