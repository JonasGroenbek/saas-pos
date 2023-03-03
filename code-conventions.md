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

  const user = await this.userRepository.insertOne({
    entity: {
      email: userDto.email,
      password: await argon2.hash(userDto.password),
      firstName: userDto.firstName,
      lastName: userDto.lastName,
    },
  });

  return user;
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

  const user = await this.userRepository.insertOne({
    entity: {
      email: userDto.email,
      password: await argon2.hash(userDto.password),
      firstName: userDto.firstName,
      lastName: userDto.lastName,
    },
  });

  return user;
}
```
