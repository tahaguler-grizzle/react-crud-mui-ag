import axios from 'axios';
import i18n from '../../i18n';
import EventEmitter from '../utils/EventEmitter';

const axiosInstance = axios.create();

// Interceptor integration as requested
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Backendden gelen spesifik hata kodunu al, yoksa HTTP status kodunu fallback kullan
    const errorCode = error.response?.data?.errorCode || error.response?.status;

    // API'den gelen orijinal İngilizce hata mesajı (eğer lokalize karşılığı yoksa kullanılacak)
    const fallbackMessage = error.response?.data?.message || 'An error occurred';

    if (errorCode) {
      // Düz i18n instance'ı üzerinden doğrudan i18n.t() fonksiyonu tetiklenir
      // Default value olarak `i18ntest:errors.DEFAULT` değerini alıp kodu içine gömüyoruz
      const defaultMsg = i18n.t('i18ntest:errors.DEFAULT', { errorCode });

      EventEmitter.emit('showSnackbar', {
        message: i18n.t(`i18ntest:errors.${errorCode}`, {
          defaultValue: fallbackMessage !== 'An error occurred' ? fallbackMessage : defaultMsg,
          errorCode: errorCode,
        }),
        severity: 'error',
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
