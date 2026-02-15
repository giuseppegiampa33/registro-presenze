import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { downloadExcel } from '@/lib/api';
import { toast } from 'sonner';

export default function ExportCsv() {
    const { user } = useAuth();

    const handleExport = async () => {
        try {
            await downloadExcel();
            toast.success('Excel scaricato con successo');
        } catch (error) {
            console.error(error);
            toast.error('Errore durante il download del file Excel');
        }
    };

    if (!user) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Esporta Dati</h1>
                    <p className="text-muted-foreground">
                        Scarica i tuoi dati di presenza in formato Excel.
                    </p>
                </div>

                <Card className="border-border">
                    <CardHeader>
                        <CardTitle>Esporta Presenze</CardTitle>
                        <CardDescription>
                            Clicca il pulsante qui sotto per scaricare un file Excel contenente tutto lo storico delle tue presenze,
                            inclusi orari di entrata, uscita e note.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={handleExport} className="w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Scarica Excel
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
