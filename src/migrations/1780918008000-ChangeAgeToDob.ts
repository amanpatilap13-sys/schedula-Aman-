import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAgeToDob1780918008000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('PRAGMA foreign_keys=OFF;');

    // Create a new patient table with dob instead of age
    await queryRunner.query(`
      CREATE TABLE "patient_new" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "fullName" varchar NOT NULL,
        "dob" varchar NOT NULL,
        "gender" varchar NOT NULL,
        "contactDetails" varchar NOT NULL,
        "healthInfo" varchar,
        "userId" integer,
        CONSTRAINT "UQ_b4dfb123456789123456789abcd" UNIQUE ("userId"),
        CONSTRAINT "FK_b4dfb123456789123456789abcd" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    // Copy data from old patient table, mapping default dob '1995-01-01'
    await queryRunner.query(`
      INSERT INTO "patient_new" ("id", "fullName", "dob", "gender", "contactDetails", "healthInfo", "userId")
      SELECT "id", "fullName", '1995-01-01', "gender", "contactDetails", "healthInfo", "userId"
      FROM "patient";
    `);

    // Drop old table and rename new table
    await queryRunner.query('DROP TABLE "patient";');
    await queryRunner.query('ALTER TABLE "patient_new" RENAME TO "patient";');

    await queryRunner.query('PRAGMA foreign_keys=ON;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('PRAGMA foreign_keys=OFF;');

    // Revert dob back to age
    await queryRunner.query(`
      CREATE TABLE "patient_old" (
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

    // Copy data, calculating age roughly (using 30 as a default fallback)
    await queryRunner.query(`
      INSERT INTO "patient_old" ("id", "fullName", "age", "gender", "contactDetails", "healthInfo", "userId")
      SELECT "id", "fullName", 30, "gender", "contactDetails", "healthInfo", "userId"
      FROM "patient";
    `);

    await queryRunner.query('DROP TABLE "patient";');
    await queryRunner.query('ALTER TABLE "patient_old" RENAME TO "patient";');

    await queryRunner.query('PRAGMA foreign_keys=ON;');
  }
}
