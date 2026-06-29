import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddExcelUrlToOrders1751800000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'orders',
            new TableColumn({
                name: 'excel_url',
                type: 'text',
                isNullable: true,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('orders', 'excel_url')
    }
}
