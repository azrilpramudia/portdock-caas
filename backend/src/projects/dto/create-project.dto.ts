import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { DeploymentType } from '@prisma/client';

export class CreateProjectDto {
  @ApiProperty({ example: 'My Awesome App' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'A cool web application' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: DeploymentType })
  @IsEnum(DeploymentType)
  deploymentType: DeploymentType;

  @ApiPropertyOptional({ example: 'https://github.com/user/repo' })
  @IsOptional()
  @IsString()
  repositoryUrl?: string;

  @ApiPropertyOptional({ example: 'myapp.portdock.io' })
  @IsOptional()
  @IsString()
  domain?: string;
}
