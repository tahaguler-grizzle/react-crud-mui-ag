import { useState, useEffect, useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

import { fetchUsers, deleteUserById } from '../api/userService';
import UserFormDrawer from '../components/UserFormDrawer';

import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import CustomDialogTitle from '../components/custom/CustomDialogTitle';
import { CommonTextFieldSx } from '../components/custom/CommonTextFieldSx';

import { useTranslation } from 'react-i18next';

import {
  AG_GRID_LOCALE_EN,
  AG_GRID_LOCALE_TR,
  AG_GRID_LOCALE_FR,
  AG_GRID_LOCALE_IT,
} from '@ag-grid-community/locale';

function Dashboard() {
  const { t, i18n } = useTranslation(['dashboard', 'common']);

  const getAgGridLocale = (language) => {
    switch (language) {
      case 'tr':
        return AG_GRID_LOCALE_TR;
      case 'en':
        return AG_GRID_LOCALE_EN;
      case 'fr':
        return AG_GRID_LOCALE_FR;
      case 'it':
        return AG_GRID_LOCALE_IT;
      default:
        return AG_GRID_LOCALE_TR;
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [gridApi, setGridApi] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (gridApi) {
        gridApi.paginationGoToFirstPage();
      }
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm, gridApi]);

  const handleAddClick = () => {
    setEditId(null);
    setSelectedUser(null);
    setOpen(true);
  };

  const getUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.log('Başarısız Veri okunamadı...', error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  const handleDeleteClick = (id) => {
    setIdToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;

    try {
      await deleteUserById(idToDelete);
      toast.success(t('DeleteConfirm.Success'));
      getUsers();
    } catch (error) {
      console.log('Silinemedi', error);
      toast.error(t('DeleteConfirm.Fail'));
    } finally {
      setOpenDeleteDialog(false);
      setIdToDelete(null);
    }
  };

  const handleEdit = (row) => {
    setSelectedUser(row);
    setEditId(row.id);
    setOpen(true);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSuccess = () => {
    getUsers();
  };

  const columnDefs = useMemo(
    () => [
      {
        field: 'id',
        headerValueGetter: () => t('ID'),
        minWidth: 50,
        maxWidth: 60,
        hide: isMobile,
        flex: isMobile ? undefined : 0.3,
      },
      {
        field: 'name',
        headerValueGetter: () => t('Name', { ns: 'common' }),
        minWidth: 120,
        width: isMobile ? 120 : undefined,
        flex: isMobile ? undefined : 1,
      },
      {
        field: 'surname',
        headerValueGetter: () => t('Surname', { ns: 'common' }),
        minWidth: 120,
        width: isMobile ? 120 : undefined,
        flex: isMobile ? undefined : 1,
      },
      {
        field: 'email',
        headerValueGetter: () => t('Email', { ns: 'common' }),
        minWidth: 220,
        hide: isMobile,
        flex: isMobile ? undefined : 1.5,
      },
      {
        field: 'phone',
        headerValueGetter: () => t('Phone', { ns: 'common' }),
        minWidth: 150,
        hide: isMobile,
        flex: isMobile ? undefined : 1,
      },
      {
        field: 'description',
        headerValueGetter: () => t('Desc', { ns: 'common' }),
        minWidth: 150,
        hide: isMobile,
        flex: isMobile ? undefined : 1.5,
      },
      {
        field: 'isActive',
        headerValueGetter: () => t('Columns.Member'),
        minWidth: 120,
        width: isMobile ? 120 : undefined,
        flex: isMobile ? undefined : 1,
        cellRenderer: (params) => (params.value ? t('Rows.Member') : t('Rows.NoMember')),
      },
      {
        field: 'id',
        headerValueGetter: () => t('Columns.Actions'),
        minWidth: isMobile ? 140 : 220,
        width: isMobile ? 140 : undefined,
        flex: isMobile ? undefined : 1.5,
        headerClass: 'header-center',
        cellRenderer: (params) => {
          return (
            <Box
              display="flex"
              gap={1}
              width="100%"
              height="100%"
              justifyContent="center"
              alignItems="center"
            >
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={!isMobile ? <EditIcon /> : null}
                onClick={() => handleEdit(params.data)}
                sx={{
                  minWidth: isMobile ? 35 : 'auto',
                  padding: isMobile ? 1 : '4px 8px',
                  aspectRatio: isMobile ? '1/1' : 'auto',
                  fontFamily: "'Montserrat', sans-serif",
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {isMobile ? <EditIcon fontSize="small" /> : t('Edit', { ns: 'common' })}
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={!isMobile ? <DeleteIcon /> : null}
                onClick={() => handleDeleteClick(params.data.id)}
                sx={{
                  minWidth: isMobile ? 35 : 'auto',
                  padding: isMobile ? 1 : '4px 8px',
                  aspectRatio: isMobile ? '1/1' : 'auto',
                  fontFamily: "'Montserrat', sans-serif",
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {isMobile ? <DeleteIcon fontSize="small" /> : t('Delete', { ns: 'common' })}
              </Button>
            </Box>
          );
        },
      },
    ],
    [t, isMobile]
  );

  return (
    <Container maxWidth="xl" sx={{ marginTop: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            color: theme.palette.text.primary,
            letterSpacing: '-1px',
          }}
        >
          {t('StaffList')}
        </Typography>
      </Box>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { sm: 'center' },
          justifyContent: { sm: 'space-between' },
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClick}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            textTransform: 'none',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            '&:hover': {
              backgroundColor: theme.palette.secondary.light,
              boxShadow: `0px 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`,
            },
          }}
        >
          {t('AddUser')}
        </Button>
        <TextField
          label={t('SearchLabel')}
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          autoComplete="off"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: { xs: '100%', sm: 300 },
            ...CommonTextFieldSx,
          }}
        />
      </Box>

      <div className="ag-theme-quartz" style={{ height: 'calc(100vh - 300px)', width: '100%' }}>
        <AgGridReact
          key={i18n.resolvedLanguage}
          rowData={users}
          columnDefs={columnDefs}
          localeText={getAgGridLocale(i18n.resolvedLanguage)}
          pagination={true}
          paginationPageSize={isMobile ? 12 : 20}
          paginationPageSizeSelector={[12, 20, 40, 100]}
          quickFilterText={debouncedSearchTerm}
          onGridReady={(params) => {
            setGridApi(params.api);
            if (!isMobile) {
              params.api.sizeColumnsToFit();
            }
          }}
          onRowClicked={(event) => {
            if (event.event.target.closest('button')) {
              return;
            }
            router.push(`/user/${event.data.id}`);
          }}
          rowStyle={{ cursor: 'pointer' }}
        />
      </div>

      <UserFormDrawer
        open={open}
        onClose={() => setOpen(false)}
        editId={editId}
        initialData={selectedUser}
        onSuccess={handleSuccess}
      />

      <CustomDialogTitle
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={confirmDelete}
        title={t('DeleteConfirm.Title')}
        text={t('DeleteConfirm.Text')}
      />
    </Container>
  );
}

export default Dashboard;
