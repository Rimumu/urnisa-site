// economy.ts - Urnisa Economy & Nisaball Currency System
// Persists the Nisaball balances, transaction history, and handles Twitch contributions.

export interface NisaballTransaction {
  id: string;
  amount: number;
  type: 'sub' | 'gift' | 'bits' | 'donation';
  channel: string;
  description: string;
  timestamp: number;
}

const BALANCE_KEY_PREFIX = 'urnisa_nisaballs_bal_';
const HISTORY_KEY_PREFIX = 'urnisa_nisaballs_hist_';
const URNISA_TWITCH_CHANNEL = 'urnisa_';

// Custom event to signal balance/history updates across components
export const ECONOMY_UPDATE_EVENT = 'urnisa_economy_update';

function triggerUpdate() {
  window.dispatchEvent(new Event(ECONOMY_UPDATE_EVENT));
}

/**
 * Gets the current Nisaballs balance of a Twitch user.
 */
export function getNisaballsBalance(twitchUsername: string): number {
  if (!twitchUsername) return 0;
  const key = `${BALANCE_KEY_PREFIX}${twitchUsername.toLowerCase()}`;
  const stored = localStorage.getItem(key);
  return stored ? parseFloat(stored) : 0;
}

/**
 * Sets the balance directly (useful for admin or syncing).
 */
export function setNisaballsBalance(twitchUsername: string, amount: number): void {
  if (!twitchUsername) return;
  const key = `${BALANCE_KEY_PREFIX}${twitchUsername.toLowerCase()}`;
  localStorage.setItem(key, amount.toString());
  triggerUpdate();
}

/**
 * Gets the transaction history of a Twitch user.
 */
export function getNisaballHistory(twitchUsername: string): NisaballTransaction[] {
  if (!twitchUsername) return [];
  const key = `${HISTORY_KEY_PREFIX}${twitchUsername.toLowerCase()}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Logs a new Nisaball transaction and updates the user's balance.
 */
export function addNisaballTransaction(
  twitchUsername: string,
  type: 'sub' | 'gift' | 'bits' | 'donation',
  amount: number, // Raw amount of events (e.g. 1 sub, 500 bits, 5 USD)
  channel: string,
  description: string
): { success: boolean; addedNisaballs: number; newBalance: number; error?: string } {
  const normalizedChannel = channel.toLowerCase().trim().replace('#', '');
  const targetChannel = URNISA_TWITCH_CHANNEL.toLowerCase();

  // RULE: Only track contributions to the urnisa channel
  if (normalizedChannel !== targetChannel) {
    return {
      success: false,
      addedNisaballs: 0,
      newBalance: getNisaballsBalance(twitchUsername),
      error: `Contributions to #${channel} do not earn Nisaballs. Only #${URNISA_TWITCH_CHANNEL} is tracked!`
    };
  }

  // Calculate Nisaball rewards based on instructions:
  // - Sub: 1 Nisaball
  // - Gift a sub: 1 Nisaball
  // - Donated $5: 1 Nisaball (pro-rated: donation / 5)
  // - 500 bits: 1 Nisaball (pro-rated: bits / 500)
  let addedNisaballs = 0;

  switch (type) {
    case 'sub':
      addedNisaballs = amount; // 1 sub = 1 Nisaball
      break;
    case 'gift':
      addedNisaballs = amount; // 1 gift sub = 1 Nisaball
      break;
    case 'donation':
      addedNisaballs = amount / 5; // $5 = 1 Nisaball
      break;
    case 'bits':
      addedNisaballs = amount / 500; // 500 bits = 1 Nisaball
      break;
  }

  if (addedNisaballs <= 0) {
    return {
      success: false,
      addedNisaballs: 0,
      newBalance: getNisaballsBalance(twitchUsername),
      error: 'Invalid contribution amount.'
    };
  }

  const currentBalance = getNisaballsBalance(twitchUsername);
  const newBalance = Math.round((currentBalance + addedNisaballs) * 100) / 100; // Round to 2 decimal places

  // Update balance
  setNisaballsBalance(twitchUsername, newBalance);

  // Update history
  const historyKey = `${HISTORY_KEY_PREFIX}${twitchUsername.toLowerCase()}`;
  const history = getNisaballHistory(twitchUsername);
  const newTx: NisaballTransaction = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    amount: addedNisaballs,
    type,
    channel: normalizedChannel,
    description,
    timestamp: Date.now()
  };

  history.unshift(newTx);
  // Keep last 100 transactions
  localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 100)));

  triggerUpdate();

  return {
    success: true,
    addedNisaballs,
    newBalance
  };
}
