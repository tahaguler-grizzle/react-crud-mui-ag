import { createTheme } from '@mui/material/styles';
import lightTheme from './lightTheme';
import darkTheme from './darkTheme';

const shared = {
  typography: {
    fontFamily: "'Montserrat', sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
};

export function getTheme(mode) {
  const palette = mode === 'dark' ? darkTheme : lightTheme;
  return createTheme({
    ...shared,
    palette,
  });
}
