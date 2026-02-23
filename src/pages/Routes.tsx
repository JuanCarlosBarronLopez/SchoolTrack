import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Route {
  id: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  status: string | null;
  vehicle_id: string | null;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  plate_number: string;
}

const RoutesPage = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null);
  const [deleting, setDeleting] = useState(false);

  const defaultForm = { name: '', description: '', start_time: '', end_time: '', vehicle_id: '', status: 'active' };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => { loadRoutes(); loadVehicles(); }, []);

  const loadRoutes = async () => {
    try {
      const { data, error } = await supabase.from('routes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRoutes(data || []);
    } catch (error: any) {
      toast.error('Error al cargar rutas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const { data, error } = await supabase.from('vehicles').select('id, vehicle_number, plate_number').eq('status', 'active');
      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  const resetForm = () => { setFormData(defaultForm); setEditingRoute(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const routeData = {
        name: formData.name,
        description: formData.description || null,
        start_time: formData.start_time,
        end_time: formData.end_time,
        vehicle_id: formData.vehicle_id || null,
        status: formData.status,
      };
      if (editingRoute) {
        const { error } = await supabase.from('routes').update(routeData).eq('id', editingRoute.id);
        if (error) throw error;
        toast.success('Ruta actualizada exitosamente');
      } else {
        const { error } = await supabase.from('routes').insert([routeData]);
        if (error) throw error;
        toast.success('Ruta creada exitosamente');
      }
      setIsDialogOpen(false);
      resetForm();
      loadRoutes();
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setFormData({
      name: route.name,
      description: route.description || '',
      start_time: route.start_time,
      end_time: route.end_time,
      vehicle_id: route.vehicle_id || '',
      status: route.status || 'active',
    });
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('routes').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      toast.success('Ruta eliminada exitosamente');
      loadRoutes();
    } catch (error: any) {
      toast.error('Error al eliminar: ' + error.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getVehicleInfo = (vehicleId: string | null) => {
    if (!vehicleId) return '—';
    const v = vehicles.find(v => v.id === vehicleId);
    return v ? `${v.vehicle_number} (${v.plate_number})` : '—';
  };

  const filteredRoutes = routes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Rutas</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Rutas Registradas</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}><Plus className="w-4 h-4 mr-2" />Nueva Ruta</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingRoute ? 'Editar Ruta' : 'Nueva Ruta'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Ruta *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_time">Hora de Inicio *</Label>
                      <Input id="start_time" type="time" value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_time">Hora de Fin *</Label>
                      <Input id="end_time" type="time" value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activa</SelectItem>
                        <SelectItem value="inactive">Inactiva</SelectItem>
                        <SelectItem value="suspended">Suspendida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vehículo Asignado</Label>
                    <Select value={formData.vehicle_id} onValueChange={(v) => setFormData({ ...formData, vehicle_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar vehículo" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Sin asignar</SelectItem>
                        {vehicles.map((vehicle) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.vehicle_number} ({vehicle.plate_number})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar por nombre..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Horario</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center">Cargando...</TableCell></TableRow>
                  ) : filteredRoutes.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No hay rutas registradas</TableCell></TableRow>
                  ) : (
                    filteredRoutes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">{route.name}</TableCell>
                        <TableCell>{route.start_time} – {route.end_time}</TableCell>
                        <TableCell>{getVehicleInfo(route.vehicle_id)}</TableCell>
                        <TableCell>
                          <Badge variant={route.status === 'active' ? 'default' : route.status === 'suspended' ? 'destructive' : 'secondary'}>
                            {route.status === 'active' ? 'Activa' : route.status === 'suspended' ? 'Suspendida' : 'Inactiva'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(route)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(route)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ruta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente la ruta <span className="font-semibold">"{deleteTarget?.name}"</span>.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoutesPage;