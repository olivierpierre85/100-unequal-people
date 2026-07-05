// Turns a profile's raw numbers into the concrete life-situation comparisons
// the project is about: same country, very different everyday lives.
// Pure functions of income/wealth so they stay consistent with the data.

function band(value, bands) {
  return bands.find(([max]) => value < max)[1]
}

export function lifestyle(person) {
  const income = person.economics.netMonthlyIncome
  const { netWealth, homesOwned } = person.economics

  return {
    housing: housingLabel(income, netWealth, homesOwned),
    holidays: band(income, [
      [1300, 'No real holidays — at best a day trip to the coast'],
      [1800, 'One budget week a year: camping, or staying with family'],
      [2600, 'One week abroad a year, booked months ahead on promotion'],
      [3500, 'A summer holiday abroad plus a city trip'],
      [5000, 'Two or three trips a year; skiing in winter is an option'],
      [9000, 'Several trips a year — skiing in winter, long-haul in summer'],
      [Infinity, 'Holidays are never a money question — just a calendar one'],
    ]),
    restaurants: band(income, [
      [1300, 'Almost never — the chip shop is the treat'],
      [1800, 'A few times a year, for special occasions'],
      [2600, 'About once a month'],
      [3500, 'A couple of times a month'],
      [5000, 'Every week, without checking the account first'],
      [Infinity, 'Whenever they feel like it'],
    ]),
    smartphone: band(income, [
      [1300, 'Second-hand or a hand-me-down; a cracked screen is a crisis'],
      [1800, 'Cheapest new model, paid off in instalments'],
      [2600, 'Mid-range, kept for four years'],
      [3500, 'Mid-range, replaced when it gets slow'],
      [5000, 'A recent flagship every couple of years'],
      [Infinity, 'The latest flagship on release day, without thinking'],
    ]),
    concert: band(income, [
      [1300, 'Impossible — a ticket is half a month of groceries'],
      [1800, 'Would take months of saving, so in practice: no'],
      [2600, 'A once-a-year splurge, cheapest tier, bought in the presale panic'],
      [3500, 'Doable if planned a few months ahead'],
      [5000, 'Sure — decent seats, hotel afterwards'],
      [Infinity, 'On a whim — golden circle, and dinner first'],
    ]),
  }
}

function housingLabel(income, netWealth, homesOwned) {
  if (homesOwned >= 3) return 'Owns their home plus several other properties'
  if (homesOwned === 2) {
    return 'Owns their home and a second property — rented out, or at the coast'
  }
  if (homesOwned === 1) {
    return netWealth >= 250000
      ? 'Owns their home, mortgage (nearly) paid off'
      : 'Owns their home — for now the bank owns most of it'
  }
  return income < 1400
    ? 'Rents — a big slice of each month goes to the landlord'
    : 'Rents, saving (or hoping) for a deposit'
}
