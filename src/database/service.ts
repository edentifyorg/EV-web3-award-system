import { getDatabase } from './connection';

/**
 * Database service for managing application data
 * Mirrors blockchain state for API queries
 */

export interface UserRecord {
  id: string;
  uid: string;
  wallet_address: string;
  wallet_name?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AwardRecord {
  id: string;
  user_id: string;
  session_id: string;
  provider_id: string;
  dedup_key: string;
  amount: string; // Decimal as string
  cdr_data: string | null;
  tx_hash: string;
  awarded_at: Date;
  award_type?: string; // 'OFF_PEAK_CHARGING' | 'V2G_DISCHARGE'
  is_off_peak?: boolean; // Whether awarded during off-peak hours
  country_code?: string; // Country code derived from EVSEID
  local_time?: string; // Local time in HH:MM format
  created_at: Date;
}

export interface BalanceRecord {
  id: string;
  user_id: string;
  wallet_address: string;
  balance: string; // Decimal as string
  total_awarded: string;
  total_spent: string;
  last_synced: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SpendRecord {
  id: string;
  user_id: string;
  wallet_address: string;
  amount: string;
  tx_hash: string;
  session_id?: string;
  created_at: Date;
}

export interface LinkedWalletAddressRecord {
  id: string;
  uid: string;
  wallet_address: string;
  wallet_name?: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * User operations
 */
export const Users = {
  async create(uid: string, walletAddress: string, walletName?: string | null): Promise<UserRecord> {
    const db = getDatabase();
    const [record] = await db('users')
      .insert({ uid, wallet_address: walletAddress, wallet_name: walletName || null })
      .returning('*');
    return record;
  },

  async findByUid(uid: string): Promise<UserRecord | undefined> {
    const db = getDatabase();
    return db('users').where({ uid }).orderBy('created_at', 'asc').first();
  },

  async findByUidAndWallet(uid: string, walletAddress: string): Promise<UserRecord | undefined> {
    const db = getDatabase();
    return db('users')
      .where({ uid })
      .whereRaw('lower(wallet_address) = lower(?)', [walletAddress])
      .first();
  },

  async findByWallet(walletAddress: string): Promise<UserRecord | undefined> {
    const db = getDatabase();
    return db('users')
      .whereRaw('lower(wallet_address) = lower(?)', [walletAddress])
      .first();
  },

  async findAllByWallet(walletAddress: string): Promise<UserRecord[]> {
    const db = getDatabase();
    return db('users')
      .whereRaw('lower(wallet_address) = lower(?)', [walletAddress])
      .orderBy('created_at', 'asc');
  },

  async updateWalletAddress(uid: string, walletAddress: string): Promise<UserRecord> {
    const db = getDatabase();
    const existing = await this.findByUid(uid);
    if (!existing) {
      throw new Error(`EMP contract ID "${uid}" not found`);
    }
    const [record] = await db('users')
      .where({ id: existing.id })
      .update({
        wallet_address: walletAddress,
        updated_at: db.fn.now(),
      })
      .returning('*');
    return record;
  },

  async updateWalletAddressById(id: string, walletAddress: string): Promise<UserRecord> {
    const db = getDatabase();
    const [record] = await db('users')
      .where({ id })
      .update({
        wallet_address: walletAddress,
        updated_at: db.fn.now(),
      })
      .returning('*');
    return record;
  },

  async updateWalletNameByAddress(walletAddress: string, walletName: string | null): Promise<UserRecord[]> {
    const db = getDatabase();
    return db('users')
      .whereRaw('lower(wallet_address) = lower(?)', [walletAddress])
      .update({
        wallet_name: walletName,
        updated_at: db.fn.now(),
      })
      .returning('*');
  },

  async linkContractId(uid: string, walletAddress: string, walletName?: string | null): Promise<UserRecord> {
    const existing = await this.findByUidAndWallet(uid, walletAddress);
    if (existing) {
      return existing;
    }
    return this.create(uid, walletAddress, walletName || null);
  },

  async deleteByUidAndWallet(uid: string, walletAddress: string): Promise<number> {
    const db = getDatabase();
    return db('users')
      .where({ uid })
      .whereRaw('lower(wallet_address) = lower(?)', [walletAddress])
      .delete();
  },

  async hasActivity(userId: string): Promise<boolean> {
    const db = getDatabase();
    const [award, spend, balance] = await Promise.all([
      db('awards').where({ user_id: userId }).first(),
      db('spends').where({ user_id: userId }).first(),
      db('balances').where({ user_id: userId }).whereRaw('balance <> 0').first(),
    ]);
    return Boolean(award || spend || balance);
  },

  async getAll(): Promise<UserRecord[]> {
    const db = getDatabase();
    return db('users').orderBy('created_at', 'asc');
  },
};

/**
 * Address-based linked wallets.
 */
export const LinkedWallets = {
  tableName: 'linked_wallet_links',
  maxPerUid: 5,

  async findByUid(uid: string): Promise<LinkedWalletAddressRecord[]> {
    const db = getDatabase();
    return db(this.tableName)
      .where({ uid })
      .orderBy('created_at', 'asc');
  },

  async findByAddress(walletAddress: string): Promise<LinkedWalletAddressRecord | undefined> {
    const db = getDatabase();
    return db(this.tableName)
      .whereRaw('lower(wallet_address) = lower(?)', [walletAddress])
      .first();
  },

  async add(uid: string, walletAddress: string): Promise<LinkedWalletAddressRecord> {
    const db = getDatabase();
    const existingForUid = await db(this.tableName)
      .where({ uid })
      .whereRaw('lower(wallet_address) = lower(?)', [walletAddress])
      .first();

    if (existingForUid) return existingForUid;

    const existingForOtherUid = await this.findByAddress(walletAddress);
    if (existingForOtherUid) {
      throw new Error('This wallet address is already linked. Unlink it before linking it again.');
    }

    const count = await db(this.tableName)
      .where({ uid })
      .count<{ count: string }>({ count: '*' })
      .first();

    if (Number(count?.count || 0) >= this.maxPerUid) {
      throw new Error(`A maximum of ${this.maxPerUid} wallet addresses can be linked`);
    }

    const [record] = await db(this.tableName)
      .insert({ uid, wallet_address: walletAddress })
      .returning('*');
    return record;
  },

  async remove(uid: string, walletAddress: string): Promise<number> {
    const db = getDatabase();
    return db(this.tableName)
      .where({ uid })
      .whereRaw('lower(wallet_address) = lower(?)', [walletAddress])
      .delete();
  },

  async updateName(uid: string, walletAddress: string, walletName: string | null): Promise<LinkedWalletAddressRecord | undefined> {
    const db = getDatabase();
    const [record] = await db(this.tableName)
      .where({ uid })
      .whereRaw('lower(wallet_address) = lower(?)', [walletAddress])
      .update({
        wallet_name: walletName,
        updated_at: db.fn.now(),
      })
      .returning('*');
    return record;
  },
};

/**
 * Award operations
 */
export const Awards = {
  async create(data: {
    userId: string;
    sessionId: string;
    providerId: string;
    dedupKey: string;
    amount: string;
    cdrData?: string;
    txHash: string;
    awardedAt: Date;
    awardType?: string;
    isOffPeak?: boolean;
    countryCode?: string;
    localTime?: string;
  }): Promise<AwardRecord> {
    const db = getDatabase();
    const [record] = await db('awards')
      .insert({
        user_id: data.userId,
        session_id: data.sessionId,
        provider_id: data.providerId,
        dedup_key: data.dedupKey,
        amount: data.amount,
        cdr_data: data.cdrData || null,
        tx_hash: data.txHash,
        awarded_at: data.awardedAt,
        award_type: data.awardType || null,
        is_off_peak: data.isOffPeak ?? false,
        country_code: data.countryCode || null,
        local_time: data.localTime || null,
      })
      .returning('*');
    return record;
  },

  async findByDedupKey(dedupKey: string): Promise<AwardRecord | undefined> {
    const db = getDatabase();
    return db('awards').where({ dedup_key: dedupKey }).first();
  },

  async findByUser(userId: string): Promise<AwardRecord[]> {
    const db = getDatabase();
    return db('awards').where({ user_id: userId }).orderBy('awarded_at', 'desc');
  },

  async exists(dedupKey: string): Promise<boolean> {
    const db = getDatabase();
    const result = await db('awards').where({ dedup_key: dedupKey }).first();
    return !!result;
  },

  async getAll(): Promise<AwardRecord[]> {
    const db = getDatabase();
    return db('awards').orderBy('awarded_at', 'desc');
  },
};

/**
 * Balance operations
 */
export const Balances = {
  async upsert(data: {
    userId: string;
    walletAddress: string;
    balance: string;
    totalAwarded: string;
    totalSpent: string;
  }): Promise<BalanceRecord> {
    const db = getDatabase();
    const existing = await db('balances').where({ user_id: data.userId }).first();

    if (existing) {
      const [record] = await db('balances')
        .where({ user_id: data.userId })
        .update({
          balance: data.balance,
          total_awarded: data.totalAwarded,
          total_spent: data.totalSpent,
          last_synced: db.fn.now(),
        })
        .returning('*');
      return record;
    } else {
      const [record] = await db('balances')
        .insert({
          user_id: data.userId,
          wallet_address: data.walletAddress,
          balance: data.balance,
          total_awarded: data.totalAwarded,
          total_spent: data.totalSpent,
        })
        .returning('*');
      return record;
    }
  },

  async findByUser(userId: string): Promise<BalanceRecord | undefined> {
    const db = getDatabase();
    return db('balances').where({ user_id: userId }).first();
  },

  async findByWallet(walletAddress: string): Promise<BalanceRecord | undefined> {
    const db = getDatabase();
    return db('balances').where({ wallet_address: walletAddress }).first();
  },

  async getAll(): Promise<BalanceRecord[]> {
    const db = getDatabase();
    return db('balances').orderBy('total_awarded', 'desc');
  },
};

/**
 * Spend operations
 */
export const Spends = {
  async create(data: {
    userId: string;
    walletAddress: string;
    amount: string;
    txHash: string;
    sessionId?: string;
  }): Promise<SpendRecord> {
    const db = getDatabase();
    const [record] = await db('spends')
      .insert({
        user_id: data.userId,
        wallet_address: data.walletAddress,
        amount: data.amount,
        tx_hash: data.txHash,
        session_id: data.sessionId || null,
      })
      .returning('*');
    return record;
  },

  async findByUser(userId: string): Promise<SpendRecord[]> {
    const db = getDatabase();
    return db('spends').where({ user_id: userId }).orderBy('created_at', 'desc');
  },

  async findByWallet(walletAddress: string): Promise<SpendRecord[]> {
    const db = getDatabase();
    return db('spends').where({ wallet_address: walletAddress }).orderBy('created_at', 'desc');
  },

  async findByTxHash(txHash: string): Promise<SpendRecord | undefined> {
    const db = getDatabase();
    return db('spends').where({ tx_hash: txHash }).first();
  },

  async getAll(): Promise<SpendRecord[]> {
    const db = getDatabase();
    return db('spends').orderBy('created_at', 'desc');
  },
};
