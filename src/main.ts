import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {ValidationPipe} from "@nestjs/common";
import {NestExpressApplication} from "@nestjs/platform-express";
import * as path from "path";
import * as csurf from 'csurf';
import {AllExceptionFilter} from "./all-exception.filter";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors: true});
  app.useGlobalPipes(new ValidationPipe());

  app.use(cookieParser());
  // app.use(csurf());

  const options = new DocumentBuilder()
    .setTitle('Api')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('ABZ task')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/swagger', app, document);

  app.setBaseViewsDir(path.resolve(path.join(__dirname, '..', 'view')));
  app.setViewEngine('twig');

  app.useGlobalFilters(new AllExceptionFilter());//only here can catch csrf exception

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
