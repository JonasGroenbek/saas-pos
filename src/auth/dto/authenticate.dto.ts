import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class AuthenticateDto {
  @ApiProperty({ required: true, type: String })
  @Type(() => String)
  @MinLength(5)
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true, type: String })
  @Type(() => String)
  @MinLength(9)
  @IsNotEmpty()
  password: string;
}
