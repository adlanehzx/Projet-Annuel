// Les avatars locaux sont stockés en chemin relatif, ceux d'OAuth en URL absolue
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
