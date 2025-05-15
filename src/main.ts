import { ValidationPipe } from '@nestjs/common';
import { NestFactory} from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ origin: true });
  app.use(json({ limit: '10mb'}));
  app.use(urlencoded( { extended: true, limit: '10mb'}));

  const config = new DocumentBuilder()
  .setTitle('Api Talent Match')
  .setDescription('Documentación de la api de Talent Match')
  .setVersion('1.0')
  .addTag('Talent Match')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
    'access-token', 
  )
  .build();
  
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
