import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Switch,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  TextField,
  Slider,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import HomeIcon from '@mui/icons-material/Home';
import PublicIcon from '@mui/icons-material/Public';
import TimerIcon from '@mui/icons-material/Timer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MessageIcon from '@mui/icons-material/Message';
import PhonelinkLockIcon from '@mui/icons-material/PhonelinkLock';
import { useAuth } from '../../context/AuthContext';
import { fetchUserSettings, updateUserSettings } from '../../api/userService';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../../context/ThemeModeContext';
import { useTheme } from '@mui/material/styles';

function Settings() {
  const { t } = useTranslation(['settings', 'common']);
  const { setMode } = useThemeMode();
  const theme = useTheme();

  const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Istanbul',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  const DEFAULT_PAGES = [
    { value: 'Dashboard', label: t('DefaultPages.Dashboard') },
    { value: 'Profile', label: t('DefaultPages.Profile') },
    { value: 'Raporlar', label: t('DefaultPages.Reports') },
    { value: 'Settings', label: t('DefaultPages.Settings') },
  ];

  const DND_OPTIONS = [
    { value: 'off', label: t('DND.Off') },
    { value: '1h', label: t('DND.1Hour') },
    { value: '4h', label: t('DND.4Hour') },
    { value: '8h', label: t('DND.8Hour') },
    { value: 'always', label: t('DND.Always') },
  ];

  const DATE_FORMATS = [
    { value: 'DD/MM/YYYY', label: t('DateFormats.DD/MM/YYYY') },
    { value: 'MM/DD/YYYY', label: t('DateFormats.MM/DD/YYYY') },
    { value: 'YYYY-MM-DD', label: t('DateFormats.YYYY-MM-DD') },
  ];

  const [darkMode, setDarkMode] = useState('light');
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [dnd, setDnd] = useState('off');
  const [defaultPage, setDefaultPage] = useState('Dashboard');
  const [timezone, setTimezone] = useState(null);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [soundEffects, setSoundEffects] = useState(true);

  const [twoFASms, setTwoFASms] = useState(false);
  const [twoFAEmail, setTwoFAEmail] = useState(false);
  const [twoFAAuth, setTwoFAAuth] = useState(false);

  const [tempTwoFASms, setTempTwoFASms] = useState(false);
  const [tempTwoFAEmail, setTempTwoFAEmail] = useState(false);
  const [tempTwoFAAuth, setTempTwoFAAuth] = useState(false);

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [originalSettings, setOriginalSettings] = useState(null);

  const hasChanges =
    originalSettings &&
    (darkMode !== originalSettings.darkMode ||
      emailNotif !== originalSettings.emailNotif ||
      pushNotif !== originalSettings.pushNotif ||
      dnd !== originalSettings.dnd ||
      defaultPage !== originalSettings.defaultPage ||
      timezone !== originalSettings.timezone ||
      sessionTimeout !== originalSettings.sessionTimeout ||
      dateFormat !== originalSettings.dateFormat ||
      soundEffects !== originalSettings.soundEffects ||
      twoFASms !== originalSettings.twoFASms ||
      twoFAEmail !== originalSettings.twoFAEmail ||
      twoFAAuth !== originalSettings.twoFAAuth);

  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchUserSettings(user.id);
      setDarkMode(data.darkMode ? 'dark' : 'light');
      setEmailNotif(data.emailNot);
      setPushNotif(data.pushNot);
      setDnd(data.DND || 'off');
      setDefaultPage(data.defaultPage || 'Dashboard');
      setTimezone(data.timeZone || 'UTC');
      setSessionTimeout(data.sessionTimeout || 70);
      setDateFormat(data.dateFormat || 'DD/MM/YYYY');
      setSoundEffects(data.soundEffects);
      setTwoFASms(data.twoFASms);
      setTwoFAEmail(data.twoFAEmail);
      setTwoFAAuth(data.twoFAAuth);

      setOriginalSettings({
        darkMode: data.darkMode ? 'dark' : 'light',
        emailNotif: data.emailNot,
        pushNotif: data.pushNot,
        dnd: data.DND || 'off',
        defaultPage: data.defaultPage || 'Dashboard',
        timezone: data.timeZone || 'UTC',
        sessionTimeout: data.sessionTimeout || 70,
        dateFormat: data.dateFormat || 'DD/MM/YYYY',
        soundEffects: data.soundEffects,
        twoFASms: data.twoFASms,
        twoFAEmail: data.twoFAEmail,
        twoFAAuth: data.twoFAAuth,
      });
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDarkMode = (_, val) => {
    if (val) setDarkMode(val);
    setMode(val);
  };
  const handleEmailNotif = (e) => setEmailNotif(e.target.checked);
  const handlePushNotif = (e) => setPushNotif(e.target.checked);
  const handleDnd = (e) => setDnd(e.target.value);
  const handleDefaultPage = (e) => setDefaultPage(e.target.value);
  const handleTimezone = (_, val) => setTimezone(val);
  const handleSessionTimeout = (_, val) => setSessionTimeout(val);
  const handleDateFormat = (e) => setDateFormat(e.target.value);
  const handleSoundEffects = (e) => setSoundEffects(e.target.checked);

  const handleSave = async () => {
    if (!user?.id) return;
    try {
      const payload = {
        darkMode: darkMode === 'dark',
        emailNot: emailNotif,
        pushNot: pushNotif,
        DND: dnd,
        defaultPage,
        timeZone: timezone,
        sessionTimeout,
        dateFormat,
        soundEffects,
        twoFASms,
        twoFAEmail,
        twoFAAuth,
      };
      await updateUserSettings(user.id, payload);
      setOriginalSettings({
        darkMode,
        emailNotif,
        pushNotif,
        dnd,
        defaultPage,
        timezone,
        sessionTimeout,
        dateFormat,
        soundEffects,
        twoFASms,
        twoFAEmail,
        twoFAAuth,
      });
      toast.success(t('SettingsSaveSuccess'));
    } catch (error) {
      console.error('Ayarlar Kaydedilemedi: ', error);
      toast.error(t('SettingsSaveFail'));
    }
  };

  const handleCancel = () => {
    if (!originalSettings) return;
    setDarkMode(originalSettings.darkMode);
    setMode(originalSettings.darkMode);
    setEmailNotif(originalSettings.emailNotif);
    setPushNotif(originalSettings.pushNotif);
    setDnd(originalSettings.dnd);
    setDefaultPage(originalSettings.defaultPage);
    setTimezone(originalSettings.timezone);
    setSessionTimeout(originalSettings.sessionTimeout);
    setDateFormat(originalSettings.dateFormat);
    setSoundEffects(originalSettings.soundEffects);
    setTwoFASms(originalSettings.twoFASms);
    setTwoFAEmail(originalSettings.twoFAEmail);
    setTwoFAAuth(originalSettings.twoFAAuth);
  };

  const openTwoFA = () => {
    setTempTwoFASms(twoFASms);
    setTempTwoFAEmail(twoFAEmail);
    setTempTwoFAAuth(twoFAAuth);
    setTwoFAOpen(true);
  };

  const saveTwoFA = () => {
    setTwoFASms(tempTwoFASms);
    setTwoFAEmail(tempTwoFAEmail);
    setTwoFAAuth(tempTwoFAAuth);
    setTwoFAOpen(false);
  };

  if (loading) return null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          color: theme.palette.primary.light,
          mb: 4,
        }}
      >
        {t('Title')}
      </Typography>

      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <DarkModeIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('DarkMode')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <ToggleButtonGroup
                value={darkMode}
                exclusive
                onChange={handleDarkMode}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    px: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.secondary,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-selected:hover': { backgroundColor: theme.palette.primary.dark },
                  },
                }}
              >
                <ToggleButton value="light">
                  <LightModeIcon sx={{ fontSize: 15, mr: 0.75 }} />
                  {t('Light')}
                </ToggleButton>
                <ToggleButton value="dark">
                  <DarkModeIcon sx={{ fontSize: 15, mr: 0.75 }} />
                  {t('Dark')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <SecurityIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('2FA.Title')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <Button
                variant="outlined"
                onClick={openTwoFA}
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '10px',
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.light,
                    backgroundColor: `${theme.palette.primary.main}15`,
                  },
                }}
              >
                {t('2FA.ButtonTitle')}
              </Button>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <TimerIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('SessionTimeout')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <Box sx={{ width: 210 }}>
                <Slider
                  value={sessionTimeout}
                  min={5}
                  max={120}
                  step={5}
                  onChange={handleSessionTimeout}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v} ` + t('TimeoutUnit').charAt(0)}
                  sx={{
                    color: theme.palette.primary.main,
                    '& .MuiSlider-thumb': { boxShadow: 'none' },
                  }}
                />
                <Box display="flex" justifyContent="space-between" mt={-0.5}>
                  <Typography
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '0.7rem',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    5 {t('TimeoutUnit').charAt(0)}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '0.7rem',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    120 {t('TimeoutUnit').charAt(0)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <EmailIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('EmailNotifications')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <Switch
                checked={emailNotif}
                onChange={handleEmailNotif}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: theme.palette.primary.main },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <NotificationsActiveIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('PushNotifications')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <Switch
                checked={pushNotif}
                onChange={handlePushNotif}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: theme.palette.primary.main },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <DoNotDisturbOnIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('DND.Title')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <FormControl size="small" sx={{ minWidth: 165 }}>
                <InputLabel
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.875rem',
                    color: theme.palette.text.secondary,
                  }}
                >
                  {t('DND.DNDDuration')}
                </InputLabel>
                <Select
                  value={dnd}
                  label="DND Duration"
                  onChange={handleDnd}
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  {DND_OPTIONS.map((opt) => (
                    <MenuItem
                      key={opt.value}
                      value={opt.value}
                      sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.875rem' }}
                    >
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <HomeIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('DefaultPage')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <FormControl size="small" sx={{ minWidth: 165 }}>
                <InputLabel
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: '0.875rem',
                    color: theme.palette.text.secondary,
                  }}
                >
                  {t('Page')}
                </InputLabel>
                <Select
                  value={defaultPage}
                  label="Page"
                  onChange={handleDefaultPage}
                  sx={{
                    fontFamily: "'Montserrat', sans-serif",
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    color: theme.palette.text.primary,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  {DEFAULT_PAGES.map((page) => (
                    <MenuItem
                      key={page.value}
                      value={page.value}
                      sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.875rem' }}
                    >
                      {page.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <PublicIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('TimeZone')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <Autocomplete
                options={TIMEZONES}
                value={timezone}
                onChange={handleTimezone}
                size="small"
                sx={{ width: 250 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('TimeZone')}
                    sx={{
                      '& .MuiInputBase-root': {
                        borderRadius: '10px',
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: '0.875rem',
                        color: theme.palette.text.primary,
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: '0.875rem',
                        color: theme.palette.text.secondary,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.divider,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  />
                )}
                ListboxProps={{
                  sx: { fontFamily: "'Montserrat', sans-serif", fontSize: '0.875rem' },
                }}
              />
            </Box>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <CalendarMonthIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('DateFormat')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <RadioGroup row value={dateFormat} onChange={handleDateFormat}>
                {DATE_FORMATS.map((fmt) => (
                  <FormControlLabel
                    key={fmt.value}
                    value={fmt.value}
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: theme.palette.text.secondary,
                          '&.Mui-checked': { color: theme.palette.primary.main },
                        }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: '0.8rem',
                          color: theme.palette.text.primary,
                        }}
                      >
                        {fmt.label}
                      </Typography>
                    }
                  />
                ))}
              </RadioGroup>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <VolumeUpIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('SoundEffects')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <Checkbox
                checked={soundEffects}
                onChange={handleSoundEffects}
                sx={{
                  color: theme.palette.text.secondary,
                  '&.Mui-checked': { color: theme.palette.primary.main },
                }}
              />
            </Box>
          </Box>

          <Box display="flex" justifyContent="flex-end" mt={4} gap={2}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={!hasChanges}
              sx={{
                minWidth: '120px',
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                textTransform: 'none',
                padding: '10px 24px',
                borderRadius: '12px',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&.Mui-disabled': {
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.secondary,
                },
                '&:hover': {
                  borderColor: theme.palette.primary.light,
                  backgroundColor: `${theme.palette.primary.main}15`,
                },
              }}
            >
              {t('Cancel', { ns: 'common' })}
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                minWidth: '120px',
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600,
                textTransform: 'none',
                padding: '10px 24px',
                borderRadius: '12px',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  boxShadow: `0px 4px 12px ${theme.palette.primary.main}30`,
                },
              }}
            >
              {t('Save', { ns: 'common' })}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Dialog
        open={twoFAOpen}
        onClose={() => setTwoFAOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '20px', p: 1, backgroundColor: theme.palette.background.paper },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            color: theme.palette.text.primary,
            pb: 0.5,
          }}
        >
          {t('2FA.Title')}
        </DialogTitle>

        <DialogContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <MessageIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('2FA.SMS')}
              </Typography>
            </Box>
            <Switch
              checked={tempTwoFASms}
              onChange={(e) => setTempTwoFASms(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: theme.palette.primary.main },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <EmailIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('Email', { ns: 'common' })}
              </Typography>
            </Box>
            <Switch
              checked={tempTwoFAEmail}
              onChange={(e) => setTempTwoFAEmail(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: theme.palette.primary.main },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <PhonelinkLockIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('2FA.AuthApp')}
              </Typography>
            </Box>

            <Switch
              checked={tempTwoFAAuth}
              onChange={(e) => setTempTwoFAAuth(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: theme.palette.primary.main },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            onClick={() => setTwoFAOpen(false)}
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              color: theme.palette.text.secondary,
              borderRadius: '10px',
            }}
          >
            {t('Cancel', { ns: 'common' })}
          </Button>
          <Button
            variant="contained"
            onClick={saveTwoFA}
            sx={{
              backgroundColor: theme.palette.primary.main,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '10px',
              boxShadow: 'none',
              '&:hover': { backgroundColor: theme.palette.primary.dark, boxShadow: 'none' },
            }}
          >
            {t('Save', { ns: 'common' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Settings;
