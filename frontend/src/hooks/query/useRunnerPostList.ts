import { getRunnerPost } from '@/apis/apis';
import { ERROR_TITLE } from '@/constants/message';
import { ToastContext } from '@/contexts/ToastContext';
import { APIError } from '@/types/error';
import { GetRunnerPostResponse, ReviewStatus, RunnerPost } from '@/types/runnerPost';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useContext, useEffect } from 'react';

const PAGE_LIMIT = 10;

export const useRunnerPostList = (reviewStatus?: ReviewStatus, tagName?: string) => {
  const { showErrorToast } = useContext(ToastContext);

  const queryResult = useInfiniteQuery<
    GetRunnerPostResponse,
    APIError,
    RunnerPost[],
    [string, typeof reviewStatus, typeof tagName],
    number
  >({
    queryKey: ['runnerPost', reviewStatus, tagName],
    queryFn: ({ pageParam }) => getRunnerPost(PAGE_LIMIT, reviewStatus, pageParam, tagName).then((res) => res),
    initialPageParam: 0,
    getNextPageParam: (nextPage) => {
      if (!nextPage.pageInfo.isLast) {
        return nextPage.pageInfo.nextCursor;
      }
      return undefined;
    },
    select: ({ pages }) => pages.reduce<RunnerPost[]>((acc, { data }) => acc.concat(data), []),
  });

  useEffect(() => {
    if (queryResult.error) {
      showErrorToast({ title: ERROR_TITLE.NETWORK, description: queryResult.error.message });
    }
  }, [queryResult.error]);

  return {
    ...queryResult,
    data: queryResult.data as NonNullable<typeof queryResult.data>,
  };
};
