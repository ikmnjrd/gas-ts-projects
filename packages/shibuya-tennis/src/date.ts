export function getUseMonth(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const nextWeekend = new Date();

  if (dayOfWeek === 6) {
    nextWeekend.setDate(today.getDate() + 1);
  } else if (dayOfWeek === 0) {
    nextWeekend.setDate(today.getDate());
  } else {
    nextWeekend.setDate(today.getDate() + (6 - dayOfWeek));
  }

  const month = nextWeekend.getMonth() + 1;
  const year = nextWeekend.getFullYear();

  return `${year}/${month < 10 ? "0" : ""}${month}`;
}
