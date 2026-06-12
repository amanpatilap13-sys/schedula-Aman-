import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppointmentSchema1780918007000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "appointment" (
        "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "date" varchar NOT NULL,
        "startTime" varchar NOT NULL,
        "endTime" varchar NOT NULL,
        "status" varchar NOT NULL DEFAULT 'booked',
        "doctorId" integer,
        "patientId" integer,
        CONSTRAINT "FK_appointment_doctor" FOREIGN KEY ("doctorId") REFERENCES "doctor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "FK_appointment_patient" FOREIGN KEY ("patientId") REFERENCES "patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "appointment";`);
  }
}
