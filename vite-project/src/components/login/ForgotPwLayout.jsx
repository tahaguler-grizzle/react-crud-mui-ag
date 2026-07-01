import { Box, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

function ForgotPwLayout({ children }) {
  const { user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: user ? '#FFFFF' : 'linear-gradient(135deg, #2b3234, #161d20, #283236)',
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: 4,
          width: {
            xs: 250,
            sm: 320,
            md: 450,
          },
          minHeight: '330px',
          borderRadius: {
            xs: '15px',
            sm: '30px',
            md: '40px',
          },
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
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

export default ForgotPwLayout;
