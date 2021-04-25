import { useRouter } from 'next/router';
import { useEffect } from 'react';
import routes from '../constants/routes';
import { useMeQuery } from '../generated/graphql';

export const useIsAuth = () => {
  const [{ data, fetching }] = useMeQuery();
  const router = useRouter();

  useEffect(() => {
    if (!fetching && !data?.me) {
      router.replace(`${routes.LOGIN}?next=${router.pathname}`);
    }
  }, [fetching, data, router]);
};
