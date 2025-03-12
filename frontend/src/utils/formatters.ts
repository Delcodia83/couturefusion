/**
 * Format a date timestamp to a human-readable string
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

import useAppSettingsStore from './appSettingsStore';

export interface Currency {
  code: string;
  symbol: string;
  position: 'before' | 'after';
}

/**
 * Format a currency amount
 * 
 * @param amount - The amount to format
 * @param currencyParam - Either a Currency object or a currency code string (e.g. 'EUR')
 */
export function formatCurrency(amount: number, currencyParam?: Currency | string | null): string {
  // Si currencyParam est un objet Currency
  if (currencyParam && typeof currencyParam === 'object') {
    const { symbol, position } = currencyParam;
    
    const formattedAmount = new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    
    return position === 'before'
      ? `${symbol}${formattedAmount}`
      : `${formattedAmount} ${symbol}`;
  }
  
  // Si currencyParam est une chaîne de caractères (code de devise)
  if (currencyParam && typeof currencyParam === 'string') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currencyParam
    }).format(amount);
  }
  
  // Essayer d'utiliser le store si aucune devise n'est fournie
  try {
    const { settings } = useAppSettingsStore.getState();
    
    if (settings?.currency) {
      const { symbol, position } = settings.currency;
      
      const formattedAmount = new Intl.NumberFormat('fr-FR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
      
      return position === 'before'
        ? `${symbol}${formattedAmount}`
        : `${formattedAmount} ${symbol}`;
    }
  } catch (error) {
    console.log('Using default currency format');
  }
  
  // Format par défaut si le store n'est pas disponible
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

/**
 * Format a phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Basic formatting for French phone numbers
  if (phoneNumber.length === 10) {
    return phoneNumber.replace(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5');
  }
  return phoneNumber;
}
