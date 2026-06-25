import type { Knex } from 'knex';

const TABLE_NAME = 'linked_wallet_links';
const UNIQUE_ADDRESS_INDEX = 'linked_wallet_links_wallet_lower_unique';

export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable(TABLE_NAME);
  if (!hasTable) return;

  const duplicates = await knex(TABLE_NAME)
    .select(knex.raw('lower(wallet_address) as wallet_address'))
    .count({ count: '*' })
    .groupByRaw('lower(wallet_address)')
    .havingRaw('count(*) > 1') as Array<{ wallet_address: string; count: string }>;

  if (duplicates.length) {
    const duplicateAddresses = duplicates.map(row => row.wallet_address).join(', ');
    throw new Error(`Cannot enforce unique linked wallet addresses. Duplicates exist: ${duplicateAddresses}`);
  }

  await knex.raw(`create unique index if not exists ${UNIQUE_ADDRESS_INDEX} on ${TABLE_NAME} (lower(wallet_address))`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`drop index if exists ${UNIQUE_ADDRESS_INDEX}`);
}
