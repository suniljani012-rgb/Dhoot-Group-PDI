// Universal Date Formatter Utility for Dhoot Group Dealership Platform
// Formats all dates to standard DD-MMM-YYYY (e.g., 25-Aug-2026)

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Converts any date representation (ISO string, YYYY-MM-DD, DD/MM/YYYY, timestamp, or Excel serial number)
 * into standard DD-MMM-YYYY format (e.g. 25-Aug-2026).
 */
export function formatDate(input: string | number | Date | null | undefined): string {
  if (!input) return '—';

  try {
    // If input is an Excel serial date number (e.g., 45529)
    if (typeof input === 'number' || (!isNaN(Number(input)) && !String(input).includes('-') && !String(input).includes('/'))) {
      const serial = Number(input);
      if (serial > 20000 && serial < 80000) {
        // Excel serial date formula: (serial - 25569) * 86400 * 1000
        const jsDate = new Date((serial - 25569) * 86400 * 1000);
        if (!isNaN(jsDate.getTime())) {
          const day = String(jsDate.getDate()).padStart(2, '0');
          const month = MONTH_NAMES[jsDate.getMonth()];
          const year = jsDate.getFullYear();
          return `${day}-${month}-${year}`;
        }
      }
    }

    const str = String(input).trim();
    if (!str || str === 'null' || str === 'undefined' || str === '—') return '—';

    // Handle DD/MM/YYYY or DD-MM-YYYY
    const ddmmyyyyMatch = str.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
    if (ddmmyyyyMatch) {
      const day = String(parseInt(ddmmyyyyMatch[1], 10)).padStart(2, '0');
      const monthIdx = parseInt(ddmmyyyyMatch[2], 10) - 1;
      const year = ddmmyyyyMatch[3];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day}-${MONTH_NAMES[monthIdx]}-${year}`;
      }
    }

    // Handle standard parse
    const dateObj = new Date(str);
    if (isNaN(dateObj.getTime())) {
      return str; // Fallback to raw string if unparseable
    }

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[dateObj.getMonth()];
    const year = dateObj.getFullYear();

    return `${day}-${month}-${year}`;
  } catch {
    return String(input);
  }
}

/**
 * Formats date and time into DD-MMM-YYYY, hh:mm A
 */
export function formatDateTime(input: string | number | Date | null | undefined): string {
  if (!input) return '—';
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return formatDate(input);

    const dateStr = formatDate(d);
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');

    return `${dateStr}, ${hoursStr}:${minutes} ${ampm}`;
  } catch {
    return formatDate(input);
  }
}
