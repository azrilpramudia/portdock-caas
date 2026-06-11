import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import helmet from 'helmet';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ensure uploads directory exists
  fs.mkdirSync('./uploads/tmp', { recursive: true });

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  // Global Zod validation pipe
  app.useGlobalPipes(new ZodValidationPipe());

  // API prefix
  app.setGlobalPrefix('api');



  // Swagger docs
  const config = new DocumentBuilder()
    .setTitle('Portdock API')
    .setDescription('Portdock - Docker Deployment Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
