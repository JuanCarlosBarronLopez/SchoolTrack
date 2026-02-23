import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Route, Navigation, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface VehicleInfo {
  vehicle_number: string;
  plate_number: string;
  capacity: number;
  status: string | null;
}

interface RouteInfo {
  name: string;
  start_time: string;
  end_time: string;
  status: string | null;
  description: string | null;
}

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDriverData = async () => {
      try {
        setLoading(true);
        // Find vehicle assigned to this driver
        const { data: vehicles, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('driver_id', user!.id);

        if (vehicleError) throw vehicleError;
        const myVehicle = vehicles && vehicles.length > 0 ? vehicles[0] : null;
        setVehicle(myVehicle);

        // If vehicle found, look for routes using that vehicle
        if (myVehicle) {
          const { data: routes, error: routeError } = await supabase
            .from('routes')
            .select('*')
            .eq('vehicle_id', myVehicle.id);

          if (!routeError && routes && routes.length > 0) {
            setRoute(routes[0]);
          }
        }
      } catch (err) {
        console.error('Error loading driver data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadDriverData();
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Panel de Conductor</h2>
        <p className="text-gray-600 mt-2">Tu vehículo y ruta asignada</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Card */}
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center mb-2">
              <Car className="w-6 h-6 text-cyan-500" />
            </div>
            <CardTitle>Mi Vehículo</CardTitle>
            <CardDescription>Unidad asignada</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : vehicle ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-lg">{vehicle.vehicle_number}</span>
                  <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                    {vehicle.status === 'active' ? 'Activo' : vehicle.status === 'maintenance' ? 'Mantenimiento' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Placa: <span className="font-mono font-medium">{vehicle.plate_number}</span></p>
                <p className="text-sm text-muted-foreground">Capacidad: {vehicle.capacity} pasajeros</p>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Car className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Sin vehículo asignado</p>
                <p className="text-sm mt-1">Contacta al administrador</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Route Card */}
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-2">
              <Route className="w-6 h-6 text-blue-500" />
            </div>
            <CardTitle>Ruta Asignada</CardTitle>
            <CardDescription>Tu ruta de trabajo</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : route ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{route.name}</span>
                  <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
                    {route.status === 'active' ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {route.start_time} – {route.end_time}
                </div>
                {route.description && (
                  <p className="text-sm text-muted-foreground">{route.description}</p>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Route className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>{vehicle ? 'Sin ruta asignada al vehículo' : 'Requiere vehículo asignado'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location Tracking CTA */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => navigate('/location')}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Navigation className="w-6 h-6 text-cyan-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rastreo de Ubicación</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Activa el rastreo GPS para que los padres puedan seguir el recorrido en tiempo real.
                </p>
              </div>
            </div>
            <Button variant="outline" className="shrink-0">
              <Navigation className="w-4 h-4 mr-2" />
              Activar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverDashboard;
