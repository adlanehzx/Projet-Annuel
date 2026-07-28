export const useGoogleAuth = () => {
  const config = useRuntimeConfig();

  const ensureLoaded = (
    onCredential: (response: { credential: string }) => void,
  ) => {
    if (!process.client || !config.public.googleClientId) return;

    const init = () => {
      (window as any).google?.accounts?.id?.initialize({
        client_id: config.public.googleClientId,
        callback: onCredential,
      });
    };

    if ((window as any).google?.accounts?.id) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
  };

  const prompt = () => {
    (window as any).google?.accounts?.id?.prompt();
  };

  return { ensureLoaded, prompt };
};
