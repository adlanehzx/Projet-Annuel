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

  const applySession = (data: { token: string; user: any }) => {
    token.value = data.token;
    user.value = data.user;

    if (process.client) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  };

  const login = async (
    email: string,
    password: string,
    totpToken?: string,
  ) => {
    isLoading.value = true;
    error.value = "";
    try {
      const response = await post("/auth/login", {
        email,
        password,
        totpToken,
      });
      applySession(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Erreur de connexion";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // idToken émis côté client par Google Identity Services
  const loginWithGoogle = async (idToken: string) => {
    isLoading.value = true;
    error.value = "";
    try {
      const response = await post("/auth/oauth/google", { idToken });
      applySession(response.data);
      return response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.error || "Erreur de connexion avec Google";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // code d'autorisation reçu de GitHub après redirection
  const loginWithGithub = async (code: string) => {
    isLoading.value = true;
    error.value = "";
    try {
      const response = await post("/auth/oauth/github", { code });
      applySession(response.data);
      return response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.error || "Erreur de connexion avec GitHub";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const get2FAStatus = async () => {
    const response = await get("/auth/2fa/status");
    return response.data.totpEnabled as boolean;
  };

  const setup2FA = async () => {
    const response = await post("/auth/2fa/setup", {});
    return response.data as { secret: string; qrCode: string };
  };

  const enable2FA = async (secret: string, totpToken: string) => {
    const response = await post("/auth/2fa/enable", { secret, totpToken });
    return response.data;
  };

  const disable2FA = async (password: string) => {
    const response = await post("/auth/2fa/disable", { password });
    return response.data;
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
    loginWithGoogle,
    loginWithGithub,
    logout,
    get2FAStatus,
    setup2FA,
    enable2FA,
    disable2FA,
  };
};
