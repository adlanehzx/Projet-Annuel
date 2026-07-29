export const useAuth = () => {
  const user = useState("auth.user", () => null as any);
  const token = useState("auth.token", () => "");
  const isLoading = useState("auth.loading", () => false);
  const error = useState("auth.error", () => "");

  if (process.client) {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      try {
        user.value = JSON.parse(savedUser);
        token.value = savedToken;
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }

  const { get, post, put, del, postForm } = useApi();

  const oauthTwoFactorPending = useState<string | null>(
    "auth.oauthTwoFactorPending",
    () => null,
  );

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
      if (!response.data.requiresTwoFactor) {
        applySession(response.data);
      }
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
      if (!response.data.requiresTwoFactor) {
        applySession(response.data);
      }
      return response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.error || "Erreur de connexion avec GitHub";
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const completeOAuthTwoFactor = async (
    pendingToken: string,
    totpToken?: string,
    backupCode?: string,
  ) => {
    isLoading.value = true;
    error.value = "";
    try {
      const response = await post("/auth/oauth/2fa", {
        pendingToken,
        totpToken,
        backupCode,
      });
      applySession(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || "Code invalide";
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
    const profile = response.data as {
      id: number;
      username: string;
      email: string;
      bio?: string | null;
      avatar?: string | null;
      isPublic: boolean;
      createdAt?: string;
      [key: string]: any;
    };

    if (user.value && profile) {
      user.value = {
        ...user.value,
        createdAt: profile.createdAt ?? user.value.createdAt,
        bio: profile.bio ?? user.value.bio,
        isPublic: profile.isPublic ?? user.value.isPublic,
        avatar: profile.avatar ?? user.value.avatar,
      };
      if (process.client) {
        localStorage.setItem("user", JSON.stringify(user.value));
      }
    }

    return profile;
  };

  const updateMyProfile = async (data: {
    isPublic?: boolean;
    bio?: string | null;
    username?: string;
    avatar?: string | null;
  }) => {
    const response = await put("/auth/profile", data);
    const updated = response.data;

    if (user.value && updated) {
      user.value = {
        ...user.value,
        ...updated,
      };
      if (process.client) {
        localStorage.setItem("user", JSON.stringify(user.value));
      }
    }

    return updated;
  };

  const deleteMyAccount = async (payload: {
    confirmation: string;
    password?: string;
  }) => {
    const response = await del("/auth/account", payload);
    logout();
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
    useWatchlist().clearWatchlist();
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
    completeOAuthTwoFactor,
    oauthTwoFactorPending,
    logout,
    get2FAStatus,
    setup2FA,
    enable2FA,
    disable2FA,
    regenerateBackupCodes,
    getMyProfile,
    updateMyProfile,
    deleteMyAccount,
    uploadAvatar,
    removeAvatar,
  };
};
