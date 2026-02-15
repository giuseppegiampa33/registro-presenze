import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { STATUS_CONFIG, formatDate } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AttendanceRecord } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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

  // Calculate monthly statistics
  const stats = useMemo(() => {
    const currentMonthRecords = Object.values(records).filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    const counts = {
      present: 0,
      late: 0,
      absent: 0
    };

    currentMonthRecords.forEach(r => {
      if (counts[r.status as keyof typeof counts] !== undefined) {
        counts[r.status as keyof typeof counts]++;
      }
    });

    const data = [
      { name: 'Presente', value: counts.present, color: '#10b981' }, // success
      { name: 'Ritardo', value: counts.late, color: '#f59e0b' },   // warning
      { name: 'Assente', value: counts.absent, color: '#ef4444' }, // destructive
    ].filter(item => item.value > 0);

    return { counts, data, total: currentMonthRecords.length };
  }, [records, month, year]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-foreground">Calendario Presenze</h1>
          <p className="text-muted-foreground">Gestisci e visualizza le tue presenze mensili.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column: Calendar */}
          <div className="md:col-span-2">
            <Card className="h-full border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <Button variant="outline" size="icon" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
                <CardTitle className="text-lg font-semibold capitalize text-foreground flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  {monthName}
                </CardTitle>
                <Button variant="outline" size="icon" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
                    <div key={d} className="py-2 text-sm font-medium text-muted-foreground">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {days.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} className="h-14" />;
                    const dateStr = getDateStr(day);
                    const rec = records[dateStr];
                    const isToday = dateStr === new Date().toISOString().slice(0, 10);
                    const isSelected = selected?.date === dateStr;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => {
                          if (rec) setSelected(rec);
                          else setSelected(null); // Deselect if no record
                        }}
                        className={cn(
                          "relative flex h-14 flex-col items-center justify-center rounded-xl border border-transparent text-sm transition-all hover:bg-secondary/50 hover:border-border",
                          isToday && "bg-secondary/30 ring-2 ring-primary ring-offset-1 ring-offset-background font-bold text-primary",
                          isSelected && "bg-secondary border-primary/50 shadow-sm",
                          rec && "cursor-pointer"
                        )}
                      >
                        <span className="z-10">{day}</span>
                        {rec && (
                          <span className={cn(
                            "absolute bottom-2 h-1.5 w-1.5 rounded-full transition-transform",
                            statusDot[rec.status],
                            isSelected && "scale-125"
                          )} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Stats & Details */}
          <div className="space-y-6">
            {/* Statistics Card */}
            <Card className="border-border overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Statistiche Mese</CardTitle>
                <CardDescription>Riepilogo presenze di {monthName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  {stats.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.data}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {stats.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm flex-col gap-2">
                      <AlertCircle className="h-8 w-8 opacity-20" />
                      Nessun dato registrato
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/20">
                    <span className="font-bold text-success text-lg">{stats.counts.present}</span>
                    <span className="text-muted-foreground">Presente</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/20">
                    <span className="font-bold text-warning text-lg">{stats.counts.late}</span>
                    <span className="text-muted-foreground">Ritardo</span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-lg bg-secondary/20">
                    <span className="font-bold text-destructive text-lg">{stats.counts.absent}</span>
                    <span className="text-muted-foreground">Assente</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className={cn("border-border transition-all duration-300", !selected ? "opacity-50 grayscale" : "opacity-100")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  {selected ? formatDate(selected.date) : "Seleziona un giorno"}
                  {selected && <Badge className={cn(STATUS_CONFIG[selected.status].bg, STATUS_CONFIG[selected.status].color, "border-0")}>
                    {STATUS_CONFIG[selected.status].label}
                  </Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selected ? (
                  <>
                    <div className="space-y-3">
                      {selected.morningStart && (
                        <div className="flex items-center gap-3 text-sm rounded-md border border-border p-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="font-medium">Mattina</span>
                            <div className="text-muted-foreground text-xs">
                              {selected.morningStart} – {selected.morningEnd}
                            </div>
                          </div>
                        </div>
                      )}
                      {selected.afternoonStart && (
                        <div className="flex items-center gap-3 text-sm rounded-md border border-border p-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <span className="font-medium">Pomeriggio</span>
                            <div className="text-muted-foreground text-xs">
                              {selected.afternoonStart} – {selected.afternoonEnd}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {selected.notes && (
                      <div className="text-sm bg-secondary/30 p-3 rounded-md italic text-muted-foreground">
                        "{selected.notes}"
                      </div>
                    )}
                    <Button className="w-full" variant="outline" onClick={() => setSelected(null)}>Chiudi Dettagli</Button>
                  </>
                ) : (
                  <div className="py-8 text-center text-muted-foreground text-sm">
                    Clicca su un giorno del calendario per visualizzare i dettagli completi.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
