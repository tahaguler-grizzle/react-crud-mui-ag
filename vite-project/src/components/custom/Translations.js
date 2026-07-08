import { useTranslation } from 'react-i18next';

const Translations = ({ text, ns = 'common' }) => {
  const { t } = useTranslation(ns);
  return <>{`${t(text)}`}</>;
};

export default Translations;
