import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchJson, toQueryString } from '../lib/api';

export const queryKeys = {
  businesses: (params = {}) => ['businesses', toQueryString(params)],
  serviceCategories: ['service-categories'],
};

export const useBusinesses = (params = {}, options = {}) => {
  const queryString = toQueryString(params);

  return useQuery({
    queryKey: queryKeys.businesses(params),
    queryFn: ({ signal }) => fetchJson(`/business?${queryString}`, { signal }),
    placeholderData: keepPreviousData,
    ...options,
  });
};

export const useServiceCategories = (options = {}) =>
  useQuery({
    queryKey: queryKeys.serviceCategories,
    queryFn: ({ signal }) => fetchJson('/service-categories', { signal }),
    staleTime: 15 * 60 * 1000,
    ...options,
  });
