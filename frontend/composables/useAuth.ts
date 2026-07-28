export const useAuth = () => {
  const user = useState("auth.user", () => null as any);
  const token = useState("auth.token", () => "");
  const isLoading = useState("auth.loading", () => false);
  const error = useState("auth.error", () => "");

  if (process.client) {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
    }
  }

  const { get, post, put, del, postForm } = useApi();

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
    backupCode?: string,
  ) => {
    isLoading.value = true;
    error.value = "";
    try {
      const response = await post("/auth/login", {
        email,
        password,
        totpToken,
        backupCode,
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
    return response.data as {
      totpEnabled: boolean;
      backupCodesRemaining: number;
    };
  };

  const setup2FA = async () => {
    const response = await post("/auth/2fa/setup", {});
    return response.data as { secret: string; qrCode: string };
  };

  const enable2FA = async (secret: string, totpToken: string) => {
    const response = await post("/auth/2fa/enable", { secret, totpToken });
    return response.data as { message: string; backupCodes: string[] };
  };

  const disable2FA = async (password: string) => {
    const response = await post("/auth/2fa/disable", { password });
    return response.data;
  };

  const regenerateBackupCodes = async (password: string) => {
    const response = await post("/auth/2fa/backup-codes/regenerate", {
      password,
    });
    return response.data as { backupCodes: string[] };
  };

  const getMyProfile = async () => {
    const response = await get("/auth/profile");
    return response.data as { isPublic: boolean; [key: string]: any };
  };

  const updateMyProfile = async (data: { isPublic?: boolean }) => {
    const response = await put("/auth/profile", data);
    return response.data;
  };

  const applyAvatar = (avatar: string | null) => {
    user.value = { ...user.value, avatar };
    if (process.client) localStorage.setItem("user", JSON.stringify(user.value));
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await postForm("/profile/avatar", formData);
    applyAvatar(response.data.avatar);
    return response.data;
  };

  const removeAvatar = async () => {
    const response = await del("/profile/avatar");
    applyAvatar(null);
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
    regenerateBackupCodes,
    getMyProfile,
    updateMyProfile,
    uploadAvatar,
    removeAvatar,
  };
};
