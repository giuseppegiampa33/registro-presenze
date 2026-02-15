import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface EditRecordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record: any;
    onSave: (data: any) => Promise<void>;
}

export function EditRecordDialog({ open, onOpenChange, record, onSave }: EditRecordDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        status: '',
        morningStart: '',
        morningEnd: '',
        afternoonStart: '',
        afternoonEnd: '',
        notes: ''
    });

    useEffect(() => {
        if (record) {
            setFormData({
                status: record.status || 'present',
                morningStart: record.morningStart || '',
                morningEnd: record.morningEnd || '',
                afternoonStart: record.afternoonStart || '',
                afternoonEnd: record.afternoonEnd || '',
                notes: record.notes || ''
            });
        }
    }, [record]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onSave({ ...formData, userId: record.userId, date: record.date });
            onOpenChange(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifica Presenza - {record?.date}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Stato</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Seleziona stato" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="present">Presente</SelectItem>
                                <SelectItem value="absent">Assente</SelectItem>
                                <SelectItem value="late">Ritardo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="morningStart" className="text-right">Mattina Inizio</Label>
                        <Input
                            id="morningStart"
                            type="time"
                            className="col-span-3"
                            value={formData.morningStart}
                            onChange={(e) => setFormData({ ...formData, morningStart: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="morningEnd" className="text-right">Mattina Fine</Label>
                        <Input
                            id="morningEnd"
                            type="time"
                            className="col-span-3"
                            value={formData.morningEnd}
                            onChange={(e) => setFormData({ ...formData, morningEnd: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="afternoonStart" className="text-right">Pom. Inizio</Label>
                        <Input
                            id="afternoonStart"
                            type="time"
                            className="col-span-3"
                            value={formData.afternoonStart}
                            onChange={(e) => setFormData({ ...formData, afternoonStart: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="afternoonEnd" className="text-right">Pom. Fine</Label>
                        <Input
                            id="afternoonEnd"
                            type="time"
                            className="col-span-3"
                            value={formData.afternoonEnd}
                            onChange={(e) => setFormData({ ...formData, afternoonEnd: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">Note</Label>
                        <Textarea
                            id="notes"
                            className="col-span-3"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
