import { use, useState } from 'react';
import { TextField, Button, Typography, Box, Divider, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next/pages';
import { useRouter } from 'next/router';

function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async () => {
    setIsDisabled(true);

    const result = await login(username, password);

    if (!result.success) {
      toast.error(result.message || t('Login.LoginFail'));
      setIsDisabled(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} width="100%">
      <Box
        component="img"
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKrfWHfu7t7nVjKwfkdAYTRGdg4WI5XP5zlQ&s"
        alt="Logo"
        sx={{
          width: 100,
          height: 100,
          objectFit: 'contain',
          marginBottom: 2,
          borderRadius: '50%',
          alignSelf: 'center',
        }}
      />

      <TextField
        label={t('Username')}
        fullWidth
        size="small"
        value={username}
        autoComplete="off"
        onChange={(e) => setUsername(e.target.value)}
        sx={{
          '& label.Mui-focused': {
            color: '#161d20',
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: '#161d20',
            },
          },
        }}
      />

      <TextField
        label={t('Password')}
        type={showPassword ? 'text' : 'password'}
        fullWidth
        size="small"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="off"
        sx={{
          '& label.Mui-focused': {
            color: '#161d20',
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: '#161d20',
            },
          },
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} edge="end" size="small">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        variant="text"
        onClick={() => {
          router.push('/forgot-pw');
        }}
        sx={{
          color: '#161D20',
          backgroundColor: 'transparent',
          textTransform: 'none',
          alignSelf: 'flex-end',
          mt: -2,
          '&:hover': {
            backgroundColor: 'rgba(0, 98, 255, 0.08)',
          },
        }}
      >
        {t('Login.ForgotPassword')}
      </Button>

      <Button
        variant="contained"
        size="large"
        sx={{
          borderRadius: 5,
          width: '50%',
          alignSelf: 'center',
          background: '#161d20',
          color: '#ffffff',
          textTransform: 'none',
          fontSize: '1rem',
          boxShadow: 0,
          '&:hover': {
            backgroundColor: '#2b3234',
            boxShadow: 0,
          },
        }}
        onClick={handleSubmit}
        disabled={isDisabled}
      >
        {t('Login.Login')}
      </Button>
    </Box>
  );
}

export default LoginForm;
