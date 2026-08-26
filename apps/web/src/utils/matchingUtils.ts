export const cleanStr = (s?: string) => {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/\b(tata|hyundai|motors|motor|cars|india)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
};

export const extractTokens = (s?: string): string[] => {
  if (!s) return [];
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !['tata', 'hyundai', 'the', 'new', 'all', 'car', 'and', 'with'].includes(t));
};

const COLOR_GROUPS: string[][] = [
  ['white', 'whte', 'pristine', 'atlas', 'polar', 'calgary', 'pw'],
  ['black', 'dark', 'abyss', 'shadow', 'onyx', 'midnight'],
  ['grey', 'gray', 'daytona', 'titan', 'shadow', 'graphite'],
  ['red', 'fiery', 'flame', 'crimson', 'passion'],
  ['blue', 'opaline', 'starry', 'ocean', 'tata blue', 'teal', 'taiga'],
  ['green', 'foliage', 'camo', 'khaki', 'ranger'],
  ['gold', 'cosmic', 'bronze', 'copper', 'sand'],
  ['silver', 'sparkling', 'sleek', 'typhoon']
];

export const isSmartPbnaMatch = (booking: any, stock: any): boolean => {
  if (!booking || !stock) return false;

  // 1. Model Match (High priority)
  const bModel = cleanStr(booking.model);
  const sModel = cleanStr(stock.model);
  
  if (!bModel || !sModel) return false;
  const modelMatch = bModel === sModel || bModel.includes(sModel) || sModel.includes(bModel);
  if (!modelMatch) return false;

  // 2. Variant Match (Token-based overlap)
  const bVarTokens = extractTokens(booking.variant);
  const sVarTokens = extractTokens(stock.variant);

  let variantMatch = true;
  if (bVarTokens.length > 0 && sVarTokens.length > 0) {
    const commonTokens = bVarTokens.filter(t => sVarTokens.some(st => st === t || st.includes(t) || t.includes(st)));
    variantMatch = commonTokens.length > 0;
  }

  // 3. Colour Match (Semantic color keyword overlap)
  const bColClean = String(booking.colour || '').toLowerCase().trim();
  const sColClean = String(stock.color || stock.colour || '').toLowerCase().trim();

  let colorMatch = true;
  if (bColClean && sColClean && bColClean !== 'standard' && sColClean !== 'standard') {
    if (cleanStr(bColClean) === cleanStr(sColClean) || bColClean.includes(sColClean) || sColClean.includes(bColClean)) {
      colorMatch = true;
    } else {
      const bFamily = COLOR_GROUPS.find(group => group.some(kw => bColClean.includes(kw)));
      const sFamily = COLOR_GROUPS.find(group => group.some(kw => sColClean.includes(kw)));
      if (bFamily && sFamily) {
        colorMatch = bFamily === sFamily;
      }
    }
  }

  return modelMatch && variantMatch && colorMatch;
};
