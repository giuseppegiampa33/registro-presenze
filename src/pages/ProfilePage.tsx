import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANIES, getCompanyName } from '@/lib/constants';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { uploadProfilePicture } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [companyId, setCompanyId] = useState(String(user?.companyId ?? ''));
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Record<string, unknown> = { firstName, lastName };
    if (companyId) updates.companyId = parseInt(companyId);
    if (password.length >= 6) updates.password = password;
    updateProfile(updates);
    setPassword('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profilo & Impostazioni</h1>
          <p className="text-muted-foreground text-sm">Gestisci le tue informazioni personali.</p>
        </div>

        <Card className="border-border flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">Informazioni Personali</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              {saved && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
                  <CheckCircle className="h-4 w-4" /> Profilo aggiornato!
                </div>
              )}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label>Foto Profilo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.profilePicture ? `http://localhost:3000${user.profilePicture}` : ''} />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="picture">Carica nuova foto</Label>
                    <Input id="picture" type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const res = await uploadProfilePicture(file);
                          // Update local user state immediately for better UX
                          // ideally we should have a refreshUser method in context
                          toast.success('Foto caricata! Ricarica la pagina per vederla ovunque.');
                          window.location.reload();
                        } catch (err) {
                          toast.error('Errore durante il caricamento');
                        }
                      }
                    }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fn">Nome</Label>
                  <Input id="fn" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ln">Cognome</Label>
                  <Input id="ln" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>
              {user.role === 'intern' && (
                <div className="space-y-2">
                  <Label>Azienda</Label>
                  <Select value={companyId} onValueChange={setCompanyId}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COMPANIES.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="pw">Nuova Password (opzionale)</Label>
                <Input id="pw" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimo 6 caratteri" />
              </div>
              <Button type="submit">Salva Modifiche</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
