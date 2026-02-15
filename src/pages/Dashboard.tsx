import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyName, todayStr, STATUS_CONFIG } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CheckCircle, XCircle, Clock, PenSquare } from 'lucide-react';

export default function Dashboard() {
  const { user, getRecordsForUser, getTodayRecord } = useAuth();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    if (!user) return { total: 0, present: 0, absent: 0, late: 0 };
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const recs = getRecordsForUser(user.id).filter(r => r.date.startsWith(monthStr));
    return {
      total: recs.length,
      present: recs.filter(r => r.status === 'present').length,
      absent: recs.filter(r => r.status === 'absent').length,
      late: recs.filter(r => r.status === 'late').length,
    };
  }, [user, getRecordsForUser]);

  const todayRecord = getTodayRecord();

  if (!user) return null;

  const statCards = [
    { label: 'Giorni', value: stats.total, icon: CalendarDays, color: 'text-primary' },
    { label: 'Presenze', value: stats.present, icon: CheckCircle, color: 'text-success' },
    { label: 'Assenze', value: stats.absent, icon: XCircle, color: 'text-destructive' },
    { label: 'Ritardi', value: stats.late, icon: Clock, color: 'text-warning' },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-[2vh]">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">ciao, {user.firstName}!</h1>
            <p className="text-muted-foreground text-sm">
              {getCompanyName(user.companyId)}
            </p>
          </div>
        </div>

        {/* Stats - Grid constrained by VH */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          {statCards.map(s => (
            <Card key={s.label} className="border-border h-[13vh] flex flex-col justify-center">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground leading-none">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today widget - Takes remaining space or specific VH */}
        <Card className="border-border w-full flex-1 min-h-[25vh]">
          <CardHeader className="pb-3 pt-5">
            <CardTitle className="text-lg font-semibold text-foreground">Oggi</CardTitle>
          </CardHeader>
          <CardContent>
            {todayRecord ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Badge className={`${STATUS_CONFIG[todayRecord.status].bg} ${STATUS_CONFIG[todayRecord.status].color} border-0 text-sm px-3 py-1`}>
                    {STATUS_CONFIG[todayRecord.status].label}
                  </Badge>
                </div>

                <div className="grid gap-2">
                  {todayRecord.morningStart && (
                    <div className="flex items-center gap-2 text-sm text-foreground/80 bg-secondary/30 p-2 rounded-md">
                      <span className="font-medium text-xs uppercase text-muted-foreground w-16">Mattina</span>
                      <span>{todayRecord.morningStart} – {todayRecord.morningEnd}</span>
                    </div>
                  )}
                  {todayRecord.afternoonStart && (
                    <div className="flex items-center gap-2 text-sm text-foreground/80 bg-secondary/30 p-2 rounded-md">
                      <span className="font-medium text-xs uppercase text-muted-foreground w-16">Pom.</span>
                      <span>{todayRecord.afternoonStart} – {todayRecord.afternoonEnd}</span>
                    </div>
                  )}
                </div>

                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/inserisci')}>
                  <PenSquare className="mr-2 h-4 w-4" /> Modifica Dati
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-6">
                <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-[80%]">
                  Non hai ancora registrato la presenza di oggi.
                </p>
                <Button onClick={() => navigate('/inserisci')} className="w-full mt-auto">
                  <PenSquare className="mr-2 h-4 w-4" /> Inserisci Presenza
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
