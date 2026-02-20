import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFavourites,
  getFavouriteById,
  createFavourite,
  updateFavourite,
  deleteFavourite,
} from "../api/favourites";
import type { Club } from "../types";

const QUERY_KEY = "favourites";

export const useFavouriteSets = () => {
  const queryClient = useQueryClient();

  const { data: sets = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getFavourites,
    refetchOnMount: "always",
  });

  const createMutation = useMutation({
    mutationFn: ({ name, clubs }: { name: string; clubs: Club[] }) =>
      createFavourite(name, clubs.map((c) => c._id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, update }: { id: string; update: { setName?: string; clubs?: string[] } }) =>
      updateFavourite(id, update),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFavourite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const createSet = (name: string, clubs: Club[]) => {
    createMutation.mutate({ name, clubs });
  };

  const deleteSet = (setId: string) => {
    deleteMutation.mutate(setId);
  };

  const renameSet = (setId: string, newName: string) => {
    updateMutation.mutate({ id: setId, update: { setName: newName } });
  };

  const updateSetClubs = (setId: string, clubs: Club[]) => {
    updateMutation.mutate({
      id: setId,
      update: { clubs: clubs.map((c) => c._id) },
    });
  };

  const getSet = (setId: string) => sets.find((s) => s._id === setId);

  return {
    sets,
    isLoading,
    createSet,
    deleteSet,
    renameSet,
    updateSetClubs,
    getSet,
  };
};

export const useFavouriteSetDetail = (setId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, setId],
    queryFn: () => getFavouriteById(setId),
    enabled: !!setId,
  });
};
