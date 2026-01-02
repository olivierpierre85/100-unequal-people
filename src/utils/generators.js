// Belgian Demographic & Economic Data (Approximate 2023/2024)

const REGIONS = [
    { name: 'Flanders', weight: 0.58 },
    { name: 'Wallonia', weight: 0.31 },
    { name: 'Brussels', weight: 0.11 }
];

// Age distribution (broad buckets)
// 0-14: 16%, 15-64: 60%, 65+: 24%
const AGE_GROUPS = [
    { min: 0, max: 14, weight: 0.16 },
    { min: 15, max: 24, weight: 0.11 }, // Students/Early career
    { min: 25, max: 44, weight: 0.26 }, // Prime working age
    { min: 45, max: 64, weight: 0.23 }, // Late career
    { min: 65, max: 80, weight: 0.18 }, // Retirees
    { min: 81, max: 100, weight: 0.06 } // Elderly
];

// Net Monthly Income (Individual) Distribution Estimation (Euros)
// P10: 1300, P50: 2500, P90: 3800, P99: 8000
// We use a log-normal-ish approximation by interpolation
const INCOME_PERCENTILES = [
    { p: 0.10, val: 1300 }, // Social welfare / very low part-time
    { p: 0.25, val: 1800 }, // Minimum wage range
    { p: 0.50, val: 2500 }, // Median
    { p: 0.75, val: 3000 },
    { p: 0.90, val: 3800 }, // High earners
    { p: 0.99, val: 8500 }  // Top 1%
];

// Net Household Wealth Distribution Estimation (Euros)
// High inequality. P50 ~268k. Top 10% owns 55%.
const WEALTH_PERCENTILES = [
    { p: 0.10, val: 1000 },    // Almost nothing
    { p: 0.30, val: 25000 },   // Savings but no house
    { p: 0.50, val: 268000 },  // Median (likely Homeowner)
    { p: 0.70, val: 450000 },  // Nice home + savings
    { p: 0.90, val: 1200000 }, // Millionaire entry
    { p: 0.99, val: 5000000 }  // Multi-millionaire
];

function getRandomWeighted(items) {
    const r = Math.random();
    let sum = 0;
    for (const item of items) {
        sum += item.weight;
        if (r <= sum) return item;
    }
    return items[items.length - 1]; // Fallback
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function interpolate(percentile, distribution) {
    // Find bucket
    for (let i = 0; i < distribution.length; i++) {
        if (percentile <= distribution[i].p) {
            const lower = distribution[i - 1] || { p: 0, val: 0 };
            const upper = distribution[i];
            const range = upper.p - lower.p;
            const progress = (percentile - lower.p) / range;
            return lower.val + progress * (upper.val - lower.val);
        }
    }
    // Handle > last percentile (linear extension based on last slope)
    const last = distribution[distribution.length - 1];
    const secondLast = distribution[distribution.length - 2];
    const slope = (last.val - secondLast.val) / (last.p - secondLast.p);
    return last.val + (percentile - last.p) * slope;
}

export function generateProfiles(count = 100) {
    const profiles = [];

    for (let i = 0; i < count; i++) {
        // Demographics
        const region = getRandomWeighted(REGIONS).name;
        const gender = Math.random() > 0.5 ? 'Female' : 'Male';

        const ageGroup = getRandomWeighted(AGE_GROUPS);
        const age = getRandomInt(ageGroup.min, ageGroup.max);

        // Economic Position (Random percentiles for now, correlations can be added later)
        // Income is loose correlated with age (career trajectory)
        let incomePercentile = Math.random();

        // Age adjustment for income: 
        // Young (<22) and Old (>65) tend to have lower *labor* income, but pensions exist.
        // Let's keep it simple: Median income usually peaks at 45-55.
        // We act as if 'income' includes pension/benefits.
        if (age < 18) incomePercentile *= 0.1; // Kids earn nothing/pocket money
        else if (age < 23) incomePercentile *= 0.5; // Students/Starters
        else if (age > 65) incomePercentile = incomePercentile * 0.8 + 0.1; // Pension compression

        const income = Math.round(interpolate(incomePercentile, INCOME_PERCENTILES));

        // Wealth is strongly correlated with Age (accumulation)
        // Base percentile + age boost
        let wealthPercentile = Math.random();

        // Age factor for wealth
        const ageFactor = Math.min(1, age / 60); // Peaks at 60
        wealthPercentile = (wealthPercentile * 0.5) + (ageFactor * 0.5);

        // Income factor for wealth (High earners tend to accumulate more)
        wealthPercentile = (wealthPercentile * 0.7) + (incomePercentile * 0.3);

        const capital = Math.round(interpolate(wealthPercentile, WEALTH_PERCENTILES));

        profiles.push({
            id: i + 1,
            demographics: {
                age,
                gender,
                region
            },
            economics: {
                netMonthlyIncome: income,
                netWealth: capital,
                incomePercentile: (incomePercentile * 100).toFixed(1), // For verification
                wealthPercentile: (wealthPercentile * 100).toFixed(1)
            }
        });
    }

    return profiles.sort((a, b) => a.economics.netWealth - b.economics.netWealth);
}
