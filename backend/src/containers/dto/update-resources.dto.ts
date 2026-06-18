import { IsNumber, IsOptional, Min, Max, IsIn, IsString } from 'class-validator';

export class UpdateResourcesDto {
  @IsOptional()
  @IsNumber()
  @Min(64) // minimum 64 MB
  memoryLimit?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0.1) // minimum 0.1 CPU core
  @Max(8.0) // maximum 8.0 CPU cores
  cpuLimit?: number | null;

  @IsOptional()
  @IsIn(['no', 'always', 'on-failure', 'unless-stopped'])
  restartPolicy?: string;

  @IsOptional()
  @IsString()
  volumeMountPath?: string | null;
}
