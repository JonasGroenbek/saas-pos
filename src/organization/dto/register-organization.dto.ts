import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class RegisterOrganizationDto {
  @ApiProperty({ required: true, type: String })
  @Type(() => String)
  @MinLength(3)
  @IsNotEmpty()
  organizationName: string;

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
