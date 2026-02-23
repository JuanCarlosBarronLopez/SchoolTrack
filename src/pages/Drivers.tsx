import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Car } from 'lucide-react';
import { toast } from 'sonner';

interface Driver {
  id: string;
  full_name: string | null;
  email: string;
}

interface Vehicle {
  id: string;
  vehicle_number: string;
  plate_number: string;
  driver_id: string | null;
  status: string | null;
}

const Drivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      // 1. Get user_ids with role 'driver'
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'driver');

      if (roleError) throw roleError;

      const driverIds = (roleData ?? []).map((r: any) => r.user_id);

      // 2. Load profiles and all vehicles concurrently
      const [profilesResult, vehiclesResult] = await Promise.all([
        driverIds.length > 0
          ? supabase.from('profiles').select('id, full_name, email').in('id', driverIds)
          : Promise.resolve({ data: [], error: null }),
        supabase.from('vehicles').select('id, vehicle_number, plate_number, driver_id, status'),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (vehiclesResult.error) throw vehiclesResult.error;

      setDrivers(profilesResult.data || []);
      setVehicles(vehiclesResult.data || []);
    } catch (error: any) {
      toast.error('Error al cargar conductores: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAssignedVehicle = (driverId: string) => {
    return vehicles.find(v => v.driver_id === driverId) || null;
  };

  const filteredDrivers = drivers.filter(d =>
    (d.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-cyan-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Conductores</h1>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Conductores Registrados</CardTitle>
            <CardDescription>
              Usuarios con rol de conductor. Para asignar o quitar conductores, usa{' '}
              <button className="text-primary underline" onClick={() => navigate('/users')}>Gestión de Usuarios</button>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar por nombre o email..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vehículo Asignado</TableHead>
                    <TableHead>Estado Vehículo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8">Cargando conductores...</TableCell></TableRow>
                  ) : filteredDrivers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                        <Car className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        {searchTerm ? 'No se encontraron conductores con ese criterio' : 'No hay conductores registrados. Asigna el rol "Conductor" a un usuario desde Gestión de Usuarios.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDrivers.map((driver) => {
                      const vehicle = getAssignedVehicle(driver.id);
                      return (
                        <TableRow key={driver.id}>
                          <TableCell className="font-medium">{driver.full_name || 'Sin nombre'}</TableCell>
                          <TableCell className="text-muted-foreground">{driver.email}</TableCell>
                          <TableCell>
                            {vehicle ? (
                              <span className="font-mono text-sm">
                                {vehicle.vehicle_number} <span className="text-muted-foreground">({vehicle.plate_number})</span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">Sin vehículo</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {vehicle ? (
                              <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                                {vehicle.status === 'active' ? 'Activo' : vehicle.status === 'maintenance' ? 'Mantenimiento' : 'Inactivo'}
                              </Badge>
                            ) : (
                              <Badge variant="outline">—</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Drivers;