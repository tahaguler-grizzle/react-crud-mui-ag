import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../api/axiosInstance';
import EventEmitter from '../utils/EventEmitter';

export default function NetworkErrorTester() {
  const { t } = useTranslation('i18ntest');
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
    type: 'success',
  });

  const guideList = t('guide', { returnObjects: true, ns: 'i18ntest' }) || {}; // bunu bu halde bıraktım, ns belirtmiş dokunmak istemedim, test zaten

  useEffect(() => {
    if (snackbar.isOpen) {
      const timer = setTimeout(() => {
        setSnackbar((prev) => ({ ...prev, isOpen: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.isOpen]);

  useEffect(() => {
    const handleSnackbarEvent = (data) => {
      setSnackbar({
        isOpen: true,
        message: data.message,
        type: data.severity,
      });
    };

    EventEmitter.on('showSnackbar', handleSnackbarEvent);
    return () => {
      EventEmitter.off('showSnackbar', handleSnackbarEvent);
    };
  }, []);

  const handleTestRequest = async () => {
    setIsLoading(true);
    const codeToSimulate = inputCode.trim();

    const url = codeToSimulate ? `/api/test-error?errorCode=${codeToSimulate}` : '/api/test-error';

    try {
      await axiosInstance.get(url);

      setSnackbar({
        isOpen: true,
        message: t('i18ntest:SuccessMessage'),
        type: 'success',
      });
    } catch (error) {
      console.log('Request failed handled by interceptor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '40px',
        padding: '2rem',
        fontFamily: 'sans-serif',
        maxWidth: '1000px',
        margin: '0 auto',
        alignItems: 'flex-start',
      }}
    >
      {/* SOL TARAF: TEST FORMU */}
      <div style={{ flex: '1', maxWidth: '450px' }}>
        <h2>{t('i18ntest:Title')}</h2>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder={t('i18ntest:EnterCode')}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            disabled={isLoading}
            style={{
              padding: '8px 12px',
              flex: 1,
              fontSize: '1rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          />
          <button
            onClick={handleTestRequest}
            disabled={isLoading}
            style={{
              padding: '8px 20px',
              fontSize: '1rem',
              borderRadius: '4px',
              border: 'none',
              color: 'white',
              backgroundColor: isLoading ? '#aaa' : '#0070f3',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? t('i18ntest:SendingRequest') : t('i18ntest:TestBtn')}
          </button>
        </div>
      </div>

      {/* SAĞ TARAF: REHBER / GUIDE PANELİ */}
      <div
        style={{
          flex: '1',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#fafafa',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Object.entries(guideList).map(([code, description]) => (
            <div
              key={code}
              onClick={() => !isLoading && setInputCode(code)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: 'white',
                border: '1px solid #eaeaea',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) =>
                !isLoading && (e.currentTarget.style.backgroundColor = '#f0f7ff')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
            >
              <code
                style={{
                  backgroundColor: '#eef0f2',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  color: '#0070f3',
                }}
              >
                {code}
              </code>
              <span
                style={{
                  fontSize: '0.9rem',
                  color: '#555',
                  textAlign: 'right',
                  marginLeft: '15px',
                }}
              >
                {typeof description === 'string' ? description : code}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Snackbar UI */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: snackbar.isOpen ? 'translate(-50%, 0)' : 'translate(-50%, 100px)',
          opacity: snackbar.isOpen ? 1 : 0,
          transition: 'all 0.3s ease-in-out',
          backgroundColor: snackbar.type === 'success' ? '#4caf50' : '#f44336',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          fontWeight: '500',
          textAlign: 'center',
          minWidth: '250px',
        }}
      >
        {snackbar.message}
      </div>
    </div>
  );
}
