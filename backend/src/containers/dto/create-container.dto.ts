import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateContainerDto {
  @ApiProperty({ example: 'my-app-container' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'myapp' })
  @IsNotEmpty()
  @IsString()
  imageName: string;

  @ApiPropertyOptional({ example: 'latest' })
  @IsOptional()
  @IsString()
  imageTag?: string;

  @ApiProperty({ example: 3000 })
  @IsNumber()
  @Min(1)
  @Max(65535)
  internalPort: number;

  @ApiPropertyOptional({ example: 8080 })
  @IsOptional()
  @IsNumber()
  @Min(1024)
  @Max(65535)
  hostPort?: number;

  @ApiPropertyOptional({ example: 'myapp' })
  @IsOptional()
  @IsString()
  subdomain?: string;
}
