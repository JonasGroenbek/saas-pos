import { MigrationInterface, QueryRunner } from "typeorm";

export class megaMigration1677794129679 implements MigrationInterface {
    name = 'megaMigration1677794129679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "sale" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "organization_id" integer NOT NULL, "shop_id" integer, "discount_percentage" numeric(10,3) DEFAULT '0', "discount_amount" numeric(10,3) DEFAULT '0', "total_amount" numeric(14,3) NOT NULL DEFAULT '0', CONSTRAINT "PK_d03891c457cbcd22974732b5de2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stock_level" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "amount" numeric(10,3), "organization_id" integer NOT NULL, "product_id" integer NOT NULL, "shop_id" integer NOT NULL, CONSTRAINT "PK_88ff7d9dfb57dc9d435e365eb69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shop" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL, "organization_id" integer NOT NULL, "meta" jsonb, CONSTRAINT "PK_ad47b7c6121fe31cb4b05438e44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."role_policies_enum" AS ENUM('*.*', 'auth.*', 'auth.login')`);
        await queryRunner.query(`CREATE TABLE "role" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL, "organization_id" integer NOT NULL, "policies" "public"."role_policies_enum" array NOT NULL DEFAULT '{}', CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "email" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "password" character varying NOT NULL, "organization_id" integer, "role_id" integer NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transaction" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "organization_id" integer NOT NULL, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_group" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL, "organization_id" integer NOT NULL, CONSTRAINT "PK_8c03e90007cd9645242e594a041" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organization" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orderline_orderline_type_enum" AS ENUM('return', 'sale')`);
        await queryRunner.query(`CREATE TABLE "orderline" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "organization_id" integer NOT NULL, "orderline_type" "public"."orderline_orderline_type_enum" NOT NULL DEFAULT 'sale', "amount" numeric(10,3) NOT NULL, "discount_percentage" numeric(10,3), "discount_amount" numeric(10,3) DEFAULT '0', "product_id" integer NOT NULL, "sale_id" integer NOT NULL, CONSTRAINT "PK_44f0ffec752c2e67874e73589c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" SERIAL NOT NULL, "name" character varying NOT NULL, "barcode" character varying, "organization_id" integer NOT NULL, "price" numeric(14,3) NOT NULL, "product_group_id" integer NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "barcode_organization_id" ON "product" ("barcode", "organization_id") `);
        await queryRunner.query(`ALTER TABLE "sale" ADD CONSTRAINT "FK_c3ba8d0c269835c0f532b78c82c" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sale" ADD CONSTRAINT "FK_9fd90f6864bfc3d4b00b07d1f8f" FOREIGN KEY ("shop_id") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_level" ADD CONSTRAINT "FK_10f3554d8537adf7dc53984960e" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_level" ADD CONSTRAINT "FK_dda0d2580ff55ca940846ca2428" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_level" ADD CONSTRAINT "FK_e758c10b72ab79d78afdc2327bb" FOREIGN KEY ("shop_id") REFERENCES "shop"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shop" ADD CONSTRAINT "FK_7d2454a881a53e4bd73f3933f51" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role" ADD CONSTRAINT "FK_2c1fc97f79b82800ef15372b98c" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_15bd8509dd44ed40187eb9bc44d" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_group" ADD CONSTRAINT "FK_cafd5ac6438bc2e6fdbb59fa72c" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orderline" ADD CONSTRAINT "FK_f68e82d2fa6cc2d282754c8a0b1" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orderline" ADD CONSTRAINT "FK_ea58024cada4d0df6623195ea54" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orderline" ADD CONSTRAINT "FK_c3456041be4ed5e02b920af2665" FOREIGN KEY ("sale_id") REFERENCES "sale"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_856d7e7672c2a22652daf70e1e7" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_69de4a3ea6311d4259c2dc1a9f7" FOREIGN KEY ("product_group_id") REFERENCES "product_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_69de4a3ea6311d4259c2dc1a9f7"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_856d7e7672c2a22652daf70e1e7"`);
        await queryRunner.query(`ALTER TABLE "orderline" DROP CONSTRAINT "FK_c3456041be4ed5e02b920af2665"`);
        await queryRunner.query(`ALTER TABLE "orderline" DROP CONSTRAINT "FK_ea58024cada4d0df6623195ea54"`);
        await queryRunner.query(`ALTER TABLE "orderline" DROP CONSTRAINT "FK_f68e82d2fa6cc2d282754c8a0b1"`);
        await queryRunner.query(`ALTER TABLE "product_group" DROP CONSTRAINT "FK_cafd5ac6438bc2e6fdbb59fa72c"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_15bd8509dd44ed40187eb9bc44d"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_fb2e442d14add3cefbdf33c4561"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_3e103cdf85b7d6cb620b4db0f0c"`);
        await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT "FK_2c1fc97f79b82800ef15372b98c"`);
        await queryRunner.query(`ALTER TABLE "shop" DROP CONSTRAINT "FK_7d2454a881a53e4bd73f3933f51"`);
        await queryRunner.query(`ALTER TABLE "stock_level" DROP CONSTRAINT "FK_e758c10b72ab79d78afdc2327bb"`);
        await queryRunner.query(`ALTER TABLE "stock_level" DROP CONSTRAINT "FK_dda0d2580ff55ca940846ca2428"`);
        await queryRunner.query(`ALTER TABLE "stock_level" DROP CONSTRAINT "FK_10f3554d8537adf7dc53984960e"`);
        await queryRunner.query(`ALTER TABLE "sale" DROP CONSTRAINT "FK_9fd90f6864bfc3d4b00b07d1f8f"`);
        await queryRunner.query(`ALTER TABLE "sale" DROP CONSTRAINT "FK_c3ba8d0c269835c0f532b78c82c"`);
        await queryRunner.query(`DROP INDEX "public"."barcode_organization_id"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "orderline"`);
        await queryRunner.query(`DROP TYPE "public"."orderline_orderline_type_enum"`);
        await queryRunner.query(`DROP TABLE "organization"`);
        await queryRunner.query(`DROP TABLE "product_group"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TYPE "public"."role_policies_enum"`);
        await queryRunner.query(`DROP TABLE "shop"`);
        await queryRunner.query(`DROP TABLE "stock_level"`);
        await queryRunner.query(`DROP TABLE "sale"`);
    }

}
