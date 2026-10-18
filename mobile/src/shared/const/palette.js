// Single source of truth for colors: consumed by tailwind.config.js (className tokens)
// and by TypeScript code that needs raw values (icon colors, placeholder colors).
const palette = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
  },
  ink: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    700: '#334155',
    900: '#0F172A',
  },
  success: {
    50: '#ECFDF5',
    600: '#059669',
    700: '#047857',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    700: '#B45309',
  },
  danger: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  info: {
    50: '#EFF6FF',
    600: '#2563EB',
    700: '#1D4ED8',
  },
  white: '#FFFFFF',
  black: '#000000',
  backdrop: 'rgba(15,23,42,0.45)',
};

module.exports = { palette };
