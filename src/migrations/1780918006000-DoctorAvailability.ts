import { MigrationInterface, QueryRunner } from 'typeorm';

export class DoctorAvailability1780918006000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create recurring_availability table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "recurring_availability" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "dayOfWeek" varchar NOT NULL,
        "startTime" varchar NOT NULL,
        "endTime" varchar NOT NULL,
        "doctorId" integer,
        CONSTRAINT "FK_recurring_doctor" FOREIGN KEY ("doctorId") REFERENCES "doctor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 2. Create custom_availability table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "custom_availability" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "date" varchar NOT NULL,
        "startTime" varchar,
        "endTime" varchar,
        "isAvailable" boolean NOT NULL DEFAULT 1,
        "doctorId" integer,
        CONSTRAINT "FK_custom_doctor" FOREIGN KEY ("doctorId") REFERENCES "doctor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // 3. Alter doctor table to make availability nullable in SQLite
    await queryRunner.query('PRAGMA foreign_keys=OFF;');
    
    await queryRunner.query(`
      CREATE TABLE "doctor_new" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "fullName" varchar NOT NULL,
        "specialization" varchar NOT NULL,
        "experience" integer NOT NULL,
        "qualification" varchar NOT NULL,
        "consultationFee" float NOT NULL,
        "availability" varchar,
        "profileDetails" varchar,
        "userId" integer,
        CONSTRAINT "UQ_a3dfb123456789123456789abcd" UNIQUE ("userId"),
        CONSTRAINT "FK_a3dfb123456789123456789abcd" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await queryRunner.query(`
      INSERT INTO "doctor_new" ("id", "fullName", "specialization", "experience", "qualification", "consultationFee", "availability", "profileDetails", "userId")
      SELECT "id", "fullName", "specialization", "experience", "qualification", "consultationFee", "availability", "profileDetails", "userId"
      FROM "doctor";
    `);

    await queryRunner.query('DROP TABLE "doctor";');
    await queryRunner.query('ALTER TABLE "doctor_new" RENAME TO "doctor";');

    await queryRunner.query('PRAGMA foreign_keys=ON;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('PRAGMA foreign_keys=OFF;');

    // Revert doctor table availability column to NOT NULL
    await queryRunner.query(`
      CREATE TABLE "doctor_old" (
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

    await queryRunner.query(`
      INSERT INTO "doctor_old" ("id", "fullName", "specialization", "experience", "qualification", "consultationFee", "availability", "profileDetails", "userId")
      SELECT "id", "fullName", "specialization", "experience", "qualification", "consultationFee", COALESCE("availability", 'Not Specified'), "profileDetails", "userId"
      FROM "doctor";
    `);

    await queryRunner.query('DROP TABLE "doctor";');
    await queryRunner.query('ALTER TABLE "doctor_old" RENAME TO "doctor";');

    await queryRunner.query('PRAGMA foreign_keys=ON;');

    await queryRunner.query('DROP TABLE IF EXISTS "custom_availability";');
    await queryRunner.query('DROP TABLE IF EXISTS "recurring_availability";');
  }
}
