export function formatRelativeDate(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 0) return "aujourd'hui";
  if (diffDays === 1) return "il y a 1 jour";
  return `il y a ${diffDays} jours`;
}
