export function getDisplayFormat(name: string): 'number' | 'status' | 'voltage' | 'current' | 'temperature' {
  const lower = name.toLowerCase();
  if (lower.includes('voltage')) return 'voltage';
  if (lower.includes('current')) return 'current';
  if (lower.includes('temp') || lower.includes('temperature')) return 'temperature';
  if (lower.includes('state') || lower.includes('error') || lower.includes('status')) return 'status';
  return 'number';
}

export function formatSignalValue(value: number, physicalValue: string | null, formatType: string): string {
  if (formatType === 'status' && physicalValue) {
    return physicalValue;
  }
  if (formatType === 'voltage') {
    return `${(value / 1000).toFixed(2)} V`;
  }
  if (formatType === 'current') {
    return `${value.toFixed(1)} A`;
  }
  if (formatType === 'temperature') {
    return `${value.toFixed(1)} °C`;
  }
  return physicalValue ? `${value} (${physicalValue})` : `${value}`;
}