import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MORNING_SLOTS, AFTERNOON_SLOTS, STATUS_CONFIG, todayStr } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { AttendanceStatus } from '@/lib/types';

export default function InsertData() {
  const { user, upsertRecord, getRecordsForUser } = useAuth();
  const [date, setDate] = useState(todayStr());
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [hasMorning, setHasMorning] = useState(true);
  const [hasAfternoon, setHasAfternoon] = useState(true);
  const [morningStart, setMorningStart] = useState('08:00');
  const [morningEnd, setMorningEnd] = useState('13:00');
  const [afternoonStart, setAfternoonStart] = useState('14:00');
  const [afternoonEnd, setAfternoonEnd] = useState('18:00');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load existing record when date changes
  useEffect(() => {
    if (!user) return;
    const existing = getRecordsForUser(user.id).find(r => r.date === date);
    if (existing) {
      setStatus(existing.status);
      setHasMorning(!!existing.morningStart);
      setHasAfternoon(!!existing.afternoonStart);
      setMorningStart(existing.morningStart ?? '08:00');
      setMorningEnd(existing.morningEnd ?? '13:00');
      setAfternoonStart(existing.afternoonStart ?? '14:00');
      setAfternoonEnd(existing.afternoonEnd ?? '18:00');
      setNotes(existing.notes ?? '');
    } else {
      setStatus('present');
      setHasMorning(true); setHasAfternoon(true);
      setMorningStart('08:00'); setMorningEnd('13:00');
      setAfternoonStart('14:00'); setAfternoonEnd('18:00');
      setNotes('');
    }
    setSuccess(false); setError('');
  }, [date, user, getRecordsForUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(false);
    if (!user) return;

    if (status !== 'absent') {
      if (!hasMorning && !hasAfternoon) { setError('Seleziona almeno una fascia oraria'); return; }
      if (hasMorning && morningEnd <= morningStart) { setError('Ora fine mattina deve essere successiva all\'inizio'); return; }
      if (hasAfternoon && afternoonEnd <= afternoonStart) { setError('Ora fine pomeriggio deve essere successiva all\'inizio'); return; }
    }

    try {
      await upsertRecord({
        userId: user.id,
        date,
        status,
        morningStart: status !== 'absent' && hasMorning ? morningStart : undefined,
        morningEnd: status !== 'absent' && hasMorning ? morningEnd : undefined,
        afternoonStart: status !== 'absent' && hasAfternoon ? afternoonStart : undefined,
        afternoonEnd: status !== 'absent' && hasAfternoon ? afternoonEnd : undefined,
        notes: notes || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setError('Errore durante il salvataggio');
    }
  };

  if (!user) return null;

  const TimeSelect = ({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) => (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Inserisci Dati Giornalieri</h1>
          <p className="text-sm text-muted-foreground">Compila il form per registrare la tua presenza.</p>
        </div>

        <Card className="border-border flex-1">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                  <CheckCircle className="h-4 w-4 shrink-0" /> Dati salvati con successo!
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} max={todayStr()} />
                </div>
                <div className="space-y-2">
                  <Label>Stato</Label>
                  <Select value={status} onValueChange={v => setStatus(v as AttendanceStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {status !== 'absent' && (
                <div className="space-y-4 rounded-lg border border-border bg-secondary/50 p-4">
                  <h3 className="text-sm font-semibold text-foreground">Fasce Orarie</h3>

                  {/* Morning */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox id="morning" checked={hasMorning} onCheckedChange={v => setHasMorning(!!v)} />
                      <Label htmlFor="morning" className="font-medium">Mattina (08:00 – 13:00)</Label>
                    </div>
                    {hasMorning && (
                      <div className="grid grid-cols-2 gap-3 pl-6">
                        <TimeSelect label="Inizio" value={morningStart} onChange={setMorningStart} options={MORNING_SLOTS} />
                        <TimeSelect label="Fine" value={morningEnd} onChange={setMorningEnd} options={MORNING_SLOTS} />
                      </div>
                    )}
                  </div>

                  {/* Afternoon */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox id="afternoon" checked={hasAfternoon} onCheckedChange={v => setHasAfternoon(!!v)} />
                      <Label htmlFor="afternoon" className="font-medium">Pomeriggio (14:00 – 18:00)</Label>
                    </div>
                    {hasAfternoon && (
                      <div className="grid grid-cols-2 gap-3 pl-6">
                        <TimeSelect label="Inizio" value={afternoonStart} onChange={setAfternoonStart} options={AFTERNOON_SLOTS} />
                        <TimeSelect label="Fine" value={afternoonEnd} onChange={setAfternoonEnd} options={AFTERNOON_SLOTS} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Note (opzionale)</Label>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Note aggiuntive..." rows={3} />
              </div>

              <Button type="submit" className="w-full">Salva</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
