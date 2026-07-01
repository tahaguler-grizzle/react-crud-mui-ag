import { useState, useEffect, useRef } from 'react';
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
  Avatar,
  Select,
  MenuItem,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CustomTextFieldTitle from './custom/CustomTextFieldTitle';
import { toast } from 'react-toastify';
import { CommonTextFieldSx } from './custom/CommonTextFieldSx';
import { createNewUser, updateExistingUser } from '../api/userService';
import { t } from 'i18next';
import { COUNTRY_CODES, parsePhoneNumber } from './custom/GlobalPhoneNumber';

const UserFormDrawer = ({ open, onClose, editId, initialData, onSuccess, visibleFieldsProp }) => {
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
      newErrors.name = t('UserEdit.ErrorEmptyName');
    }

    if (visibleFields.surname && !formData.surname?.trim()) {
      newErrors.surname = t('UserEdit.ErrorEmptySurname');
    }

    if (visibleFields.username && !formData.username?.trim()) {
      newErrors.username = t('UserEdit.ErrorEmptyUsername');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (visibleFields.email) {
      if (!formData.email?.trim()) {
        newErrors.email = t('UserEdit.ErrorEmptyEmail');
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = t('UserEdit.ErrorInvalidEmail');
      }
    }

    if (visibleFields.description && !formData.description?.trim()) {
      newErrors.description = t('UserEdit.ErrorEmptyDescription');
    }

    const phoneNumberRegex = /^\d{4,14}$/;

    if (visibleFields.phone) {
      if (!formData.phoneNumber?.trim()) {
        newErrors.phone = t('UserEdit.ErrorEmptyPhone');
      } else if (!phoneNumberRegex.test(formData.phoneNumber.replace(/\s+/g, ''))) {
        newErrors.phone = t('UserEdit.ErrorInvalidPhone');
      }
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/;
    if (visibleFields.password) {
      const pass = formData.password?.trim();

      if (!editId) {
        if (!pass) {
          newErrors.password = t('UserEdit.ErrorEmptyPassword');
        } else if (!passwordRegex.test(pass)) {
          newErrors.password = t('UserEdit.ErrorInvalidPassword');
        }
      } else {
        if (pass && !passwordRegex.test(pass)) {
          newErrors.password = t('UserEdit.ErrorInvalidPassword');
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.warning(t('ToastMessage.ErrorInvalidForm'));
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
      toast.error(t('ToastMessage.ErrorNoEdit'));
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
        toast.success(t('ToastMessage.EditSuccess'));
      } else {
        await createNewUser(apiPayload);
        toast.success(t('ToastMessage.NewUserSuccess'));
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.log('Kayıt oluşturulurken bir hata oluştu.', error);
      toast.error(t('ToastMessage.ErrorProcessFail'));
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

  const selectedCountry =
    COUNTRY_CODES.find((c) => c.code === formData.phoneCode) ?? COUNTRY_CODES[0];

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
          backgroundColor: '#f8f9fa',
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
          <Typography variant="h6" sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>
            {editId ? t('UserEdit.EditMode') : t('UserEdit.AddMode')}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider />

        {visibleFields.name && (
          <>
            <CustomTextFieldTitle>{t('Name')}</CustomTextFieldTitle>
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
            <CustomTextFieldTitle>{t('Surname')}</CustomTextFieldTitle>
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
            <CustomTextFieldTitle>{t('Username')}</CustomTextFieldTitle>
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
            <CustomTextFieldTitle>{t('Password')}</CustomTextFieldTitle>
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
                      aria-label={t('UserEdit.PassVis')}
                      onClick={handleClickShowPassword}
                      edge="end"
                      size="small"
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
            <CustomTextFieldTitle>{t('Email')}</CustomTextFieldTitle>
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
            <CustomTextFieldTitle>{t('Phone')}</CustomTextFieldTitle>
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
                          color: '#000000',
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
                  backgroundColor: '#f8f9fa',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.phone ? '#d32f2f' : 'rgba(0,0,0,0.23)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.phone ? '#d32f2f' : '#161d20',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: errors.phone ? '#d32f2f' : '#161d20',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 260,
                      borderRadius: '10px',
                      mt: 0.5,
                    },
                  },
                }}
              >
                {COUNTRY_CODES.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{country.flag}</span>
                      <Typography
                        sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.85rem' }}
                      >
                        {country.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: '0.8rem',
                          color: '#666',
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
            <CustomTextFieldTitle>{t('Desc')}</CustomTextFieldTitle>
            <TextField
              name="description"
              variant="outlined"
              size="small"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('UserEdit.DescPlaceholder')}
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
                    color: '#161d20',
                    '&.Mui-checked': {
                      color: '#161d20',
                    },
                  }}
                />
              }
              label={
                <Typography sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {t('UserEdit.Active')}
                </Typography>
              }
            />
          </>
        )}

        <Box display="flex" gap={2} mt={2} flexDirection={{ xs: 'column', sm: 'row' }}>
          <Button
            variant="contained"
            color={editId ? 'warning' : 'primary'}
            onClick={handleSave}
            fullWidth
            disabled={isSubmitting}
            sx={{
              backgroundColor: editId ? '#4085a3' : '#161d20',
              color: '#ffffff',
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: editId ? '#346b82' : '#2b3234',
              },
            }}
          >
            {editId ? t('UserEdit.Update') : t('UserEdit.Add')}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            fullWidth
            sx={{
              color: '#161d20',
              borderColor: '#161d20',
              fontFamily: "'Montserrat', sans-serif",
              textTransform: 'none',
              '&:hover': {
                borderColor: '#161d20',
                backgroundColor: 'rgba(22, 29, 32, 0.05)',
              },
            }}
          >
            {t('Cancel')}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default UserFormDrawer;
