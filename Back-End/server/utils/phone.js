const normalizePhone = (value) => {
  if (value === undefined || value === null) return value;

  let phone = String(value).trim();
  if (!phone) return undefined;
  if (!/^\+?[\d\s().-]+$/.test(phone)) return phone;

  const hasInternationalPrefix = phone.startsWith('+') || phone.startsWith('00');
  phone = phone.replace(/\D/g, '');

  if (hasInternationalPrefix) {
    phone = `+${phone.replace(/^00/, '')}`;
  }

  // Normalize common Pakistani local/trunk-prefix formats.
  if (/^03\d{9}$/.test(phone)) {
    phone = `+92${phone.slice(1)}`;
  } else if (/^3\d{9}$/.test(phone)) {
    phone = `+92${phone}`;
  } else if (/^\+9203\d{9}$/.test(phone)) {
    phone = `+92${phone.slice(4)}`;
  }

  return phone;
};

const isValidPhone = (value) => {
  if (value && !/^\+?[\d\s().-]+$/.test(String(value).trim())) return false;
  const phone = normalizePhone(value);
  return !phone || /^\+?\d{7,15}$/.test(phone);
};

const phoneValidationMessage =
  'Please enter a valid phone number, for example +92 302 1949264 or 0302-1949264';

module.exports = {
  normalizePhone,
  isValidPhone,
  phoneValidationMessage,
};
