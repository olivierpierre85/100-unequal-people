// Splits a person's net monthly income into "from work & pensions" (wages,
// self-employment, pensions, benefits) and "from wealth" (rent, dividends,
// interest). Pure function of the profile so it stays consistent with the data.
//
// Model, kept deliberately simple:
//  - The primary home doesn't pay you an income, so its equity (capped at
//    €300k, ~70% of net wealth for owners) is excluded from yielding wealth.
//    Everything above that — second properties, portfolios, savings — yields.
//  - Yielding wealth returns ~3.2%/year net (blend of rent ≈ 4%, equities
//    ≈ 5–6%, savings accounts ≈ 2%), matching the HFCS finding that capital
//    income is negligible below the median and dominant near the top.
//  - Capital income is capped at 85% of total income: even rentiers report
//    some pension or director's salary.

const NET_ANNUAL_RETURN = 0.032
const PRIMARY_HOME_EQUITY_CAP = 300000
const MAX_CAPITAL_SHARE = 0.85

export function incomeSources(person) {
  const total = person.economics.netMonthlyIncome
  const { netWealth, homesOwned } = person.economics
  const homeEquity =
    homesOwned >= 1 ? Math.min(netWealth * 0.7, PRIMARY_HOME_EQUITY_CAP) : 0
  const yielding = Math.max(0, netWealth - homeEquity)
  const fromWealth = Math.min(
    Math.round((yielding * NET_ANNUAL_RETURN) / 12),
    Math.round(total * MAX_CAPITAL_SHARE),
  )
  return {
    total,
    fromWealth,
    fromWork: total - fromWealth,
    share: total > 0 ? fromWealth / total : 0,
  }
}
