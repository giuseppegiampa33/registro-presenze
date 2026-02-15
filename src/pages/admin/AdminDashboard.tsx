import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const { users, records } = useAuth();

  const stats = useMemo(() => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthRecs = records.filter(r => r.date.startsWith(monthStr));
    const interns = users.filter(u => u.role === 'intern');
    return {
      totalInterns: interns.length,
      present: monthRecs.filter(r => r.status === 'present').length,
      absent: monthRecs.filter(r => r.status === 'absent').length,
      late: monthRecs.filter(r => r.status === 'late').length,
    };
  }, [users, records]);

  const cards = [
    { label: 'Tirocinanti', value: stats.totalInterns, icon: Users, color: 'text-primary' },
    { label: 'Presenze (mese)', value: stats.present, icon: CheckCircle, color: 'text-success' },
    { label: 'Assenze (mese)', value: stats.absent, icon: XCircle, color: 'text-destructive' },
    { label: 'Ritardi (mese)', value: stats.late, icon: Clock, color: 'text-warning' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(c => (
            <Card key={c.label} className="border-border">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-secondary ${c.color}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
