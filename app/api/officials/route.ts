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

interface CivicOffice {
  name: string
  levels?: string[]
  roles?: string[]
  officialIndices: number[]
}

interface CivicOfficial {
  name: string
}

interface CivicResponse {
  normalizedInput?: { state?: string }
  offices?: CivicOffice[]
  officials?: CivicOfficial[]
}

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get('zip')
  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: 'invalid zip' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_CIVIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }

  const res = await fetch(
    `https://civicinfo.googleapis.com/civicinfo/v2/representatives?address=${zip}&key=${apiKey}`,
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'lookup failed' }, { status: 502 })
  }

  const data = (await res.json()) as CivicResponse
  const officialsList = data.officials ?? []
  const offices = data.offices ?? []

  const nameAt = (indices: number[]) =>
    indices.map((i) => officialsList[i]?.name).filter((n): n is string => Boolean(n))

  let senators: string[] = []
  let representative = ''
  let governor = ''

  for (const office of offices) {
    const roles = office.roles ?? []
    const levels = office.levels ?? []
    const names = nameAt(office.officialIndices)

    if (roles.includes('legislatorUpperBody')) {
      senators = names
    } else if (roles.includes('legislatorLowerBody')) {
      representative = names[0] ?? ''
    } else if (roles.includes('headOfGovernment') && levels.includes('administrativeArea1')) {
      governor = names[0] ?? ''
    }
  }

  const state = data.normalizedInput?.state ?? ''
  const stateCapital = STATE_CAPITALS[state] ?? ''

  return NextResponse.json({ senators, representative, governor, stateCapital, state })
}
