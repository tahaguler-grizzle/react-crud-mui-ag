import { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next/pages';
import { useRouter } from 'next/router';
import WestIcon from '@mui/icons-material/West';
import { updateExistingUser, fetchUsers } from '../../api/userService';

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/;

function ForgotPwForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [formValues, setFormValues] = useState({ credential: '', newPw: '', reEnter: '' });
  const [showPassword, setShowPassword] = useState({
    credential: false,
    newPw: false,
    reEnter: false,
  });
  const [isDisabled, setIsDisabled] = useState(false);
  const [errors, setErrors] = useState({ credential: false, newPw: false, reEnter: false });

  const handleClickShowPassword = (fieldName) =>
    setShowPassword((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };

  const handleSubmit = async () => {
    setIsDisabled(true);
    const { credential, newPw, reEnter } = formValues;

    if (!credential || !newPw || !reEnter) {
      toast.error(t('ToastMessage.ErrorEmptyForm'));
      setErrors({
        credential: !credential,
        newPw: !newPw,
        reEnter: !reEnter,
      });
      setIsDisabled(false);
      return;
    }

    if (!passwordRegex.test(newPw)) {
      toast.error(t('ToastMessage.ErrorWeakPassword'));
      setErrors({ credential: false, newPw: true, reEnter: true });
      setIsDisabled(false);
      return;
    }

    if (newPw !== reEnter) {
      toast.error(t('ToastMessage.ErrorDifferentPasswordFields'));
      setErrors({ credential: false, newPw: true, reEnter: true });
      setIsDisabled(false);
      return;
    }

    if (user) {
      if (credential !== user.password) {
        toast.error(t('ToastMessage.ErrorWrongCurrentPassword'));
        setErrors({ credential: true, newPw: false, reEnter: false });
        setIsDisabled(false);
        return;
      }

      if (credential === newPw) {
        toast.error(t('ToastMessage.ErrorSamePassword'));
        setErrors({ credential: false, newPw: true, reEnter: true });
        setIsDisabled(false);
        return;
      }

      try {
        const payload = {
          isim: user.name,
          soyisim: user.surname,
          telefon: user.phone,
          aciklama: user.description,
          email: user.email,
          isActive: user.isActive,
          username: user.username,
          password: newPw,
        };

        await updateExistingUser(user.id, payload);

        const updatedUserObj = {
          ...user,
          password: newPw,
        };
        localStorage.setItem('user', JSON.stringify(updatedUserObj));
        setUser(updatedUserObj);
        toast.success(t('ToastMessage.ChangePasswordSuccess'));
        setFormValues({ credential: '', newPw: '', reEnter: '' });
        setErrors({ credential: false, newPw: false, reEnter: false });
      } catch (error) {
        toast.error(t('ToastMessage.ChangePasswordFail'));
      }
    } else {
      try {
        const users = await fetchUsers();
        const targetUser = users.find((u) => u.username === credential);

        if (!targetUser) {
          toast.error(t('ToastMessage.UserNotFound'));
          setErrors({ credential: true, newPw: false, reEnter: false });
          setIsDisabled(false);
          return;
        }

        if (targetUser.password === newPw) {
          toast.error(t('ToastMessage.ErrorSamePassword'));
          setErrors({ credential: false, newPw: true, reEnter: true });
          setIsDisabled(false);
          return;
        }

        const payload = {
          isim: targetUser.name,
          soyisim: targetUser.surname,
          telefon: targetUser.phone,
          aciklama: targetUser.description,
          email: targetUser.email,
          isActive: targetUser.isActive,
          username: targetUser.username,
          password: newPw,
        };

        await updateExistingUser(targetUser.id, payload);
        toast.success(t('ToastMessage.ChangePasswordSuccess'));
        setFormValues({ credential: '', newPw: '', reEnter: '' });
        setErrors({ credential: false, newPw: false, reEnter: false });
      } catch (error) {
        toast.error(t('ToastMessage.ChangePasswordFail'));
      }
    }

    setIsDisabled(false);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} width="100%">
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        position="relative"
        sx={{ width: '100%', minHeight: 100 }}
      >
        <Button
          variant="contained"
          startIcon={<WestIcon />}
          size="small"
          onClick={() => router.back()}
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 'auto',
            backgroundColor: '#161d20',
            color: '#ffffff',
            textTransform: 'none',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#2b3234',
            },
          }}
        >
          {t('Back')}
        </Button>

        <Box
          component="img"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKrfWHfu7t7nVjKwfkdAYTRGdg4WI5XP5zlQ&s"
          alt="Logo"
          sx={{
            width: 100,
            height: 100,
            objectFit: 'contain',
            borderRadius: '50%',
          }}
        />
      </Box>

      <TextField
        name="credential"
        label={user ? t('PwReset.CurrentPw') : t('Username')}
        type={user ? (showPassword.credential ? 'text' : 'password') : 'text'}
        fullWidth
        size="small"
        value={formValues.credential}
        onChange={handleInputChange}
        error={errors.credential}
        autoComplete="off"
        sx={{
          '& label.Mui-focused': {
            color: errors.credential ? 'error.main' : '#161d20',
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: errors.credential ? 'error.main' : '#161d20',
            },
          },
        }}
        slotProps={
          user
            ? {
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleClickShowPassword('credential')}
                        edge="end"
                        size="small"
                      >
                        {showPassword.credential ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }
            : undefined
        }
      />

      <TextField
        name="newPw"
        label={t('PwReset.NewPw')}
        type={showPassword.newPw ? 'text' : 'password'}
        fullWidth
        size="small"
        value={formValues.newPw}
        onChange={handleInputChange}
        error={errors.newPw}
        autoComplete="off"
        sx={{
          '& label.Mui-focused': {
            color: errors.newPw ? 'error.main' : '#161d20',
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: errors.newPw ? 'error.main' : '#161d20',
            },
          },
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleClickShowPassword('newPw')}
                  edge="end"
                  size="small"
                >
                  {showPassword.newPw ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        name="reEnter"
        label={t('PwReset.ReEnterPw')}
        type={showPassword.reEnter ? 'text' : 'password'}
        fullWidth
        size="small"
        value={formValues.reEnter}
        onChange={handleInputChange}
        error={errors.reEnter}
        autoComplete="off"
        sx={{
          '& label.Mui-focused': {
            color: errors.reEnter ? 'error.main' : '#161d20',
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: errors.reEnter ? 'error.main' : '#161d20',
            },
          },
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleClickShowPassword('reEnter')}
                  edge="end"
                  size="small"
                >
                  {showPassword.reEnter ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

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
        {t('PwReset.ChangePwButton')}
      </Button>
    </Box>
  );
}

export default ForgotPwForm;
