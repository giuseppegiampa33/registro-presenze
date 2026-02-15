import { type Company, type AttendanceStatus } from './types';

export const COMPANIES: Company[] = [
  { id: 1, name: 'Corapi SRL' },
  { id: 2, name: 'Giarvit' },
  { id: 3, name: 'IFM' },
  { id: 4, name: 'Sinapsys' },
];

export function generateTimeSlots(startHour: number, startMin: number, endHour: number, endMin: number): string[] {
  const slots: string[] = [];
  let h = startHour, m = startMin;
  while (h < endHour || (h === endHour && m <= endMin)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    m += 30;
    if (m >= 60) { h++; m = 0; }
  }
  return slots;
}

export const MORNING_SLOTS = generateTimeSlots(8, 0, 13, 0);
export const AFTERNOON_SLOTS = generateTimeSlots(14, 0, 18, 0);

export const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string }> = {
  present: { label: 'Presenza', color: 'text-success', bg: 'bg-success/10' },
  absent: { label: 'Assenza', color: 'text-destructive', bg: 'bg-destructive/10' },
  late: { label: 'Ritardo', color: 'text-warning', bg: 'bg-warning/10' },
};

export function getCompanyName(companyId: number | null): string {
  return COMPANIES.find(c => c.id === companyId)?.name ?? '—';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
