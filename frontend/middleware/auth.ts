export default defineNuxtRouteMiddleware(() => {
  const token = useState("auth.token", () => "");
  if (!token.value) {
    return navigateTo("/auth/login");
  }
});
