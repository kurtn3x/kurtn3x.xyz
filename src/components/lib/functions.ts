import { Notify } from 'quasar';

// Export individual utility functions
export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(console.error);
  Notify.create({
    type: 'positive',
    message: 'Copied to clipboard.',
  });
}

const decimalFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 1,
});

const binaryFormatter = new Intl.NumberFormat('en', {
  maximumFractionDigits: 1,
});

export function fileSizeDecimal(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (Math.abs(bytes) < 1000) return bytes + ' B';

  const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
  const k = 1000;
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return decimalFormatter.format(value) + ' ' + units[i - 1];
}

export function fileSizeBinary(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (Math.abs(bytes) < 1024) return bytes + ' B';

  const units = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  const k = 1024;
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return binaryFormatter.format(value) + ' ' + units[i - 1];
}

export function transferedPercentLabel(num: number) {
  if (num > 0.99) {
    return '100%';
  } else {
    return Math.round(num * 100) + '%';
  }
}
