import type { Knex } from 'knex';

const UNIQUE_UID_CONSTRAINT = 'users_uid_unique';
const WALLET_UID_INDEX = 'users_wallet_address_uid_unique';

export async function up(knex: Knex): Promise<void> {
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) return;

  await knex.raw(`drop index if exists ${WALLET_UID_INDEX}`);

  const duplicates = await knex('users')
    .select('uid')
    .count({ count: '*' })
    .groupBy('uid')
    .havingRaw('count(*) > 1') as Array<{ uid: string; count: string }>;

  if (duplicates.length) {
    const duplicateIds = duplicates.map(row => row.uid).join(', ');
    throw new Error(`Cannot enforce global EMP contract ID uniqueness. Duplicate contract IDs exist: ${duplicateIds}`);
  }

  const hasGlobalUidConstraint = await knex('pg_constraint')
    .where({ conname: UNIQUE_UID_CONSTRAINT })
    .first();

  if (!hasGlobalUidConstraint) {
    await knex.schema.alterTable('users', (table) => {
      table.unique(['uid'], UNIQUE_UID_CONSTRAINT);
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasGlobalUidConstraint = await knex('pg_constraint')
    .where({ conname: UNIQUE_UID_CONSTRAINT })
    .first();

  if (hasGlobalUidConstraint) {
    await knex.schema.alterTable('users', (table) => {
      table.dropUnique(['uid'], UNIQUE_UID_CONSTRAINT);
    });
  }
}
