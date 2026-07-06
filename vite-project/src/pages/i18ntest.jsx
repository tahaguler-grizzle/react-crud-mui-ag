import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function NetworkErrorTester() {
  const { t } = useTranslation(['i18ntest', 'common']);
  const [inputCode, setInputCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    if (snackbar.isOpen) {
      const timer = setTimeout(() => {
        setSnackbar((prev) => ({ ...prev, isOpen: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar.isOpen]);

  // Network isteğini atan ana fonksiyon
  const handleTestRequest = async () => {
    setIsLoading(true);
    const codeToSimulate = inputCode.trim();

    // Dinamik URL oluşturma
    const url = codeToSimulate ? `/api/test-error?errorCode=${codeToSimulate}` : '/api/test-error';

    try {
      // 1. Gerçek Network İsteği Atılıyor
      const response = await fetch(url);
      const resData = await response.json();

      // 2. Eğer backend 400/500 döndüyse, catch bloğuna pasla
      if (!response.ok) {
        throw resData; // Backend'den gelen { success: false, errorCode: "..." } objesini fırlatır
      }

      // Başarılı durum
      setSnackbar({
        isOpen: true,
        message: t('SuccessMesage'),
        type: 'success',
      });
    } catch (error) {
      // error artık API'den dönen response body'sidir
      const code = error?.errorCode;
      let translatedMessage = '';

      if (code) {
        /* 
        Error code - çeviri eşlemeli bu kod ile yapılırsa:
        - düz string display
        - string ile beraber variable gösterme
        - eşleşme olmaması durumunda default string
        yapılabilir
        */
        translatedMessage = t(`errors.${code}`, {
          errorCode: code,
          defaultValue: t('errors.DEFAULT', { errorCode: code }),
        });
      } else {
        translatedMessage = t('errors.DEFAULT');
      }

      setSnackbar({
        isOpen: true,
        message: translatedMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '450px' }}>
      <h2>{t('Title')}</h2>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          placeholder={t('EnterCode')}
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
          {isLoading ? t('SendingRequest') : t('TestBtn')}
        </button>
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
