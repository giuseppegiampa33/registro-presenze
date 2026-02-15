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
    { label: 'Giorni Registrati', value: stats.total, icon: CalendarDays, color: 'text-primary' },
    { label: 'Presenze', value: stats.present, icon: CheckCircle, color: 'text-success' },
    { label: 'Assenze', value: stats.absent, icon: XCircle, color: 'text-destructive' },
    { label: 'Ritardi', value: stats.late, icon: Clock, color: 'text-warning' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Benvenuto, {user.firstName}!</h1>
          <p className="text-muted-foreground">
            {getCompanyName(user.companyId)} — {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(s => (
            <Card key={s.label} className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-secondary ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today widget */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">Oggi</CardTitle>
          </CardHeader>
          <CardContent>
            {todayRecord ? (
              <div className="flex items-center gap-4">
                <Badge className={`${STATUS_CONFIG[todayRecord.status].bg} ${STATUS_CONFIG[todayRecord.status].color} border-0`}>
                  {STATUS_CONFIG[todayRecord.status].label}
                </Badge>
                {todayRecord.morningStart && (
                  <span className="text-sm text-muted-foreground">
                    Mattina: {todayRecord.morningStart}–{todayRecord.morningEnd}
                  </span>
                )}
                {todayRecord.afternoonStart && (
                  <span className="text-sm text-muted-foreground">
                    Pomeriggio: {todayRecord.afternoonStart}–{todayRecord.afternoonEnd}
                  </span>
                )}
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => navigate('/inserisci')}>
                  <PenSquare className="mr-1 h-3 w-3" /> Modifica
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Non hai ancora inserito i dati di oggi.</p>
                <Button onClick={() => navigate('/inserisci')}>
                  <PenSquare className="mr-1 h-4 w-4" /> Inserisci Dati
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
