/**
 * Utility functions for currency formatting.
 */

const EXCHANGE_RATE = 1350; // 1 USD = 1350 RWF

/**
 * Converts a USD amount to RWF and formats it nicely.
 * e.g., 10 USD -> "13,500 RWF"
 * @param {number|string} usdAmount - The amount in USD
 * @returns {string} - The formatted string in RWF
 */
export const formatRWF = (usdAmount) => {
  const amount = Number(usdAmount);
  if (isNaN(amount)) return '0 RWF';
  
  const rwfAmount = Math.round(amount * EXCHANGE_RATE);
  
  // Format with commas for thousands
  return `${rwfAmount.toLocaleString('en-US')} RWF`;
};
