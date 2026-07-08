import { use, useState } from 'react';
import { TextField, Button, Typography, Box, Divider, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Translations from '../custom/Translations';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';

function LoginForm() {
  const { t } = useTranslation('login');
  const router = useRouter();
  const { login } = useAuth();
  const theme = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleSubmit = async () => {
    setIsDisabled(true);

    const result = await login(username, password);

    if (!result.success) {
      const defaultMsg = t('login:LoginFail');
      toast.error(t(`login:${result.message}`, { defaultValue: defaultMsg }));
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
        label=<Translations text="Username" ns="common" />
        fullWidth
        size="small"
        value={username}
        autoComplete="off"
        onChange={(e) => setUsername(e.target.value)}
      />

      <TextField
        label=<Translations text="Password" ns="common" />
        type={showPassword ? 'text' : 'password'}
        fullWidth
        size="small"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="off"
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
          router.push('/forgotpw');
        }}
        sx={{
          color: theme.palette.primary.main,
          backgroundColor: 'transparent',
          textTransform: 'none',
          alignSelf: 'flex-end',
          mt: -2,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      >
        <Translations text="ForgotPassword" ns="login" />
      </Button>

      <Button
        variant="contained"
        size="large"
        sx={{
          borderRadius: 5,
          width: '50%',
          alignSelf: 'center',
          background: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          textTransform: 'none',
          fontSize: '1rem',
          boxShadow: 0,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
            boxShadow: 0,
          },
        }}
        onClick={handleSubmit}
        disabled={isDisabled}
      >
        <Translations text="Login" ns="login" />
      </Button>
    </Box>
  );
}

export default LoginForm;
