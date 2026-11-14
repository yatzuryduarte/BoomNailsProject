export const formatCurrency = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value ?? 0);

export const formatDate = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const formatDateOnly = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const formatWeekday = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
  }).format(new Date(value));
};

export const formatDateTimeLocal = (value = new Date()) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 16);
};