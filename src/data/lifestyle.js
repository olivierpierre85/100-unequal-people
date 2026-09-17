// Turns a profile's raw numbers into the concrete life-situation comparisons
// the project is about: same country, very different everyday lives.
// Returns band indices / keys; the sentences live in src/i18n/messages/*.js
// under `lifestyle`, so they can be shown in Dutch, French or English.
// Pure function of income/wealth so it stays consistent with the data.

function band(value, upperBounds) {
  return upperBounds.findIndex((max) => value < max)
}

const SIX = [1300, 1800, 2600, 3500, 5000, Infinity]

export function lifestyle(person) {
  const income = person.economics.netMonthlyIncome
  const { netWealth, homesOwned } = person.economics
  return {
    housing: housingKey(income, netWealth, homesOwned),
    holidays: band(income, [1300, 1800, 2600, 3500, 5000, 9000, Infinity]),
    restaurants: band(income, SIX),
    smartphone: band(income, SIX),
    concert: band(income, SIX),
  }
}

function housingKey(income, netWealth, homesOwned) {
  if (homesOwned >= 3) return 'multi'
  if (homesOwned === 2) return 'second'
  if (homesOwned === 1) return netWealth >= 250000 ? 'paidOff' : 'mortgage'
  return income < 1400 ? 'rentTight' : 'rentSaving'
}
