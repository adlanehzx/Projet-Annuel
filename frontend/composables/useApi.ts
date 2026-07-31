import axios from "axios";

export const useApi = () => {
  const config = useRuntimeConfig();

  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use((config) => {
    const token = useState("auth.token", () => "").value;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        useState("auth.token", () => "").value = "";
        useState("auth.user", () => null).value = null;
        if (process.client) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          useWatchlist().clearWatchlist();
        }
        navigateTo("/auth/login");
      }
      return Promise.reject(error);
    },
  );

  const get = (url: string) => api.get(url);
  const post = (url: string, data: any) => api.post(url, data);
  const put = (url: string, data: any) => api.put(url, data);
  const del = (url: string, data?: any) =>
    data !== undefined ? api.delete(url, { data }) : api.delete(url);
  // Le navigateur fixe lui-même le Content-Type multipart pour un body FormData
  const postForm = (url: string, formData: FormData) =>
    api.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });

  return {
    get,
    post,
    put,
    del,
    postForm,
  };
};
