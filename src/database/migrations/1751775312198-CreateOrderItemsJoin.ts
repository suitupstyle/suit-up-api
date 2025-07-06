import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateOrderItemsJoin1751775312198 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'orders_items',
                columns: [
                    {
                        name: 'order_id',
                        type: 'integer',
                        isPrimary: true,
                    },
                    {
                        name: 'item_id',
                        type: 'integer',
                        isPrimary: true,
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ['order_id'],
                        referencedTableName: 'orders',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                    {
                        columnNames: ['item_id'],
                        referencedTableName: 'items',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    },
                ],
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('orders_items')
    }
}
