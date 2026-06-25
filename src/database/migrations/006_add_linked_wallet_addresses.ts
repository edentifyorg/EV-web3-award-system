import type { Knex } from 'knex';

const TABLE_NAME = 'linked_wallet_links';
const UNIQUE_UID_WALLET = 'linked_wallet_links_uid_wallet_unique';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable(TABLE_NAME);
  if (hasTable) return;

  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('uid').notNullable().index();
    table.string('wallet_address', 42).notNullable().index();
    table.string('wallet_name', 120).nullable();
    table.timestamps(true, true);

    table.unique(['uid', 'wallet_address'], UNIQUE_UID_WALLET);
  });
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable(TABLE_NAME);
  if (hasTable) {
    await knex.schema.dropTable(TABLE_NAME);
  }
}
