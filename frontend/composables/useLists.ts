import { ref } from "vue";
import { useApi } from "./useApi";

export const useLists = () => {
  const api = useApi();
  const lists = ref<any[]>([]);
  const loading = ref(false);
  const error = ref("");

  const fetchLists = async () => {
    try {
      loading.value = true;
      error.value = "";
      const response = await api.get("/lists");
      lists.value = response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors du chargement";
    } finally {
      loading.value = false;
    }
  };

  const fetchList = async (id: number) => {
    try {
      const response = await api.get(`/lists/${id}`);
      return response.data;
    } catch (e: any) {
      throw e;
    }
  };

  const createList = async (title: string, description: string, isPublic: boolean) => {
    try {
      const response = await api.post("/lists", { title, description, isPublic });
      lists.value.unshift(response.data);
      return response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de la création";
      throw e;
    }
  };

  const updateList = async (id: number, data: { title?: string; description?: string; isPublic?: boolean }) => {
    try {
      const response = await api.put(`/lists/${id}`, data);
      const index = lists.value.findIndex((l) => l.id === id);
      if (index !== -1) lists.value[index] = { ...lists.value[index], ...response.data };
      return response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de la modification";
      throw e;
    }
  };

  const deleteList = async (id: number) => {
    try {
      await api.del(`/lists/${id}`);
      lists.value = lists.value.filter((l) => l.id !== id);
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de la suppression";
      throw e;
    }
  };

  const addAnimeToList = async (listId: number, animeId: number) => {
    try {
      const response = await api.post(`/lists/${listId}/animes`, { animeId });
      return response.data;
    } catch (e: any) {
      throw e;
    }
  };

  const removeAnimeFromList = async (listId: number, animeId: number) => {
    try {
      await api.del(`/lists/${listId}/animes/${animeId}`);
    } catch (e: any) {
      throw e;
    }
  };

  const reorderListAnimes = async (listId: number, animeIds: number[]) => {
    const response = await api.put(`/lists/${listId}/reorder`, { animeIds });
    return response.data;
  };

  return {
    lists,
    loading,
    error,
    fetchLists,
    fetchList,
    createList,
    updateList,
    deleteList,
    addAnimeToList,
    removeAnimeFromList,
    reorderListAnimes,
  };
};
