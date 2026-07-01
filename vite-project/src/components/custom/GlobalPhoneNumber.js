export const COUNTRY_CODES = [
  { code: '+90', flag: '🇹🇷', name: 'Türkiye' },
  { code: '+1', flag: '🇺🇸', name: 'ABD' },
  { code: '+44', flag: '🇬🇧', name: 'İngiltere' },
  { code: '+49', flag: '🇩🇪', name: 'Almanya' },
  { code: '+33', flag: '🇫🇷', name: 'Fransa' },
  { code: '+39', flag: '🇮🇹', name: 'İtalya' },
  { code: '+34', flag: '🇪🇸', name: 'İspanya' },
  { code: '+31', flag: '🇳🇱', name: 'Hollanda' },
  { code: '+32', flag: '🇧🇪', name: 'Belçika' },
  { code: '+41', flag: '🇨🇭', name: 'İsviçre' },
  { code: '+43', flag: '🇦🇹', name: 'Avusturya' },
  { code: '+48', flag: '🇵🇱', name: 'Polonya' },
  { code: '+46', flag: '🇸🇪', name: 'İsveç' },
  { code: '+47', flag: '🇳🇴', name: 'Norveç' },
  { code: '+45', flag: '🇩🇰', name: 'Danimarka' },
  { code: '+358', flag: '🇫🇮', name: 'Finlandiya' },
  { code: '+7', flag: '🇷🇺', name: 'Rusya' },
  { code: '+380', flag: '🇺🇦', name: 'Ukrayna' },
  { code: '+30', flag: '🇬🇷', name: 'Yunanistan' },
  { code: '+351', flag: '🇵🇹', name: 'Portekiz' },
  { code: '+40', flag: '🇷🇴', name: 'Romanya' },
  { code: '+420', flag: '🇨🇿', name: 'Çekya' },
  { code: '+36', flag: '🇭🇺', name: 'Macaristan' },
  { code: '+86', flag: '🇨🇳', name: 'Çin' },
  { code: '+81', flag: '🇯🇵', name: 'Japonya' },
  { code: '+82', flag: '🇰🇷', name: 'Güney Kore' },
  { code: '+91', flag: '🇮🇳', name: 'Hindistan' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladeş' },
  { code: '+62', flag: '🇮🇩', name: 'Endonezya' },
  { code: '+63', flag: '🇵🇭', name: 'Filipinler' },
  { code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { code: '+66', flag: '🇹🇭', name: 'Tayland' },
  { code: '+60', flag: '🇲🇾', name: 'Malezya' },
  { code: '+65', flag: '🇸🇬', name: 'Singapur' },
  { code: '+966', flag: '🇸🇦', name: 'Suudi Arabistan' },
  { code: '+971', flag: '🇦🇪', name: 'BAE' },
  { code: '+972', flag: '🇮🇱', name: 'İsrail' },
  { code: '+98', flag: '🇮🇷', name: 'İran' },
  { code: '+964', flag: '🇮🇶', name: 'Irak' },
  { code: '+20', flag: '🇪🇬', name: 'Mısır' },
  { code: '+27', flag: '🇿🇦', name: 'Güney Afrika' },
  { code: '+234', flag: '🇳🇬', name: 'Nijerya' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+212', flag: '🇲🇦', name: 'Fas' },
  { code: '+55', flag: '🇧🇷', name: 'Brezilya' },
  { code: '+52', flag: '🇲🇽', name: 'Meksika' },
  { code: '+54', flag: '🇦🇷', name: 'Arjantin' },
  { code: '+56', flag: '🇨🇱', name: 'Şili' },
  { code: '+57', flag: '🇨🇴', name: 'Kolombiya' },
  { code: '+61', flag: '🇦🇺', name: 'Avustralya' },
  { code: '+64', flag: '🇳🇿', name: 'Yeni Zelanda' },
];

export const parsePhoneNumber = (fullPhone) => {
  if (!fullPhone) return { phoneCode: '+90', phoneNumber: '' };

  const cleaned = fullPhone.trim();

  if (cleaned.startsWith('+')) {
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const country of sorted) {
      if (cleaned.startsWith(country.code)) {
        return {
          phoneCode: country.code,
          phoneNumber: cleaned.slice(country.code.length).trim(),
        };
      }
    }

    return { phoneCode: '+90', phoneNumber: cleaned };
  }

  // mockapi deki eski numarlar ile uyumlu olması için
  if (cleaned.startsWith('0')) {
    return { phoneCode: '+90', phoneNumber: cleaned.slice(1) };
  }

  return { phoneCode: '+90', phoneNumber: cleaned };
};
