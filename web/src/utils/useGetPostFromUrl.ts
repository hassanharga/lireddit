import { useRouter } from 'next/router';
import { usePostQuery } from '../generated/graphql';

export const useGetPostFromUrl = () => {
  const router = useRouter();
  const intId = typeof router.query.id === 'string' ? +router.query.id : -1;
  return usePostQuery({
    pause: intId < 0,
    variables: {
      id: intId,
    },
  });
};
