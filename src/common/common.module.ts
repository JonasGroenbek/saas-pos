import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [JwtModule.register({ secret: '$up3r$3cr3t' }), UserModule],
  exports: [JwtModule],
})
export class CommonModule {}
