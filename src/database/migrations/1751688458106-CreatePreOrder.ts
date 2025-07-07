import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class CreatePreOrder1751688458106 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'preorders',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        default: 'now()',
                    },
                    {
                        name: 'front_image_url',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'side_image_url',
                        type: 'varchar',
                        isNullable: true,
                    },
                    {
                        name: 'measurement_data',
                        type: 'jsonb',
                        isNullable: true,
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
