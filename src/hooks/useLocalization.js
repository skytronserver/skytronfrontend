import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { SET_LANGUAGE } from '../store/actions';

export const useLocalization = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  
  // Get current language from Redux store (if available) or fallback to i18n
  const currentLanguage = useSelector((state) => state.localization?.language) || i18n.language;

  const changeLanguage = (language) => {
    i18n.changeLanguage(language);
    dispatch({ type: SET_LANGUAGE, payload: language });
    
    // Save to localStorage for persistence
    localStorage.setItem('i18nextLng', language);
  };

  const getAvailableLanguages = () => {
    return [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'hi', name: 'हिंदी', flag: '🇮🇳' }
    ];
  };

  const getCurrentLanguage = () => {
    return getAvailableLanguages().find(lang => lang.code === currentLanguage) || 
           getAvailableLanguages()[0];
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    getAvailableLanguages,
    getCurrentLanguage,
    isRTL: currentLanguage === 'ar' // For future RTL support
  };
}; 