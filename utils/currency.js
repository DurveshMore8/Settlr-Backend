// Currency conversion utility using a free exchange rate API

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const rateCache = new Map();

/**
 * Fetch the exchange rate from one currency to another.
 * Uses api.exchangerate-api.com (free, no key required for basic usage).
 */
export const getExchangeRate = async (from, to) => {
    from = from.toUpperCase();
    to = to.toUpperCase();

    if (from === to) return 1;

    const cacheKey = `${from}_${to}`;
    const cached = rateCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.rate;
    }

    try {
        const response = await fetch(
            `https://api.exchangerate-api.com/v4/latest/${from}`
        );
        const data = await response.json();

        if (!data.rates || !data.rates[to]) {
            throw new Error(`Exchange rate not found for ${from} → ${to}`);
        }

        const rate = data.rates[to];

        // Cache all rates from this base currency
        for (const [currency, currRate] of Object.entries(data.rates)) {
            rateCache.set(`${from}_${currency}`, {
                rate: currRate,
                timestamp: Date.now(),
            });
        }

        return rate;
    } catch (error) {
        console.error('Exchange rate fetch error:', error.message);
        throw new Error(`Could not fetch exchange rate for ${from} → ${to}`);
    }
};

/**
 * Convert an amount from one currency to another.
 * Returns the converted amount rounded to 2 decimal places.
 */
export const convertAmount = async (amount, from, to) => {
    const rate = await getExchangeRate(from, to);
    return Math.round(amount * rate * 100) / 100;
};
