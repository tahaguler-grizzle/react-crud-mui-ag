import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Divider,
  Avatar,
  Grid,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../../context/AuthContext';
import { fetchUserById } from '../../api/userService';
import UserFormDrawer from '../../components/UserFormDrawer';
import CustomTextFieldTitle from '../../components/custom/CustomTextFieldTitle';
import CustomDialogTitle from '../../components/custom/CustomDialogTitle';
import { useTranslation } from 'next-i18next/pages';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import nextI18NextConfig from '../../../next-i18next.config.js';

function UserDetail({ id }) {
  const DB_NAME = 'AvatarStorage';
  const STORE_NAME = 'avatars';

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

  const getAvatarFromDB = async (userId) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
      const req = store.get(`avatar-${userId}`);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  };

  const saveAvatarToDB = async (userId, base64Image) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const store = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME);
      const req = store.put(base64Image, `avatar-${userId}`);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  };

  const deleteAvatarFromDB = async (userId) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const store = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME);
      const req = store.delete(`avatar-${userId}`);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  };

  const { t } = useTranslation('common');
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [dbAvatar, setDbAvatar] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const fileInputRef = useRef(null);

  const getData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await fetchUserById(id);
      setProfileData(data);
    } catch (error) {
      console.log('Kullanıcı detayı alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getAvatarFromDB(id)
      .then(setDbAvatar)
      .catch((err) => console.error('Avatar yüklenemedi:', err));
  }, [id]);

  const handleEditClick = () => setOpen(true);
  const handleSuccess = () => getData();

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('UserDetail.InvalidImage', 'Lütfen bir resim seçin.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      try {
        await saveAvatarToDB(id, base64);
        setDbAvatar(base64);
        const updateEvent = new Event('ProfilePictureUpdated');
        window.dispatchEvent(updateEvent);
      } catch (err) {
        console.error('Avatar kaydedilemedi:', err);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const confirmDelete = async () => {
    setOpenDeleteDialog(false);
    try {
      await deleteAvatarFromDB(id);
      setDbAvatar(null);
      const updateEvent = new Event('ProfilePictureUpdated');
      window.dispatchEvent(updateEvent);
    } catch (err) {
      console.error('Avatar silinemedi:', err);
    }
  };

  if (loading) return null;

  if (!profileData) {
    return (
      <Typography sx={{ mt: 4, textAlign: 'center', fontFamily: "'Montserrat', sans-serif" }}>
        {t('UserDetail.UserNotFound')}
      </Typography>
    );
  }

  const isOwner = String(currentUser?.id) === String(profileData.id);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{
          mb: 3,
          color: '#161d20',
          borderColor: '#161d20',
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: '10px',
          border: '1px solid',
          '&:hover': { borderColor: '#161d20', backgroundColor: 'rgba(22, 29, 32, 0.05)' },
        }}
      >
        {t('Back')}
      </Button>

      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          border: '1px solid #e0e0e0',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            gap={3}
            mb={4}
          >
            <Box
              sx={{
                position: 'relative',
                width: 100,
                height: 100,
                cursor: isOwner ? 'pointer' : 'default',
                '&:hover .avatar-overlay': { opacity: isOwner ? 1 : 0 },
              }}
            >
              <Avatar
                src={dbAvatar || undefined}
                sx={{
                  width: 100,
                  height: 100,
                  backgroundColor: '#4085a3',
                  fontSize: 40,
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  boxShadow: '0px 4px 12px rgba(22, 29, 32, 0.2)',
                }}
              >
                {!dbAvatar && (profileData.name?.charAt(0).toUpperCase() || 'U')}
              </Avatar>

              {isOwner && (
                <Box
                  className="avatar-overlay"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    bgcolor: 'rgba(0,0,0,0.45)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  <IconButton
                    onClick={dbAvatar ? () => setOpenDeleteDialog(true) : handleAvatarUpload}
                    sx={{ color: 'white', width: '100%', height: '100%' }}
                  >
                    {dbAvatar ? <DeleteIcon /> : <PhotoCameraIcon />}
                  </IconButton>
                </Box>
              )}
            </Box>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelected}
              style={{ display: 'none' }}
            />

            <Box textAlign={{ xs: 'center', sm: 'left' }}>
              <Typography
                variant="h4"
                sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: '#161d20' }}
              >
                {profileData.name} {profileData.surname}
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500, color: '#161d20' }}
              >
                @{profileData.username}
              </Typography>
              <Box
                display="inline-flex"
                alignItems="center"
                gap={0.5}
                mt={1}
                sx={{
                  bgcolor: profileData.isActive
                    ? 'rgba(46, 125, 50, 0.1)'
                    : 'rgba(211, 47, 47, 0.1)',
                  color: profileData.isActive ? '#2e7d32' : '#d32f2f',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                }}
              >
                {profileData.isActive ? (
                  <CheckCircleIcon fontSize="small" />
                ) : (
                  <CancelIcon fontSize="small" />
                )}
                {profileData.isActive ? t('UserDetail.Member') : t('UserDetail.NoMember')}
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <EmailIcon sx={{ color: '#4085a3' }} />
                <CustomTextFieldTitle height={24}>{t('Email')}</CustomTextFieldTitle>
              </Box>
              <Typography
                variant="body1"
                sx={{ fontFamily: "'Montserrat', sans-serif", color: '#555', ml: 4.5 }}
              >
                {profileData.email}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <PhoneIcon sx={{ color: '#4085a3' }} />
                <CustomTextFieldTitle height={24}>{t('Phone')}</CustomTextFieldTitle>
              </Box>
              <Typography
                variant="body1"
                sx={{ fontFamily: "'Montserrat', sans-serif", color: '#555', ml: 4.5 }}
              >
                {profileData.phone}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <InfoIcon sx={{ color: '#4085a3' }} />
                <CustomTextFieldTitle height={24}>{t('UserDetail.About')}</CustomTextFieldTitle>
              </Box>
              <Typography
                variant="body1"
                sx={{ fontFamily: "'Montserrat', sans-serif", color: '#555', ml: 4.5 }}
              >
                {profileData.description || t('UserDetail.EmptyAbout')}
              </Typography>
            </Grid>
          </Grid>

          <Box mt={5} display="flex" justifyContent="flex-end">
            {isOwner ? (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditClick}
                sx={{
                  minWidth: '220px',
                  backgroundColor: '#4085a3',
                  color: '#fff',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  textTransform: 'none',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#346b82',
                    boxShadow: '0px 4px 12px rgba(64, 133, 163, 0.2)',
                  },
                }}
              >
                {t('UserDetail.Edit')}
              </Button>
            ) : (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontStyle: 'italic', fontFamily: "'Montserrat', sans-serif" }}
              >
                {t('UserDetail.OwnerOnly')}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      <UserFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        editId={id}
        initialData={profileData}
        onSuccess={handleSuccess}
        visibleFieldsProp={{
          name: true,
          surname: true,
          username: true,
          password: false,
          email: true,
          phone: true,
          description: true,
          isActive: true,
        }}
      />

      <CustomDialogTitle
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDelete}
        title={t('UserDetail.DeleteAvatarTitle')}
        text={t('UserDetail.DeleteAvatarText')}
      />
    </Container>
  );
}

export default UserDetail;

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig)),
    },
  };
}
