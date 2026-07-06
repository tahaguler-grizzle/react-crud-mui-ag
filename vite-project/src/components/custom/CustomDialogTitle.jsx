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
import { useTranslation } from 'react-i18next';

const CustomDialogTitle = ({ open, onClose, onConfirm, title, text }) => {
  const { t } = useTranslation(['common']);

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
          color: 'error.main',
        }}
      >
        <WarningIcon color="warning" fontSize="medium" />
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            color: 'text.secondary',
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
          color="primary"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            textTransform: 'none',
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
          }}
        >
          {t('Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default CustomDialogTitle;
