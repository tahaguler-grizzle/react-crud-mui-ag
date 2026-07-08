import { Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function LoginLayout({ children }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.background.gradient,
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: 4,
          width: {
            xs: 250,
            sm: 320,
            md: 500,
          },
          minHeight: '330px',
          borderRadius: {
            xs: '15px',
            sm: '30px',
            md: '40px',
          },
          backdropFilter: 'blur(12px)',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}

export default LoginLayout;
