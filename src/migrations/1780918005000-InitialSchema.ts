import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1780918005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "name" varchar NOT NULL,
        "email" varchar NOT NULL,
        "password" varchar NOT NULL,
        "role" text NOT NULL,
        CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")
      );
    `);

    // Create doctor table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "doctor" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "fullName" varchar NOT NULL,
        "specialization" varchar NOT NULL,
        "experience" integer NOT NULL,
        "qualification" varchar NOT NULL,
        "consultationFee" float NOT NULL,
        "availability" varchar NOT NULL,
        "profileDetails" varchar,
        "userId" integer,
        CONSTRAINT "UQ_a3dfb123456789123456789abcd" UNIQUE ("userId"),
        CONSTRAINT "FK_a3dfb123456789123456789abcd" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Create patient table if it doesn't exist
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patient" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "fullName" varchar NOT NULL,
        "age" integer NOT NULL,
        "gender" varchar NOT NULL,
        "contactDetails" varchar NOT NULL,
        "healthInfo" varchar,
        "userId" integer,
        CONSTRAINT "UQ_b4dfb123456789123456789abcd" UNIQUE ("userId"),
        CONSTRAINT "FK_b4dfb123456789123456789abcd" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "patient";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "doctor";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user";`);
  }
}
