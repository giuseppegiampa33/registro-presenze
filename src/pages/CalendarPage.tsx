import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { STATUS_CONFIG, formatDate } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AttendanceRecord } from '@/lib/types';

export default function CalendarPage() {
  const { user, getRecordsForUser } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selected, setSelected] = useState<AttendanceRecord | null>(null);

  const records = useMemo(() => {
    if (!user) return {};
    const map: Record<string, AttendanceRecord> = {};
    getRecordsForUser(user.id).forEach(r => { map[r.date] = r; });
    return map;
  }, [user, getRecordsForUser]);

  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start
    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [year, month]);

  const monthName = new Date(year, month).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const statusDot: Record<string, string> = {
    present: 'bg-success',
    absent: 'bg-destructive',
    late: 'bg-warning',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Calendario Presenze</h1>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Button variant="ghost" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
            <CardTitle className="text-lg font-semibold capitalize text-foreground">{monthName}</CardTitle>
            <Button variant="ghost" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
                <div key={d} className="py-2 text-xs font-semibold text-muted-foreground">{d}</div>
              ))}
              {days.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} />;
                const dateStr = getDateStr(day);
                const rec = records[dateStr];
                const isToday = dateStr === new Date().toISOString().slice(0, 10);
                return (
                  <button
                    key={dateStr}
                    onClick={() => rec && setSelected(rec)}
                    className={cn(
                      "relative flex h-12 flex-col items-center justify-center rounded-lg text-sm transition-colors hover:bg-secondary",
                      isToday && "ring-2 ring-primary",
                      rec && "cursor-pointer"
                    )}
                  >
                    <span className="text-foreground">{day}</span>
                    {rec && <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full", statusDot[rec.status])} />}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex gap-4 border-t border-border pt-3">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn("h-2 w-2 rounded-full", statusDot[key])} />
                  {cfg.label}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail panel */}
        {selected && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-foreground">{formatDate(selected.date)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge className={`${STATUS_CONFIG[selected.status].bg} ${STATUS_CONFIG[selected.status].color} border-0`}>
                {STATUS_CONFIG[selected.status].label}
              </Badge>
              {selected.morningStart && (
                <p className="text-sm text-muted-foreground">Mattina: {selected.morningStart} – {selected.morningEnd}</p>
              )}
              {selected.afternoonStart && (
                <p className="text-sm text-muted-foreground">Pomeriggio: {selected.afternoonStart} – {selected.afternoonEnd}</p>
              )}
              {selected.notes && (
                <p className="text-sm text-muted-foreground">Note: {selected.notes}</p>
              )}
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>Chiudi</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
