import { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CustomTextFieldTitle from './custom/CustomTextFieldTitle';
import { toast } from 'react-toastify';
import { CommonTextFieldSx } from './custom/CommonTextFieldSx';
import { createNewUser, updateExistingUser } from '../api/userService';
import { useTranslation } from 'react-i18next';
import { COUNTRY_CODES, parsePhoneNumber } from './custom/GlobalPhoneNumber';

const UserFormDrawer = ({ open, onClose, editId, initialData, onSuccess, visibleFieldsProp }) => {
  const { t } = useTranslation(['userEdit', 'common']);
  const theme = useTheme();

  const initialFormData = {
    name: '',
    surname: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    phoneCode: '+90',
    phoneNumber: '',
    description: '',
    isActive: false,
  };

  const DEFAULT_VISIBLE_FIELDS = {
    name: true,
    surname: true,
    username: true,
    password: true,
    email: true,
    phone: true,
    description: true,
    isActive: true,
  };

  const visibleFields = { ...DEFAULT_VISIBLE_FIELDS, ...visibleFieldsProp };

  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (editId && initialData) {
        const { phoneCode, phoneNumber } = parsePhoneNumber(initialData.phone);
        setFormData({
          name: initialData.name,
          surname: initialData.surname,
          username: initialData.username,
          password: '',
          email: initialData.email,
          phone: initialData.phone,
          phoneCode,
          phoneNumber,
          description: initialData.description,
          isActive: initialData.isActive,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [open, editId, initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (visibleFields.name && !formData.name?.trim()) {
      newErrors.name = t('ErrorEmptyName');
    }

    if (visibleFields.surname && !formData.surname?.trim()) {
      newErrors.surname = t('ErrorEmptySurname');
    }

    if (visibleFields.username && !formData.username?.trim()) {
      newErrors.username = t('ErrorEmptyUsername');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (visibleFields.email) {
      if (!formData.email?.trim()) {
        newErrors.email = t('ErrorEmptyEmail');
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = t('ErrorInvalidEmail');
      }
    }

    if (visibleFields.description && !formData.description?.trim()) {
      newErrors.description = t('ErrorEmptyDescription');
    }

    const phoneNumberRegex = /^\d{4,14}$/;

    if (visibleFields.phone) {
      if (!formData.phoneNumber?.trim()) {
        newErrors.phone = t('ErrorEmptyPhone');
      } else if (!phoneNumberRegex.test(formData.phoneNumber.replace(/\s+/g, ''))) {
        newErrors.phone = t('ErrorInvalidPhone');
      }
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/;
    if (visibleFields.password) {
      const pass = formData.password?.trim();

      if (!editId) {
        if (!pass) {
          newErrors.password = t('ErrorEmptyPassword');
        } else if (!passwordRegex.test(pass)) {
          newErrors.password = t('ErrorInvalidPassword');
        }
      } else {
        if (pass && !passwordRegex.test(pass)) {
          newErrors.password = t('ErrorInvalidPassword');
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.warning(t('ErrorInvalidForm'));
      return;
    }

    const fullPhone = `${formData.phoneCode} ${formData.phoneNumber.replace(/\s+/g, '')}`;

    const isFormUnchanged =
      editId &&
      initialData &&
      (formData.name ?? '') === (initialData.name ?? '') &&
      (formData.surname ?? '') === (initialData.surname ?? '') &&
      (formData.username ?? '') === (initialData.username ?? '') &&
      !formData.password?.trim() &&
      (formData.email ?? '') === (initialData.email ?? '') &&
      fullPhone === (initialData.phone ?? '') &&
      (formData.description ?? '') === (initialData.description ?? '') &&
      Boolean(formData.isActive ?? false) === Boolean(initialData.isActive ?? false);

    if (editId && isFormUnchanged) {
      toast.error(t('ErrorNoEdit'));
      return;
    }

    setIsSubmitting(true);

    const apiPayload = {
      isim: formData.name,
      soyisim: formData.surname,
      username: formData.username,
      ...(formData.password && { password: formData.password }),
      email: formData.email,
      telefon: fullPhone,
      aciklama: formData.description,
      isActive: formData.isActive,
    };

    try {
      if (editId) {
        await updateExistingUser(editId, apiPayload);
        toast.success(t('EditSuccess'));
      } else {
        await createNewUser(apiPayload);
        toast.success(t('NewUserSuccess'));
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.log('Kayıt oluşturulurken bir hata oluştu.', error);
      toast.error(t('ErrorProcessFail'));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handlePhoneCodeChange = (e) => {
    setFormData((prev) => ({ ...prev, phoneCode: e.target.value }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: null }));
    }
  };

  const handlePhoneNumberChange = (e) => {
    const raw = e.target.value.replace(/[^\d\s]/g, '');
    setFormData((prev) => ({ ...prev, phoneNumber: raw }));
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: null }));
    }
  };

  useEffect(() => {
    if (!open) {
      setErrors({});
    }
  }, [open]);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 550 },
          maxWidth: '100%',
          height: 'auto',
          maxHeight: '90vh',
          margin: 'auto',
          top: '5vh',
          right: { sm: '20px' },
          borderRadius: '20px',
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              color: theme.palette.text.primary,
            }}
          >
            {editId ? t('EditMode') : t('AddMode')}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: theme.palette.text.primary }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: theme.palette.divider }} />

        {visibleFields.name && (
          <>
            <CustomTextFieldTitle color={theme.palette.text.primary}>
              {t('Name', { ns: 'common' })}
            </CustomTextFieldTitle>
            <TextField
              name="name"
              size="small"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              placeholder={'John'}
              error={!!errors.name}
              helperText={errors.name}
              sx={CommonTextFieldSx}
            />
          </>
        )}

        {visibleFields.surname && (
          <>
            <CustomTextFieldTitle color={theme.palette.text.primary}>
              {t('Surname', { ns: 'common' })}
            </CustomTextFieldTitle>
            <TextField
              name="surname"
              size="small"
              fullWidth
              value={formData.surname}
              onChange={handleChange}
              placeholder={'Doe'}
              error={!!errors.surname}
              helperText={errors.surname}
              sx={CommonTextFieldSx}
            />
          </>
        )}

        {visibleFields.username && (
          <>
            <CustomTextFieldTitle color={theme.palette.text.primary}>
              {t('Username', { ns: 'common' })}
            </CustomTextFieldTitle>
            <TextField
              name="username"
              variant="outlined"
              size="small"
              value={formData.username}
              onChange={handleChange}
              placeholder={'johndoe'}
              error={!!errors.username}
              helperText={errors.username}
              sx={CommonTextFieldSx}
            />
          </>
        )}

        {visibleFields.password && (
          <>
            <CustomTextFieldTitle color={theme.palette.text.primary}>
              {t('Password', { ns: 'common' })}
            </CustomTextFieldTitle>
            <TextField
              name="password"
              variant="outlined"
              size="small"
              onChange={handleChange}
              placeholder={'********'}
              error={!!errors.password}
              helperText={errors.password}
              type={showPassword ? 'text' : 'password'}
              sx={CommonTextFieldSx}
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t('PassVis')}
                      onClick={handleClickShowPassword}
                      edge="end"
                      size="small"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        )}

        {visibleFields.email && (
          <>
            <CustomTextFieldTitle color={theme.palette.text.primary}>
              {t('Email', { ns: 'common' })}
            </CustomTextFieldTitle>
            <TextField
              name="email"
              variant="outlined"
              size="small"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              placeholder={'johndoe@gmail.com'}
              sx={CommonTextFieldSx}
            />
          </>
        )}

        {visibleFields.phone && (
          <>
            <CustomTextFieldTitle color={theme.palette.text.primary}>
              {t('Phone', { ns: 'common' })}
            </CustomTextFieldTitle>
            <Box display="flex" gap={1} alignItems="flex-start">
              <Select
                value={formData.phoneCode}
                onChange={handlePhoneCodeChange}
                size="small"
                variant="outlined"
                renderValue={(selected) => {
                  const country = COUNTRY_CODES.find((c) => c.code === selected);
                  return (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{country?.flag}</span>
                      <span
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: '0.8rem',
                          color: theme.palette.text.primary,
                        }}
                      >
                        {selected}
                      </span>
                    </Box>
                  );
                }}
                sx={{
                  minWidth: 100,
                  flexShrink: 0,
                  fontFamily: "'Montserrat', sans-serif",
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.text.primary,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.phone
                      ? theme.palette.error.main
                      : alpha(theme.palette.text.primary, 0.23),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.phone
                      ? theme.palette.error.main
                      : theme.palette.text.primary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.phone
                      ? theme.palette.error.main
                      : theme.palette.primary.main,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 260,
                      borderRadius: '10px',
                      mt: 0.5,
                      backgroundColor: theme.palette.background.paper,
                    },
                  },
                }}
              >
                {COUNTRY_CODES.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{country.flag}</span>
                      <Typography
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: '0.85rem',
                          color: theme.palette.text.primary,
                        }}
                      >
                        {country.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: '0.8rem',
                          color: theme.palette.text.secondary,
                          ml: 'auto',
                          pl: 1,
                        }}
                      >
                        {country.code}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>

              <TextField
                name="phoneNumber"
                variant="outlined"
                size="small"
                fullWidth
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder={'532 235 94 76'}
                error={!!errors.phone}
                helperText={errors.phone}
                inputProps={{ inputMode: 'numeric' }}
                sx={CommonTextFieldSx}
              />
            </Box>
          </>
        )}

        {visibleFields.description && (
          <>
            <CustomTextFieldTitle color={theme.palette.text.primary}>
              {t('Desc', { ns: 'common' })}
            </CustomTextFieldTitle>
            <TextField
              name="description"
              variant="outlined"
              size="small"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('DescPlaceholder')}
              error={!!errors.description}
              helperText={errors.description}
              sx={CommonTextFieldSx}
              multiline
              rows={3}
            />
          </>
        )}

        {visibleFields.isActive && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={handleChange}
                  name="isActive"
                  sx={{
                    color: theme.palette.text.primary,
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
                  }}
                />
              }
              label={
                <Typography
                  sx={{ fontFamily: "'Montserrat', sans-serif", color: theme.palette.text.primary }}
                >
                  {t('Active', { ns: 'common' })}
                </Typography>
              }
            />
          </>
        )}

        <Box display="flex" gap={2} mt={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            fullWidth
            disabled={isSubmitting}
            sx={{
              backgroundColor: editId ? theme.palette.secondary.main : theme.palette.primary.main,
              color: editId
                ? theme.palette.secondary.contrastText
                : theme.palette.primary.contrastText,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: editId ? theme.palette.secondary.dark : theme.palette.primary.dark,
              },
            }}
          >
            {editId ? t('Update') : t('Add')}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            sx={{
              color: theme.palette.text.primary,
              borderColor: alpha(theme.palette.text.primary, 0.5),
              fontFamily: "'Montserrat', sans-serif",
              textTransform: 'none',
              '&:hover': {
                borderColor: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.text.primary, 0.05),
              },
            }}
          >
            {t('Cancel', { ns: 'common' })}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default UserFormDrawer;
