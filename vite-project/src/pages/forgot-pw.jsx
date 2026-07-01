import ForgotPwLayout from '../components/login/ForgotPwLayout';
import ForgotPwForm from '../components/login/ForgotPwForm';
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config.js';

function ForgotPw() {
  return (
    <ForgotPwLayout>
      <ForgotPwForm />
    </ForgotPwLayout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig)),
    },
  };
}

export default ForgotPw;
