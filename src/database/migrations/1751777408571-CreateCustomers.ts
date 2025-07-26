import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm'

export class CreateCustomers1751777408571 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'customers',
                columns: [
                    {
                        name: 'id',
                        type: 'serial',
                        isPrimary: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'email',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: 'supabase_user_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        isUnique: true,
                    },
                ],
            }),
            true
        )

        await queryRunner.addColumn(
            'orders',
            new TableColumn({
                name: 'customer_id',
                type: 'integer',
                isNullable: false,
            })
        )

        await queryRunner.createForeignKey(
            'orders',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedTableName: 'customers',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const ordersTable = await queryRunner.getTable('orders')
        const fk = ordersTable!.foreignKeys.find((fk) => fk.columnNames.includes('customer_id'))
        if (fk) {
            await queryRunner.dropForeignKey('orders', fk)
        }

        await queryRunner.dropColumn('orders', 'customer_id')

        await queryRunner.dropTable('customers', true)
    }
}
