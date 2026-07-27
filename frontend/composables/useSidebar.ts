export const useSidebar = () => {
  const collapsed = useState("sidebar.collapsed", () => false);

  const init = () => {
    if (process.client) {
      const saved = localStorage.getItem("at-sidebar-collapsed");
      if (saved !== null) collapsed.value = saved === "true";
    }
  };

  const toggle = () => {
    collapsed.value = !collapsed.value;
    if (process.client) {
      localStorage.setItem("at-sidebar-collapsed", String(collapsed.value));
    }
  };

  return { collapsed, init, toggle };
};
