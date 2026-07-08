import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  IconButton,
  Collapse,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
} from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';
import { useTheme, alpha } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import Translations from '../components/custom/Translations';

import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  colorSchemeDarkBlue,
} from 'ag-grid-community';
ModuleRegistry.registerModules([AllCommunityModule]);
import {
  AG_GRID_LOCALE_EN,
  AG_GRID_LOCALE_TR,
  AG_GRID_LOCALE_FR,
  AG_GRID_LOCALE_IT,
} from '@ag-grid-community/locale';

import {
  fetchUsers,
  fetchDepartments,
  createDepartment,
  updateDepartment,
  updateExistingUser,
} from '../api/userService';
import { COUNTRY_CODES, parsePhoneNumber } from '../components/custom/GlobalPhoneNumber';
import CustomDialogTitle from '../components/custom/CustomDialogTitle';

const filterOptions = createFilterOptions({
  limit: undefined,
  stringify: (option) => `${option.name} ${option.surname} ${option.phone}`,
});

function Departments() {
  const { t, i18n } = useTranslation('departments');
  const theme = useTheme();

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
        return AG_GRID_LOCALE_EN;
    }
  };

  const agGridTheme = useMemo(
    () => (theme.palette.mode === 'dark' ? themeQuartz.withPart(colorSchemeDarkBlue) : themeQuartz),
    [theme.palette.mode]
  );

  const DEPARTMENTS = [
    { value: 'Operation', label: t('departments:Operation') },
    { value: 'IT', label: t('departments:IT') },
    { value: 'HR', label: t('departments:HR') },
    { value: 'Software', label: t('departments:Software') },
    { value: 'Sales', label: t('departments:Sales') },
    { value: 'Marketing', label: t('departments:Marketing') },
    { value: 'Accounting', label: t('departments:Accounting') },
    { value: 'CustomerSupport', label: t('departments:CustomerSupport') },
  ];

  /*   const DEPARTMENTS = [
    { value: 'Operation', label: <Translations text="Operation" ns="departments" /> },
    { value: 'IT', label: <Translations text="IT" ns="departments" /> },
    { value: 'HR', label: <Translations text="HR" ns="departments" /> },
    { value: 'Software', label: <Translations text="Software" ns="departments" /> },
    { value: 'Sales', label: <Translations text="Sales" ns="departments" /> },
    { value: 'Marketing', label: <Translations text="Marketing" ns="departments" /> },
    { value: 'Accounting', label: <Translations text="Accounting" ns="departments" /> },
    { value: 'CustomerSupport', label: <Translations text="CustomerSupport" ns="departments" /> },
  ]; */

  const [departments, setDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [expanded, setExpanded] = useState({});

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDept, setAssignDept] = useState('');
  const [assignUser, setAssignUser] = useState(null);
  const [assignName, setAssignName] = useState('');
  const [assignSurname, setAssignSurname] = useState('');
  const [assignPhoneCode, setAssignPhoneCode] = useState('+90');
  const [assignPhoneNumber, setAssignPhoneNumber] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptData, userData] = await Promise.all([fetchDepartments(), fetchUsers()]);
      const merged = DEPARTMENTS.map((dept) => {
        const existing = deptData.find((d) => d.department_name === dept.value);
        return existing || { id: null, department_name: dept.value, staff: [] };
      });
      setDepartments(merged);
      setAllUsers(userData);
    } catch (error) {
      console.error(error);
      toast.error(<Translations text="DepartmentsLoadFail" ns="departments" />);
      //toast.error(t("DepartmentLoadFail"));
    }
  };

  const toggleExpand = (name) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const availableUserOptions = useMemo(() => {
    if (!assignDept) return allUsers;
    const dept = departments.find((d) => d.department_name === assignDept);
    const assignedIds = new Set((dept?.staff || []).map((s) => String(s.id)));
    return allUsers.filter((u) => !assignedIds.has(String(u.id)));
  }, [assignDept, departments, allUsers]);

  const openAssignDialog = () => {
    setAssignDept('');
    setAssignUser(null);
    setAssignName('');
    setAssignSurname('');
    setAssignPhoneCode('+90');
    setAssignPhoneNumber('');
    setAssignOpen(true);
  };

  const closeAssignDialog = () => {
    setAssignOpen(false);
    setAssignDept('');
    setAssignUser(null);
    setAssignName('');
    setAssignSurname('');
    setAssignPhoneCode('+90');
    setAssignPhoneNumber('');
  };

  const handleAssignDeptChange = (e) => {
    setAssignDept(e.target.value);
    setAssignUser(null);
    setAssignName('');
    setAssignSurname('');
    setAssignPhoneCode('+90');
    setAssignPhoneNumber('');
  };

  const handleAssignUserChange = (_, newValue) => {
    setAssignUser(newValue);
    setAssignName(newValue?.name || '');
    setAssignSurname(newValue?.surname || '');
    if (newValue?.phone) {
      const parsed = parsePhoneNumber(newValue.phone);
      setAssignPhoneCode(parsed.phoneCode);
      setAssignPhoneNumber(parsed.phoneNumber);
    } else {
      setAssignPhoneCode('+90');
      setAssignPhoneNumber('');
    }
  };

  const handleSaveAssign = async () => {
    if (!assignDept || !assignUser) return;
    try {
      const dept = departments.find((d) => d.department_name === assignDept);
      const combinedPhone = `${assignPhoneCode} ${assignPhoneNumber}`.trim();

      const newEntry = {
        id: assignUser.id,
        name: assignName,
        surname: assignSurname,
        phone: combinedPhone,
      };

      const newStaff = [
        ...(dept.staff || []).filter((s) => String(s.id) !== String(assignUser.id)),
        newEntry,
      ];

      let updatedDept;

      if (dept.id) {
        await updateDepartment(dept.id, {
          department_name: dept.department_name,
          staff: newStaff,
        });
        updatedDept = { ...dept, staff: newStaff };
      } else {
        const res = await createDepartment({
          department_name: dept.department_name,
          staff: newStaff,
        });
        updatedDept = { ...dept, id: res.data.id, staff: newStaff };
      }

      const hasUserChanged =
        assignName !== assignUser.name ||
        assignSurname !== assignUser.surname ||
        combinedPhone !== assignUser.phone;

      if (hasUserChanged) {
        await updateExistingUser(assignUser.id, {
          isim: assignName,
          soyisim: assignSurname,
          telefon: combinedPhone,
        });

        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === assignUser.id
              ? { ...u, name: assignName, surname: assignSurname, phone: combinedPhone }
              : u
          )
        );
      }

      setDepartments((prev) =>
        prev.map((d) => (d.department_name === assignDept ? updatedDept : d))
      );
      //toast.success(t('departments:DepartmentAssignSuccess'));
      toast.success(<Translations text="DepartmentAssignSuccess" ns="departments" />);
      closeAssignDialog();
    } catch (error) {
      console.error(error);
      //toast.error(t('departments:DepartmentAssignFail'));
      toast.error(<Translations text="CustomerSupport" ns="departments" />);
    }
  };

  const requestUnassign = (dept, staff) => {
    const deptConfig = DEPARTMENTS.find((d) => d.value === dept.department_name);
    const displayLabel = deptConfig ? deptConfig.label : dept.department_name;
    setDeleteTarget({
      deptId: dept.id,
      deptName: displayLabel,
      staffId: staff.id,
      staffName: `${staff.name} ${staff.surname}`,
    });
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const confirmUnassign = async () => {
    if (!deleteTarget) return;
    try {
      const dept = departments.find((d) => d.id === deleteTarget.deptId);
      const newStaff = (dept.staff || []).filter(
        (s) => String(s.id) !== String(deleteTarget.staffId)
      );
      await updateDepartment(dept.id, {
        department_name: dept.department_name,
        staff: newStaff,
      });
      setDepartments((prev) => prev.map((d) => (d.id === dept.id ? { ...d, staff: newStaff } : d)));
      //toast.success(t('departments:DepartmentUnassignSuccess'));
      toast.success(<Translations text="DepartmentUnassignSuccess" ns="departments" />);
    } catch (error) {
      console.error(error);
      //toast.error(t('departments:DepartmentUnassignFail'));
      toast.error(<Translations text="DepartmentUnassignFail" ns="departments" />);
    } finally {
      closeDeleteDialog();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            color: theme.palette.text.primary,
          }}
        >
          <Translations text="Title" ns="departments" />
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddAlt1Icon />}
          onClick={openAssignDialog}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 600,
            textTransform: 'none',
            padding: '10px 24px',
            borderRadius: '12px',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: theme.palette.secondary.light,
              boxShadow: `0px 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`,
            },
          }}
        >
          <Translations text="Assign" ns="departments" />
        </Button>
      </Box>

      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: `0px 4px 20px ${alpha(theme.palette.common.black, 0.03)}`,
          bgcolor: theme.palette.background.subtle,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          {departments.map((dept) => {
            const isOpen = Boolean(expanded[dept.department_name]);
            const deptConfig = DEPARTMENTS.find((d) => d.value === dept.department_name);
            const displayLabel = deptConfig ? deptConfig.label : dept.department_name;

            return (
              <Box
                key={dept.department_name}
                sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '14px',
                  mb: 2,
                  overflow: 'hidden',
                  '&:last-of-type': { mb: 0 },
                  bgcolor: theme.palette.background.paper,
                }}
              >
                <Box
                  onClick={() => toggleExpand(dept.department_name)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2.5,
                    py: 2,
                    cursor: 'pointer',
                    backgroundColor: theme.palette.grey[50],
                    '&:hover': { backgroundColor: theme.palette.grey[200] },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography
                      sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.925rem',
                        color: theme.palette.text.primary,
                      }}
                    >
                      {displayLabel}
                    </Typography>
                    <Chip
                      label={dept.staff.length}
                      size="small"
                      sx={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        backgroundColor: alpha(theme.palette.secondary.dark),
                        color: theme.palette.text.primary,
                      }}
                    />
                  </Box>
                  <IconButton
                    size="small"
                    sx={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  >
                    <KeyboardArrowDownIcon sx={{ color: theme.palette.text.primary }} />
                  </IconButton>
                </Box>

                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <Divider />
                  {dept.staff.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: theme.palette.grey[100] }}>
                      <Typography
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: '0.85rem',
                          color: theme.palette.text.secondary,
                        }}
                      >
                        <Translations text="Empty" ns="departments" />
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ height: 260, width: '100%' }}>
                      <AgGridReact
                        key={i18n.resolvedLanguage}
                        rowData={dept.staff}
                        theme={agGridTheme}
                        localeText={getAgGridLocale(i18n.resolvedLanguage)}
                        pagination={true}
                        paginationPageSize={20}
                        paginationPageSizeSelector={[20, 40, 100]}
                        suppressCellFocus={true}
                        columnDefs={[
                          {
                            field: 'name',
                            headerName: t('common:Name'),
                            flex: 1,
                          },
                          {
                            field: 'surname',
                            headerName: t('common:Surname'),
                            flex: 1,
                          },
                          {
                            field: 'phone',
                            headerName: t('common:Phone'),
                            flex: 1,
                          },
                          {
                            headerName: t('common:Actions'),
                            width: 100,
                            sortable: false,
                            filter: false,
                            cellRenderer: (params) => (
                              <IconButton
                                size="small"
                                onClick={() => requestUnassign(dept, params.data)}
                                sx={{ color: theme.palette.error.main }}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            ),
                          },
                        ]}
                      />
                    </Box>
                  )}
                </Collapse>
              </Box>
            );
          })}
        </CardContent>
      </Card>

      <Dialog
        open={assignOpen}
        onClose={closeAssignDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: '20px',
            border: `1px solid ${theme.palette.divider}`,
            p: 1.5,
            bgcolor: theme.palette.background.subtle,
            boxShadow: `0px 4px 20px ${alpha(theme.palette.common.black, 0.03)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            color: theme.palette.text.primary,
            pt: 2,
            px: 3,
          }}
        >
          <Translations text="AssignDialogTitle" ns="departments" />
        </DialogTitle>

        <DialogContent sx={{ px: 5, py: 2 }}>
          <FormControl fullWidth size="small" sx={{ mt: 1.5, mb: 4 }}>
            <InputLabel sx={{ fontFamily: "'Montserrat', sans-serif" }}>
              <Translations text="Department" ns="departments" />
            </InputLabel>
            <Select
              value={assignDept}
              label=<Translations text="Department" ns="departments" />
              onChange={handleAssignDeptChange}
              sx={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {DEPARTMENTS.map((dept) => (
                <MenuItem
                  key={dept.value}
                  value={dept.value}
                  sx={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {dept.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Autocomplete
            options={availableUserOptions}
            filterOptions={filterOptions}
            value={assignUser}
            onChange={handleAssignUserChange}
            getOptionLabel={(option) => `${option.name || ''} ${option.surname || ''}`.trim()}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={!assignDept}
            size="small"
            ListboxProps={{
              sx: {
                maxHeight: 250,
                overflow: 'auto',
              },
            }}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.875rem',
                    }}
                  >
                    {option.name} {option.surname}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '0.75rem',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {option.phone}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                //label={t('departments:SelectUser')}
                label=<Translations text="SelectUser" ns="departments" />
                placeholder={t('departments:SearchUser')}
                sx={{
                  '& .MuiInputBase-root': { fontFamily: "'Montserrat', sans-serif" },
                  '& .MuiInputLabel-root': { fontFamily: "'Montserrat', sans-serif" },
                }}
              />
            )}
            sx={{ mb: 4, pointerEvents: !assignDept ? 'none' : 'auto' }}
          />

          <TextField
            fullWidth
            size="small"
            //label={t('common:Name')}
            label=<Translations text="Name" />
            value={assignName}
            onChange={(e) => setAssignName(e.target.value)}
            disabled={!assignUser}
            sx={{
              mb: 4,
              pointerEvents: !assignUser ? 'none' : 'auto',
              '& .MuiInputBase-root': { fontFamily: "'Montserrat', sans-serif" },
              '& .MuiInputLabel-root': { fontFamily: "'Montserrat', sans-serif" },
            }}
          />

          <TextField
            fullWidth
            size="small"
            //label={t('common:Surname')}
            label=<Translations text="Surname" />
            value={assignSurname}
            onChange={(e) => setAssignSurname(e.target.value)}
            disabled={!assignUser}
            sx={{
              mb: 4,
              pointerEvents: !assignUser ? 'none' : 'auto',
              '& .MuiInputBase-root': { fontFamily: "'Montserrat', sans-serif" },
              '& .MuiInputLabel-root': { fontFamily: "'Montserrat', sans-serif" },
            }}
          />

          <Box display="flex" gap={1.5} alignItems="flex-start" sx={{ mb: 4 }}>
            <Select
              value={assignPhoneCode}
              onChange={(e) => setAssignPhoneCode(e.target.value)}
              disabled={!assignUser}
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
                        fontSize: '14px',
                        color: theme.palette.text.primary,
                      }}
                    >
                      {selected}
                    </span>
                  </Box>
                );
              }}
              sx={{
                minWidth: 110,
                pointerEvents: !assignUser ? 'none' : 'auto',
                flexShrink: 0,
                fontSize: '14px',
                fontFamily: "'Montserrat', sans-serif",
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
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
              size="small"
              fullWidth
              value={assignPhoneNumber}
              onChange={(e) => setAssignPhoneNumber(e.target.value)}
              disabled={!assignUser}
              placeholder="532 235 94 76"
              inputProps={{ inputMode: 'numeric' }}
              sx={{
                pointerEvents: !assignUser ? 'none' : 'auto',
                '& .MuiInputBase-root': { fontFamily: "'Montserrat', sans-serif" },
                '& .MuiInputLabel-root': { fontFamily: "'Montserrat', sans-serif" },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1.5 }}>
          <Button
            onClick={closeAssignDialog}
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              color: theme.palette.text.secondary,
              borderRadius: '10px',
            }}
          >
            <Translations text="Cancel" />
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAssign}
            disabled={!assignDept || !assignUser}
            sx={{
              backgroundColor: theme.palette.primary.main,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '10px',
              boxShadow: 'none',
              '&:hover': { backgroundColor: theme.palette.secondary.light, boxShadow: 'none' },
            }}
          >
            <Translations text="Save" />
          </Button>
        </DialogActions>
      </Dialog>

      <CustomDialogTitle
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmUnassign}
        //title={t('departments:UnassignTitle')}
        title=<Translations text="UnassignTitle" ns="departments" />
        text={
          deleteTarget
            ? t('departments:UnassignText', {
                staffName: deleteTarget.staffName,
                deptName: deleteTarget.deptName,
              })
            : ''
        }
      />
    </Container>
  );
}

export default Departments;
