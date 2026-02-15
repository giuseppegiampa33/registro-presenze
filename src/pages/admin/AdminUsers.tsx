import { useAuth } from '@/contexts/AuthContext';
import { getCompanyName } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function AdminUsers() {
  const { users } = useAuth();
  const interns = users.filter(u => u.role === 'intern');

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Elenco Tirocinanti</h1>
          <p className="text-sm text-muted-foreground">Lista completa di tutti i tirocinanti registrati nel sistema.</p>
        </div>
        <Card className="border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cognome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Azienda</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interns.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium text-foreground">{u.firstName}</TableCell>
                    <TableCell className="text-foreground">{u.lastName}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getCompanyName(u.companyId)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {interns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">Nessun tirocinante registrato</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
