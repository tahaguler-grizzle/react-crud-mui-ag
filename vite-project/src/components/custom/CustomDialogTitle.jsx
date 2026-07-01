import React, { use } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslation } from 'next-i18next/pages';

const CustomDialogTitle = ({ open, onClose, onConfirm, title, text }) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '8px',
          minWidth: '300px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          color: '#d32f2f',
        }}
      >
        <WarningIcon color="warning" fontSize="medium" />
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            color: '#555',
            fontSize: '0.95rem',
          }}
        >
          {text} <br />
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: '#161d20',
            borderColor: '#161d20',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              borderColor: '#161d20',
              backgroundColor: 'rgba(22, 29, 32, 0.05)',
            },
          }}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          autoFocus
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            textTransform: 'none',
            backgroundColor: '#d32f2f',
            '&:hover': {
              backgroundColor: '#b71c1c',
            },
          }}
        >
          {t('Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default CustomDialogTitle;
