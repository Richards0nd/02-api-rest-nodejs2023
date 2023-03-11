import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('transactions', (table) => {
		table.uuid('id').primary()
		table.text('title').notNullable()
		table.decimal('amount', 18, 2).notNullable()
		table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable
	})
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable('transactions')
}
