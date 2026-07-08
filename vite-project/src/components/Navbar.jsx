import * as React from 'react';
import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from '../context/AuthContext';
import FormControl from '@mui/material/FormControl';
import TranslateIcon from '@mui/icons-material/Translate';
import Select from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import Translations from '../components/custom/Translations';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material/styles';
import { useThemeMode } from '../context/ThemeModeContext';

const DB_NAME = 'AvatarStorage';
const STORE_NAME = 'avatars';
const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' },
  { code: 'fr', label: 'FR' },
  { code: 'it', label: 'IT' },
];

function Navbar() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();

  const [dbAvatar, setDbAvatar] = useState(null);

  const initDB = () =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });

  const pages = [
    { id: 'Staff', label: <Translations text="Staff" ns="navbar" /> },
    { id: 'Reports', label: <Translations text="Reports" ns="navbar" /> },
    { id: 'Departments', label: <Translations text="Departments" ns="navbar" /> },
  ];

  const settings = [
    { id: 'Profile', label: <Translations text="UserProfile" ns="navbar" /> },
    { id: 'Change_password', label: <Translations text="ChangePw" ns="navbar" /> },
    { id: 'Settings', label: <Translations text="Settings" ns="navbar" /> },
    { id: 'Logout', label: <Translations text="Logout" ns="navbar" /> },
  ];

  const { logout, user } = useAuth();
  const id = user?.id;

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [language, setLanguage] = React.useState(i18n.resolvedLanguage);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleMenuClick = (setting) => {
    handleCloseUserMenu();
    if (setting == 'Logout') {
      logout();
    }
    if (setting == 'Change_password') {
      router.push('/user/forgot-pw');
    }
    if (setting == 'Profile') {
      router.push(`/user/${id}`);
    }
    if (setting == 'Settings') {
      router.push('/user/settings');
    }
  };

  const handlePageClick = (setting) => {
    handleCloseNavMenu();
    if (setting == 'Staff') {
      router.push(`/user/${id}`);
    }
    if (setting == 'Reports') {
      router.push('/reports');
    }
    if (setting == 'Departments') {
      router.push('/departments');
    }
  };

  const handleChangeLanguage = (event) => {
    const selectedLng = event.target.value;
    setLanguage(selectedLng);
    i18n.changeLanguage(selectedLng);
  };

  const handleThemeChange = () => {
    toggleMode();
  };

  const getAvatarFromDB = async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
      const req = store.get(`avatar-${id}`);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  };

  useEffect(() => {
    const handleAvatarUpdate = () => {
      if (!id) {
        setDbAvatar(null);
        return;
      }
      getAvatarFromDB(id)
        .then(setDbAvatar)
        .catch((err) => console.error('Avatar yüklenemedi:', err));
    };

    handleAvatarUpdate();

    window.addEventListener('ProfilePictureUpdated', handleAvatarUpdate);
    return () => {
      window.removeEventListener('ProfilePictureUpdated', handleAvatarUpdate);
    };
  }, [id]);

  const logoUrl =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKrfWHfu7t7nVjKwfkdAYTRGdg4WI5XP5zlQ&s';

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor:
          theme.palette.mode === 'dark'
            ? theme.palette.background.paper
            : theme.palette.primary.main,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box
            component="img"
            src={logoUrl}
            onClick={() => {
              router.push('/dashboard');
            }}
            alt="Logo"
            sx={{
              display: { xs: 'none', md: 'flex' },
              mr: 1,
              height: 40,
              width: 40,
              borderRadius: '50%',
              objectFit: 'contain',
            }}
          />

          <Typography
            variant="h6"
            noWrap
            component="a"
            onClick={() => {
              router.push('/dashboard');
            }}
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,

              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Translations text="Title" ns="navbar" />
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.id}
                  onClick={() => {
                    handlePageClick(page.id);
                  }}
                >
                  <Typography textAlign="center" sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {page.label}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box
            component="img"
            src={logoUrl}
            alt="Logo"
            sx={{
              display: { xs: 'flex', md: 'none' },
              mr: 1,
              height: 35,
              width: 35,
              borderRadius: '50%',
              objectFit: 'contain',
            }}
          />

          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Translations text="TitleSmall" ns="navbar" />
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.id}
                onClick={() => {
                  handlePageClick(page.id);
                }}
                sx={{
                  my: 2,
                  color: theme.palette.primary.contrastText,
                  display: 'block',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.light,
                  },
                }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          <IconButton
            onClick={() => {
              handleThemeChange();
            }}
            /* sx={{
            bgcolor: 'transparent',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '.MuiSelect-select': {
              paddingRight: '0px !important',
              paddingLeft: '8px',
              display: 'flex',
              alignItems: 'center',
            },
          }} */
          >
            {mode === 'light' ? (
              <DarkModeIcon sx={{ color: theme.palette.primary.contrastText }} />
            ) : (
              <LightModeIcon sx={{ color: theme.palette.primary.contrastText }} />
            )}
          </IconButton>

          <FormControl sx={{ mr: 2, minWidth: 40 }}>
            <Select
              value={language}
              onChange={handleChangeLanguage}
              IconComponent={() => null}
              renderValue={() => <TranslateIcon sx={{ color: 'white' }} />}
              sx={{
                bgcolor: 'transparent',
                height: '38px',
                '.MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '.MuiSelect-select': {
                  paddingRight: '0px !important',
                  paddingLeft: '8px',
                  display: 'flex',
                  alignItems: 'center',
                },
              }}
            >
              {LANGUAGES.map((lang) => (
                <MenuItem
                  key={lang.code}
                  value={lang.code}
                  sx={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 0 }}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar
                alt={user?.name || 'User'}
                src={dbAvatar || undefined}
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
                  color: theme.palette.primary.contrastText,
                  fontWeight: 700,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {!dbAvatar && (user?.name ? user.name.charAt(0).toUpperCase() : 'U')}
              </Avatar>
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.id}
                  onClick={() => handleMenuClick(setting.id)}
                  sx={{ justifyContent: 'left', textAlign: 'center' }}
                >
                  <Typography textAlign="center" sx={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {setting.label}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;
