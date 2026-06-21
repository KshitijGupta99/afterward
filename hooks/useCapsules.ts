import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserCapsules, fetchCapsule, createCapsule, markCapsuleOpened } from "@/services/capsules";
import { sortCapsulesByDelivery } from "@/utils/dates";

export function useCapsules(userId: string | undefined, userEmail?: string | null) {
  return useQuery({
    queryKey: ["capsules", userId, userEmail],
    queryFn: () => fetchUserCapsules(userId!, userEmail),
    enabled: !!userId,
    select: sortCapsulesByDelivery,
    refetchInterval: 60_000,
  });
}

export function useCapsule(id: string | undefined) {
  return useQuery({
    queryKey: ["capsule", id],
    queryFn: () => fetchCapsule(id!),
    enabled: !!id,
  });
}

export function useMarkCapsuleOpened() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markCapsuleOpened,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["capsules"] });
      queryClient.invalidateQueries({ queryKey: ["capsule", id] });
    },
  });
}

export function useCreateCapsule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCapsule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capsules"] });
    },
  });
}
