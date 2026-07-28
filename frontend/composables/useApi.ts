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
        }
        navigateTo("/auth/login");
      }
      return Promise.reject(error);
    },
  );

  const get = (url: string) => api.get(url);
  const post = (url: string, data: any) => api.post(url, data);
  const put = (url: string, data: any) => api.put(url, data);
  const del = (url: string) => api.delete(url);
  // Le navigateur fixe lui-même le Content-Type multipart avec sa boundary
  // dès que le body est une instance FormData (comportement XHR/fetch natif).
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
