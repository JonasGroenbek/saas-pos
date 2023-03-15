#### Common

Common module is used for global dependencies that should be accessible for all modules.

The problem it solves is that if we have a general module, that exposes a service which the whole application should be able to use like the JwtModule and its JwtService

```ts
@Global()
@Module({
  imports: [JwtModule.register({ secret: '$up3r$3cr3t' }), UserModule],
  exports: [JwtModule],
})
export class CommonModule {}
```

One might logically put the JwtModule inside of the `AuthModule`, but since there is a guard dependending on the `JwtService` (`JwtGuard`), we need the `JwtService` to be global.

It is not ideal to make the `AuthModule` global, and going down the path of finding suitable existing modules for global dependencies will lead down a rabbit hole, and in the end instantiating a simple test
you need multiple seemingly unrelated modules to get their dependencies. It is much more logical to import a single module containing global dependencies.
