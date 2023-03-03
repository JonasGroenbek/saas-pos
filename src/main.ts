import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({ preflightContinue: true });

  const config = new DocumentBuilder()
    .setTitle('Posibel service')
    .setDescription('Documentation for Posibel service endpoints')
    .setVersion('1.0')
    .addTag('Shopes')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  await app.listen(process.env.API_PORT || 8081);
}

bootstrap();
