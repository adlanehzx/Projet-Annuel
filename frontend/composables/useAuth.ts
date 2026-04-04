export const useAuth = () => {
  const user = useState("auth.user", () => null as any);
  const token = useState("auth.token", () => "");
  const isLoading = useState("auth.loading", () => false);
  const error = useState("auth.error", () => "");

  // Charger depuis localStorage au démarrage
  if (process.client) {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
    }
  }

  const { get, post } = useApi();

  const register = async (
    email: string,
    username: string,
    password: string,
  ) => {
    isLoading.value = true;
    error.value = "";
    try {
      const response = await post("/auth/register", {
        email,
        username,
        password,
      });
      // Auto login après register
      return await login(email, password);
    } catch (err: any) {
      error.value = err.response?.data?.error || "Erreur lors de l'inscription";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    isLoading.value = true;
    error.value = "";
    try {
      const response = await post("/auth/login", { email, password });
      token.value = response.data.token;
      user.value = response.data.user;

      if (process.client) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Erreur de connexion";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    token.value = "";
    user.value = null;
    if (process.client) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  return {
    user: readonly(user),
    token: readonly(token),
    isLoading: readonly(isLoading),
    error: readonly(error),
    isAuthenticated,
    register,
    login,
    logout,
  };
};
