export const normalizePhoneInput = (value) => {
  const input = String(value || '').trim();
  if (!input) return '';

  const hasInternationalPrefix = input.startsWith('+') || input.startsWith('00');
  let phone = input.replace(/\D/g, '');

  if (hasInternationalPrefix) {
    phone = `+${phone.replace(/^00/, '')}`;
  }

  if (/^03\d{9}$/.test(phone)) {
    phone = `+92${phone.slice(1)}`;
  } else if (/^3\d{9}$/.test(phone)) {
    phone = `+92${phone}`;
  } else if (/^\+9203\d{9}$/.test(phone)) {
    phone = `+92${phone.slice(4)}`;
  }

  return phone;
};

export const isValidPhoneInput = (value) => (
  /^\+?[\d\s().-]+$/.test(String(value || '').trim()) &&
  /^\+?\d{7,15}$/.test(normalizePhoneInput(value))
);

export const phoneValidationMessage =
  'Enter a valid phone number, for example +92 302 1949264 or 0302-1949264.';
