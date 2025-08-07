import { axiosInstance } from './instance';
import { ApiRoutes } from './constants';
import { ShoeCardType } from '@/components/shared/types';

export const search = async (query: string): Promise<ShoeCardType[]> => {
  const { data } = await axiosInstance.get<ShoeCardType[]>(
    ApiRoutes.SEARCH_SHOES,
    {
      params: { query },
    }
  );
  return data;
};
