import { ref } from "vue";
import { useApi } from "./useApi";

const collections = ref([]);
const loading = ref(false);
const error = ref("");

export const useCollections = () => {
  const api = useApi();

  const fetchCollections = async () => {
    try {
      loading.value = true;
      error.value = "";
      const response = await api.get("/collections");
      collections.value = response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors du chargement";
    } finally {
      loading.value = false;
    }
  };

  const createCollection = async (
    name: string,
    description?: string,
    isPublic?: boolean,
  ) => {
    try {
      loading.value = true;
      const response = await api.post("/collections", {
        name,
        description,
        isPublic: isPublic || false,
      });
      collections.value.unshift(response.data);
      return response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de la création";
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateCollection = async (
    id: number,
    name: string,
    description?: string,
    isPublic?: boolean,
  ) => {
    try {
      const response = await api.put(`/collections/${id}`, {
        name,
        description,
        isPublic,
      });
      const index = collections.value.findIndex((c: any) => c.id === id);
      if (index !== -1) {
        collections.value[index] = response.data;
      }
      return response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de la mise à jour";
      throw e;
    }
  };

  const deleteCollection = async (id: number) => {
    try {
      await api.del(`/collections/${id}`);
      collections.value = collections.value.filter((c: any) => c.id !== id);
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de la suppression";
      throw e;
    }
  };

  const addItemToCollection = async (
    collectionId: number,
    watchlistId: number,
  ) => {
    try {
      const response = await api.post(`/collections/${collectionId}/items`, {
        watchlistId,
        order: 0,
      });
      return response.data;
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de l'ajout";
      throw e;
    }
  };

  const removeItemFromCollection = async (
    collectionId: number,
    itemId: number,
  ) => {
    try {
      await api.del(`/collections/${collectionId}/items/${itemId}`);
    } catch (e: any) {
      error.value = e.response?.data?.error || "Erreur lors de la suppression";
      throw e;
    }
  };

  return {
    collections,
    loading,
    error,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addItemToCollection,
    removeItemFromCollection,
  };
};
