import DataLoader from 'dataloader';
import { Updoot } from '../entities/Updoot.entiny';

// we r gonna pass user id and will return user object
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any);
      const updootIdsToUpdoots: Record<string, Updoot | null> = {};
      updoots.forEach((updoot) => {
        updootIdsToUpdoots[`${updoot.userId}|${updoot.postId}`] = updoot;
      });
      return keys.map(
        (key) => updootIdsToUpdoots[`${key.userId}|${key.postId}`],
      );
    },
  );
