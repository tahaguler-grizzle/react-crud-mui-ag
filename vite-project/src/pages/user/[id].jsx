import { useRouter } from 'next/router';
import UserDetail from './profile';

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!router.isReady) {
    return null;
  }

  return <UserDetail id={id} />;
}
