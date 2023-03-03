import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ required: true, type: Number })
  @Type(() => Number)
  @IsNumber()
  organizationId: number;

  @ApiProperty({ required: true, type: Number })
  @Type(() => Number)
  @IsNumber()
  roleId: number;

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

  @ApiProperty({ required: true, type: String })
  @Type(() => String)
  @MinLength(9)
  @IsNotEmpty()
  confirmationPassword: string;

  @ApiProperty({ required: true, type: String })
  @Type(() => String)
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ required: true, type: String })
  @Type(() => String)
  @MinLength(2)
  @MaxLength(100)
  @IsNotEmpty()
  lastName: string;
}
