import { type NextRequest, NextResponse } from 'next/server'

const STATE_CAPITALS: Record<string, string> = {
  AL: 'Montgomery', AK: 'Juneau', AZ: 'Phoenix', AR: 'Little Rock',
  CA: 'Sacramento', CO: 'Denver', CT: 'Hartford', DE: 'Dover',
  FL: 'Tallahassee', GA: 'Atlanta', HI: 'Honolulu', ID: 'Boise',
  IL: 'Springfield', IN: 'Indianapolis', IA: 'Des Moines', KS: 'Topeka',
  KY: 'Frankfort', LA: 'Baton Rouge', ME: 'Augusta', MD: 'Annapolis',
  MA: 'Boston', MI: 'Lansing', MN: 'Saint Paul', MS: 'Jackson',
  MO: 'Jefferson City', MT: 'Helena', NE: 'Lincoln', NV: 'Carson City',
  NH: 'Concord', NJ: 'Trenton', NM: 'Santa Fe', NY: 'Albany',
  NC: 'Raleigh', ND: 'Bismarck', OH: 'Columbus', OK: 'Oklahoma City',
  OR: 'Salem', PA: 'Harrisburg', RI: 'Providence', SC: 'Columbia',
  SD: 'Pierre', TN: 'Nashville', TX: 'Austin', UT: 'Salt Lake City',
  VT: 'Montpelier', VA: 'Richmond', WA: 'Olympia', WV: 'Charleston',
  WI: 'Madison', WY: 'Cheyenne', DC: 'Washington D.C.',
}

// Update this map when governors change after elections.
const GOVERNORS: Record<string, string> = {
  AL: 'Kay Ivey',
  AK: 'Mike Dunleavy',
  AZ: 'Katie Hobbs',
  AR: 'Sarah Huckabee Sanders',
  CA: 'Gavin Newsom',
  CO: 'Jared Polis',
  CT: 'Ned Lamont',
  DE: 'Matt Meyer',
  FL: 'Ron DeSantis',
  GA: 'Brian Kemp',
  HI: 'Josh Green',
  ID: 'Brad Little',
  IL: 'JB Pritzker',
  IN: 'Mike Braun',
  IA: 'Kim Reynolds',
  KS: 'Laura Kelly',
  KY: 'Andy Beshear',
  LA: 'Jeff Landry',
  ME: 'Janet Mills',
  MD: 'Wes Moore',
  MA: 'Maura Healey',
  MI: 'Gretchen Whitmer',
  MN: 'Tim Walz',
  MS: 'Tate Reeves',
  MO: 'Mike Kehoe',
  MT: 'Greg Gianforte',
  NE: 'Jim Pillen',
  NV: 'Joe Lombardo',
  NH: 'Kelly Ayotte',
  NM: 'Michelle Lujan Grisham',
  NY: 'Kathy Hochul',
  NC: 'Josh Stein',
  ND: 'Kelly Armstrong',
  OH: 'Mike DeWine',
  OK: 'Kevin Stitt',
  OR: 'Tina Kotek',
  PA: 'Josh Shapiro',
  RI: 'Dan McKee',
  SC: 'Henry McMaster',
  SD: 'Kristi Noem',
  TN: 'Bill Lee',
  TX: 'Greg Abbott',
  UT: 'Spencer Cox',
  VT: 'Phil Scott',
  WA: 'Bob Ferguson',
  WV: 'Patrick Morrisey',
  WI: 'Tony Evers',
  WY: 'Mark Gordon',
}

interface WimrMember {
  name: string
  party: string
  state: string
  district: string
  phone: string
  office: string
  link: string
}

interface WimrResponse {
  results: WimrMember[]
}

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip')
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'invalid zip' }, { status: 400 })
  }

  const res = await fetch(
    `https://whoismyrepresentative.com/getall_mems.php?zip=${zip}&output=json`,
  )

  if (!res.ok) {
    const body = await res.text()
    console.error('[officials] whoismyrepresentative error', res.status, body)
    return NextResponse.json({ error: 'lookup failed' }, { status: 502 })
  }

  const data = (await res.json()) as WimrResponse
  const members = data.results ?? []

  const senators = members.filter((m) => m.district === '').map((m) => m.name)
  const representative = members.find((m) => m.district !== '')?.name ?? ''
  const state = members[0]?.state ?? ''
  const governor = GOVERNORS[state] ?? ''
  const stateCapital = STATE_CAPITALS[state] ?? ''

  return NextResponse.json({ senators, representative, governor, stateCapital, state })
}
