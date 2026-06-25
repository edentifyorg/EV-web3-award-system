import type { Knex } from 'knex';

const GLOBAL_UID_CONSTRAINT = 'users_uid_unique';
const UID_WALLET_INDEX = 'users_uid_wallet_lower_unique';

export async function up(knex: Knex): Promise<void> {
  const hasUsers = await knex.schema.hasTable('users');
  if (!hasUsers) return;

  const hasGlobalUidConstraint = await knex('pg_constraint')
    .where({ conname: GLOBAL_UID_CONSTRAINT })
    .first();

  if (hasGlobalUidConstraint) {
    await knex.schema.alterTable('users', (table) => {
      table.dropUnique(['uid'], GLOBAL_UID_CONSTRAINT);
    });
  }

  const duplicates = await knex('users')
    .select('uid')
    .select(knex.raw('lower(wallet_address) as wallet_address'))
    .count({ count: '*' })
    .groupBy('uid')
    .groupByRaw('lower(wallet_address)')
    .havingRaw('count(*) > 1') as Array<{ uid: string; wallet_address: string; count: string }>;

  if (duplicates.length) {
    const duplicatePairs = duplicates.map(row => `${row.uid}:${row.wallet_address}`).join(', ');
    throw new Error(`Cannot enforce EMP contract plus wallet uniqueness. Duplicates exist: ${duplicatePairs}`);
  }

  await knex.raw(`create unique index if not exists ${UID_WALLET_INDEX} on users (uid, lower(wallet_address))`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`drop index if exists ${UID_WALLET_INDEX}`);

  const duplicates = await knex('users')
    .select('uid')
    .count({ count: '*' })
    .groupBy('uid')
    .havingRaw('count(*) > 1') as Array<{ uid: string; count: string }>;

  if (duplicates.length) {
    const duplicateIds = duplicates.map(row => row.uid).join(', ');
    throw new Error(`Cannot restore global EMP contract ID uniqueness. Duplicate contract IDs exist: ${duplicateIds}`);
  }

  const hasGlobalUidConstraint = await knex('pg_constraint')
    .where({ conname: GLOBAL_UID_CONSTRAINT })
    .first();

  if (!hasGlobalUidConstraint) {
    await knex.schema.alterTable('users', (table) => {
      table.unique(['uid'], GLOBAL_UID_CONSTRAINT);
    });
  }
}
