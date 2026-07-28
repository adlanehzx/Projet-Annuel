// Les avatars uploadés localement sont stockés en base sous forme de chemin
// relatif ("/uploads/avatars/xxx.webp"), servi par le backend sous /api.
// Les avatars OAuth (Google/GitHub) sont déjà des URLs absolues.
export const useAvatarUrl = () => {
  const config = useRuntimeConfig();

  const resolve = (avatar?: string | null): string | null => {
    if (!avatar) return null;
    if (avatar.startsWith("/uploads/")) {
      return `${config.public.apiBase}${avatar}`;
    }
    return avatar;
  };

  return { resolve };
};
