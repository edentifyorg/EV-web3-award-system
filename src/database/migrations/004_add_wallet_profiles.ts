import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasWalletName = await knex.schema.hasColumn('users', 'wallet_name');
  if (!hasWalletName) {
    await knex.schema.alterTable('users', (table) => {
      table.string('wallet_name', 120).nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasWalletName = await knex.schema.hasColumn('users', 'wallet_name');
  if (hasWalletName) {
    await knex.schema.alterTable('users', (table) => {
      table.dropColumn('wallet_name');
    });
  }
}
