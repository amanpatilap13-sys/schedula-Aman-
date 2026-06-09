import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
<<<<<<< HEAD
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
=======
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
>>>>>>> c2b0c1e (Implement role based authentication system)

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();