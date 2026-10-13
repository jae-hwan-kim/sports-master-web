import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/api/client'

export type FavoriteExpertItem = {
  id: number
  name: string
  grade: string | null
  reviewCount: number
  avgRating: number
  avatarUrl: string | null
}

async function fetchFavoriteExperts(): Promise<FavoriteExpertItem[]> {
  const { data } = await apiClient.get<{ data: FavoriteExpertItem[] }>('/favorite-experts/me')
  return data.data
}

export function useFavoriteExperts() {
  return useQuery({
    queryKey: ['favorite-experts', 'me'],
    queryFn: fetchFavoriteExperts,
  })
}
