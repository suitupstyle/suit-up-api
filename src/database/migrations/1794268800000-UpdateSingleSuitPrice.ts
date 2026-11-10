import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateSingleSuitPrice1794268800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update the existing catalog, not historical orders or payment intents.
        await queryRunner.query(
            'UPDATE "items" SET "price" = $1 WHERE "name" = $2',
            ['479.99', 'Black Professional Business Suit']
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'UPDATE "items" SET "price" = $1 WHERE "name" = $2 AND "price" = $3',
            ['439.00', 'Black Professional Business Suit', '479.99']
        )
    }
}
