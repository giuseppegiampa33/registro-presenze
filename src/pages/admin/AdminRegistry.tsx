import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANIES, getCompanyName, STATUS_CONFIG, formatDate } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Pencil, Trash2 } from 'lucide-react';
import type { AttendanceStatus } from '@/lib/types';
import { EditRecordDialog } from '@/components/admin/EditRecordDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { updateAttendance, deleteAttendance } from '@/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminRegistry() {
  const { users, records } = useAuth();
  const queryClient = useQueryClient();
  const [filterCompany, setFilterCompany] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [deletingRecord, setDeletingRecord] = useState<any>(null);

  const handleEdit = (record: any) => {
    setEditingRecord(record);
  };

  const handleSaveEdit = async (data: any) => {
    try {
      await updateAttendance(data);
      toast.success('Record aggiornato');
      queryClient.invalidateQueries({ queryKey: ['records'] });
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento');
      throw error;
    }
  };

  const handleDelete = (record: any) => {
    setDeletingRecord(record);
  };

  const confirmDelete = async () => {
    if (!deletingRecord) return;
    try {
      await deleteAttendance(deletingRecord.id);
      toast.success('Record eliminato');
      setDeletingRecord(null);
      queryClient.invalidateQueries({ queryKey: ['records'] });
    } catch (error) {
      toast.error('Errore durante l\'eliminazione');
    }
  };

  const interns = users.filter(u => u.role === 'intern');

  const filtered = useMemo(() => {
    return records.filter(r => {
      const user = users.find(u => u.id === r.userId);
      if (!user || user.role !== 'intern') return false;
      if (filterCompany !== 'all' && user.companyId !== parseInt(filterCompany)) return false;
      if (filterUser !== 'all' && r.userId !== filterUser) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [records, users, filterCompany, filterUser, filterStatus, dateFrom, dateTo]);

  const exportCSV = () => {
    const header = 'Data,Nome,Cognome,Azienda,Stato,Mattina Inizio,Mattina Fine,Pomeriggio Inizio,Pomeriggio Fine,Note\n';
    const rows = filtered.map(r => {
      const u = users.find(usr => usr.id === r.userId);
      return [
        r.date,
        u?.firstName ?? '',
        u?.lastName ?? '',
        getCompanyName(u?.companyId ?? null),
        STATUS_CONFIG[r.status].label,
        r.morningStart ?? '',
        r.morningEnd ?? '',
        r.afternoonStart ?? '',
        r.afternoonEnd ?? '',
        r.notes ?? '',
      ].map(v => `"${v}"`).join(',');
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'registro_presenze.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">Registro Generale</h1>
          <p className="text-sm text-muted-foreground">Visualizza e gestisci lo storico di tutte le presenze.</p>
        </div>

        <div className="flex items-center justify-between">
          <div /> {/* Spacer if needed or keep it simple */}
          <Button variant="outline" onClick={exportCSV} disabled={filtered.length === 0}>
            <Download className="mr-1 h-4 w-4" /> Esporta CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Azienda</Label>
              <Select value={filterCompany} onValueChange={setFilterCompany}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte</SelectItem>
                  {COMPANIES.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tirocinante</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  {interns.map(u => <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Stato</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Da</Label>
              <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">A</Label>
              <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tirocinante</TableHead>
                  <TableHead>Azienda</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Mattina</TableHead>
                  <TableHead>Pomeriggio</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => {
                  const u = users.find(usr => usr.id === r.userId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-foreground">{formatDate(r.date)}</TableCell>
                      <TableCell className="font-medium text-foreground">{u?.firstName} {u?.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{getCompanyName(u?.companyId ?? null)}</TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_CONFIG[r.status].bg} ${STATUS_CONFIG[r.status].color} border-0`}>
                          {STATUS_CONFIG[r.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.morningStart ? `${r.morningStart}–${r.morningEnd}` : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.afternoonStart ? `${r.afternoonStart}–${r.afternoonEnd}` : '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{r.notes ?? '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(r)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(r)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">Nessun record trovato</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <EditRecordDialog
        open={!!editingRecord}
        onOpenChange={(open) => !open && setEditingRecord(null)}
        record={editingRecord}
        onSave={handleSaveEdit}
      />

      <AlertDialog open={!!deletingRecord} onOpenChange={(open) => !open && setDeletingRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Il record del <strong>{deletingRecord?.date}</strong> verrà eliminato permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout >
  );
}
