const CATEGORY_ES: Record<string, string> = {
  'Principles of American Government': 'Principios del gobierno americano',
  'System of Government': 'Sistema de gobierno',
  'Rights and Responsibilities': 'Derechos y responsabilidades',
  'Colonial Period and Independence': 'Período colonial e independencia',
  '1800s': 'Los años 1800',
  'Recent American History and Other Important Historical Information':
    'Historia americana reciente y otra información histórica importante',
  'Symbols': 'Símbolos',
  'Holidays': 'Feriados',
}

export function getCategoryName(name: string, locale: string): string {
  if (locale === 'es') return CATEGORY_ES[name] ?? name
  return name
}
