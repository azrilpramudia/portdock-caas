import { IsNumber, IsOptional, Min, Max, IsIn, IsString } from 'class-validator';

export class UpdateResourcesDto {
  @IsOptional()
  @IsNumber()
  @Min(128) // minimum 128 MB
  @Max(512) // maximum 512 MB
  memoryLimit?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0.1) // minimum 0.1 CPU core
  @Max(0.5) // maximum 0.5 CPU core
  cpuLimit?: number | null;

  @IsOptional()
  @IsIn(['no', 'always', 'on-failure', 'unless-stopped'])
  restartPolicy?: string;

  @IsOptional()
  @IsString()
  volumeMountPath?: string | null;
}
