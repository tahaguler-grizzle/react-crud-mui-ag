import { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Button,
  Chip,
  Divider,
  useMediaQuery,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { fetchUsers } from '../api/userService';
import { useTranslation } from 'react-i18next';
import { useTheme, alpha } from '@mui/material/styles';

import {
  AG_GRID_LOCALE_EN,
  AG_GRID_LOCALE_TR,
  AG_GRID_LOCALE_FR,
  AG_GRID_LOCALE_IT,
} from '@ag-grid-community/locale';

ModuleRegistry.registerModules([AllCommunityModule]);

function Reports() {
  const { t, i18n } = useTranslation(['reports', 'common']);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [users, setUsers] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [pdfScope, setPdfScope] = useState('all');

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

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
    }
  };

  const activeCount = users.filter((u) => u.isActive).length;
  const passiveCount = users.filter((u) => !u.isActive).length;

  const handleGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const columnDefs = useMemo(
    () => [
      {
        field: 'id',
        headerValueGetter: () => t('ID'),
        width: 70,
        minWidth: 70,
        suppressMovable: true,
      },
      {
        field: 'name',
        headerValueGetter: () => t('Name'),
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'surname',
        headerValueGetter: () => t('Surname'),
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'username',
        headerValueGetter: () => t('Username'),
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'email',
        headerValueGetter: () => t('Email'),
        flex: 1.5,
        minWidth: 180,
      },
      {
        field: 'phone',
        headerValueGetter: () => t('Phone'),
        flex: 1,
        minWidth: 140,
      },
      {
        field: 'isActive',
        headerValueGetter: () => t('Status', { ns: 'reports' }),
        flex: 1,
        minWidth: 120,
        cellRenderer: (params) => (
          <Chip
            label={params.value ? t('Active') : t('Passive')}
            size="small"
            sx={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 24,
              backgroundColor: params.value ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: params.value ? '#16a34a' : '#dc2626',
            }}
          />
        ),
      },
    ],
    [t]
  );

  const handleDownloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      let dataToExport = users;
      if (pdfScope === 'grid' && gridApi) {
        const filteredData = [];

        const currentPage = gridApi.paginationGetCurrentPage();
        const pageSize = gridApi.paginationGetPageSize();
        const startRow = currentPage * pageSize;
        const endRow = startRow + pageSize;
        let currentIndex = 0;

        gridApi.forEachNodeAfterFilterAndSort((node) => {
          if (currentIndex >= startRow && currentIndex < endRow) {
            if (node.data) {
              filteredData.push(node.data);
            }
          }
          currentIndex++;
        });

        dataToExport = filteredData;
      }

      const doc = new jsPDF({ orientation: 'landscape' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(110, 144, 196);
      doc.text(t('Title', { ns: 'reports' }), 14, 20);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(138, 159, 184);
      const now = new Date().toLocaleString('tr-TR');
      doc.text(`Generated: ${now}`, 14, 28);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(110, 144, 196);
      doc.text(`${t('TotalUsers', { ns: 'reports' })}: ${dataToExport.length}`, 14, 40);
      doc.setTextColor(34, 197, 94);
      doc.text(`${t('Active')}: ${dataToExport.filter((u) => u.isActive).length}`, 70, 40);
      doc.setTextColor(239, 68, 68);
      doc.text(`${t('Passive')}: ${dataToExport.filter((u) => !u.isActive).length}`, 120, 40);

      autoTable(doc, {
        startY: 50,
        head: [
          [
            t('ID'),
            t('Name'),
            t('Surname'),
            t('Username'),
            t('Email'),
            t('Phone'),
            t('Status', { ns: 'reports' }),
          ],
        ],
        body: dataToExport.map((u) => [
          u.id,
          u.name || '-',
          u.surname || '-',
          u.username || '-',
          u.email || '-',
          u.phone || '-',
          u.isActive ? t('Active') : t('Passive'),
        ]),
        headStyles: {
          fillColor: [110, 144, 196],
          textColor: 245,
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: { fontSize: 8, textColor: [22, 29, 32] },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        willDrawCell: (data) => {
          if (data.column.index === 6 && data.section === 'body') {
            const isActive = dataToExport[data.row.index]?.isActive;
            data.cell.styles.textColor = isActive ? [34, 197, 94] : [239, 68, 68];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        margin: { left: 14, right: 14 },
      });

      doc.save(`user-report-${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography
        variant="h4"
        sx={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          color: theme.palette.text.primary,
          mb: 4,
        }}
      >
        {t('Title', { ns: 'reports' })}
      </Typography>

      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
          mb: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box
            display="flex"
            flexDirection={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            gap={2}
            mb={3}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ color: theme.palette.primary.main }}>
                <AssessmentIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('UserSummary', { ns: 'reports' })}
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'stretch', md: 'center' }}
              gap={2}
              width={{ xs: '100%', sm: 'auto' }}
            >
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={pdfScope}
                  onChange={(e) => setPdfScope(e.target.value)}
                  sx={{
                    justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                    '& .MuiFormControlLabel-label': {
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    },
                  }}
                >
                  <FormControlLabel
                    value="all"
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: theme.palette.primary.main,
                          '&.Mui-checked': { color: theme.palette.primary.main },
                        }}
                      />
                    }
                    label={t('DownloadAll', { ns: 'reports' })}
                  />
                  <FormControlLabel
                    value="grid"
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: theme.palette.primary.main,
                          '&.Mui-checked': { color: theme.palette.primary.main },
                        }}
                      />
                    }
                    label={t('DownloadGridOnly', { ns: 'reports' })}
                  />
                </RadioGroup>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleDownloadPDF}
                startIcon={<DownloadIcon />}
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
                  '&.Mui-disabled': {
                    backgroundColor: theme.palette.action.disabledBackground,
                    color: theme.palette.action.disabled,
                  },
                }}
              >
                {t('DownloadPdf', { ns: 'reports' })}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 3, borderColor: theme.palette.divider }} />

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.primary.main, mt: 0.3, flexShrink: 0 }}>
                <GroupIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('TotalUsers', { ns: 'reports' })}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '1.35rem',
                color: theme.palette.primary.main,
              }}
            >
              {users.length}
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.success.main, mt: 0.3, flexShrink: 0 }}>
                <CheckCircleOutlineIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('ActiveUsers', { ns: 'reports' })}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.35rem',
                  color: theme.palette.success.main,
                }}
              >
                {activeCount}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} py={2.25}>
            <Box display="flex" alignItems="flex-start" gap={2}>
              <Box sx={{ color: theme.palette.error.main, mt: 0.3, flexShrink: 0 }}>
                <CancelOutlinedIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.925rem',
                  color: theme.palette.text.primary,
                }}
              >
                {t('PassiveUsers', { ns: 'reports' })}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Typography
                sx={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  fontSize: '1.35rem',
                  color: theme.palette.error.main,
                }}
              >
                {passiveCount}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box sx={{ color: theme.palette.primary.main }}>
              <GroupIcon />
            </Box>
            <Typography
              sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: '1rem',
                color: theme.palette.text.primary,
              }}
            >
              {t('AllUsers', { ns: 'reports' })}
            </Typography>
          </Box>

          <div className="ag-theme-quartz" style={{ height: '500px', width: '100%' }}>
            <AgGridReact
              key={i18n.resolvedLanguage}
              rowData={users}
              columnDefs={columnDefs}
              localeText={getAgGridLocale(i18n.resolvedLanguage)}
              pagination={true}
              paginationPageSize={isMobile ? 12 : 20}
              paginationPageSizeSelector={[12, 20, 40, 100]}
              onGridReady={handleGridReady}
            />
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Reports;
