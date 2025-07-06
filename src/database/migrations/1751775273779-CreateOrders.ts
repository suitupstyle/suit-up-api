import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateOrders1751775273779 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'orders',
                columns: [
                    {
                        name: 'id',
                        type: 'serial',
                        isPrimary: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        default: 'now()',
                    },
                    {
                        name: 'measurement_data',
                        type: 'jsonb',
                        isNullable: true,
                    },
                    {
                        name: 'delivered_at',
                        type: 'timestamp with time zone',
                        isNullable: true,
                    },
                    {
                        name: 'is_paid',
                        type: 'boolean',
                        default: false,
                    },
                ],
            }),
            true
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('preorders')
    }
}
