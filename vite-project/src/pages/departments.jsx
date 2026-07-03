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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  const { t } = useTranslation(['departments', 'common']);
  const theme = useTheme();

  const DEPARTMENTS = [
    { value: 'Operation', label: t('Operation') },
    { value: 'IT', label: t('IT') },
    { value: 'HR', label: t('HR') },
    { value: 'Software', label: t('Software') },
    { value: 'Sales', label: t('Sales') },
    { value: 'Marketing', label: t('Marketing') },
    { value: 'Accounting', label: t('Accounting') },
    { value: 'CustomerSupport', label: t('CustomerSupport') },
  ];

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
      toast.error(t('DepartmentsLoadFail'));
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
      toast.success(t('DepartmentAssignSuccess'));
      closeAssignDialog();
    } catch (error) {
      console.error(error);
      toast.error(t('DepartmentAssignFail'));
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
      toast.success(t('DepartmentUnassignSuccess'));
    } catch (error) {
      console.error(error);
      toast.error(t('DepartmentUnassignFail'));
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
          {t('Title')}
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
          {t('Assign')}
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
                        color: theme.palette.secondary.main,
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
                    <KeyboardArrowDownIcon sx={{ color: theme.palette.primary.main }} />
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
                        {t('Empty')}
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer sx={{ maxHeight: 224 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 700,
                                bgcolor: theme.palette.grey[200],
                              }}
                            >
                              {t('Name', { ns: 'common' })}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 700,
                                bgcolor: theme.palette.grey[200],
                              }}
                            >
                              {t('Surname', { ns: 'common' })}
                            </TableCell>
                            <TableCell
                              sx={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 700,
                                bgcolor: theme.palette.grey[200],
                              }}
                            >
                              {t('Phone', { ns: 'common' })}
                            </TableCell>
                            <TableCell sx={{ bgcolor: theme.palette.grey[200] }} align="right" />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dept.staff.map((staff) => (
                            <TableRow key={staff.id} hover>
                              <TableCell
                                sx={{
                                  fontFamily: "'Montserrat', sans-serif",
                                  bgcolor: theme.palette.grey[100],
                                }}
                              >
                                {staff.name}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontFamily: "'Montserrat', sans-serif",
                                  bgcolor: theme.palette.grey[100],
                                }}
                              >
                                {staff.surname}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontFamily: "'Montserrat', sans-serif",
                                  bgcolor: theme.palette.grey[100],
                                }}
                              >
                                {staff.phone}
                              </TableCell>
                              <TableCell align="right" sx={{ bgcolor: theme.palette.grey[100] }}>
                                <IconButton
                                  size="small"
                                  onClick={() => requestUnassign(dept, staff)}
                                  sx={{ color: theme.palette.error.main }}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
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
          sx: { borderRadius: '20px', p: 1.5, bgcolor: theme.palette.background.subtle },
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
          {t('AssignDialogTitle')}
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 1 }}>
          <FormControl fullWidth size="small" sx={{ mt: 1.5, mb: 3 }}>
            <InputLabel sx={{ fontFamily: "'Montserrat', sans-serif" }}>
              {t('Department')}
            </InputLabel>
            <Select
              value={assignDept}
              label={t('Department')}
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
                label={t('SelectUser')}
                placeholder={t('SearchUser')}
                sx={{
                  '& .MuiInputBase-root': { fontFamily: "'Montserrat', sans-serif" },
                  '& .MuiInputLabel-root': { fontFamily: "'Montserrat', sans-serif" },
                }}
              />
            )}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            size="small"
            label={t('Name', { ns: 'common' })}
            value={assignName}
            onChange={(e) => setAssignName(e.target.value)}
            disabled={!assignUser}
            sx={{
              mb: 3,
              '& .MuiInputBase-root': { fontFamily: "'Montserrat', sans-serif" },
              '& .MuiInputLabel-root': { fontFamily: "'Montserrat', sans-serif" },
            }}
          />

          <TextField
            fullWidth
            size="small"
            label={t('Surname', { ns: 'common' })}
            value={assignSurname}
            onChange={(e) => setAssignSurname(e.target.value)}
            disabled={!assignUser}
            sx={{
              mb: 3,
              '& .MuiInputBase-root': { fontFamily: "'Montserrat', sans-serif" },
              '& .MuiInputLabel-root': { fontFamily: "'Montserrat', sans-serif" },
            }}
          />

          <Box display="flex" gap={1.5} alignItems="flex-start" sx={{ mb: 3 }}>
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
                minWidth: 110,
                flexShrink: 0,
                fontFamily: "'Montserrat', sans-serif",
                //backgroundColor: theme.palette.background.paper,
                /* '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider,
                }, */
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
            {t('Cancel', { ns: 'common' })}
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAssign}
            disabled={!assignDept || !assignUser}
            sx={{
              backgroundColor: theme.palette.secondary.main,
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '10px',
              boxShadow: 'none',
              '&:hover': { backgroundColor: theme.palette.secondary.light, boxShadow: 'none' },
            }}
          >
            {t('Save', { ns: 'common' })}
          </Button>
        </DialogActions>
      </Dialog>

      <CustomDialogTitle
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmUnassign}
        title={t('UnassignTitle')}
        text={
          deleteTarget
            ? t('UnassignText', {
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
