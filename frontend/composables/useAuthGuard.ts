export const useAuthGuard = () => {
  const promptOpen = useState("authGuard.open", () => false);
  const { isAuthenticated } = useAuth();

  const requireAuth = (action?: () => void) => {
    if (isAuthenticated.value) {
      action?.();
      return true;
    }
    promptOpen.value = true;
    return false;
  };

  const closePrompt = () => {
    promptOpen.value = false;
  };

  return { promptOpen, requireAuth, closePrompt };
};
