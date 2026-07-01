import LoginLayout from "../components/login/LoginLayout";
import LoginForm from "../components/login/LoginForm";
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations';
import nextI18NextConfig from '../../next-i18next.config.js';

function Login() {
  return (
    <LoginLayout>
      <LoginForm />
    </LoginLayout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig)),
    },
  };
}

export default Login;
