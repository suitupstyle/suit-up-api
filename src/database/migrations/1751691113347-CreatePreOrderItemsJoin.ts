import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreatePreOrderItemsJoin1751691113347 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'preorders_items',
                columns: [
                    {
                        name: 'preorder_id',
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
                        columnNames: ['preorder_id'],
                        referencedTableName: 'preorders',
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
        await queryRunner.dropTable('preorders_items')
    }
}
