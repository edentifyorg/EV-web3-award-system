import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn('spend_reservations', 'authorization_tx_hash'))) {
    await knex.schema.alterTable('spend_reservations', table => {
      table.string('authorization_tx_hash', 66).nullable();
      table.decimal('authorization_amount', 20, 2).nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('spend_reservations', table => {
    table.dropColumn('authorization_tx_hash');
    table.dropColumn('authorization_amount');
  });
}
