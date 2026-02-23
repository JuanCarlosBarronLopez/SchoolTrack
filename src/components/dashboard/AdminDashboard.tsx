import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Car, Route, UserCheck, UserCog, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchStats } from '@/integrations/supabase/client';

interface Stats {
  users: number;
  students: number;
  vehicles: number;
  activeVehicles: number;
  routes: number;
  activeRoutes: number;
  drivers: number;
  locations: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().then((data) => {
      if (data) setStats(data);
      setLoading(false);
    });
  }, []);

  const cards = [
    {
      title: 'Usuarios',
      value: stats?.users ?? 0,
      icon: UserCog,
      description: 'Gestión de usuarios',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: '#f97316',
      route: '/users',
    },
    {
      title: 'Total Estudiantes',
      value: stats?.students ?? 0,
      icon: Users,
      description: 'Estudiantes registrados',
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      borderColor: '#06b6d4',
      route: '/students',
    },
    {
      title: 'Vehículos Activos',
      value: stats?.activeVehicles ?? 0,
      icon: Car,
      description: `${stats?.vehicles ?? 0} en total`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: '#3b82f6',
      route: '/vehicles',
    },
    {
      title: 'Rutas Activas',
      value: stats?.activeRoutes ?? 0,
      icon: Route,
      description: `${stats?.routes ?? 0} rutas en total`,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: '#22c55e',
      route: '/routes',
    },
    {
      title: 'Conductores',
      value: stats?.drivers ?? 0,
      icon: UserCheck,
      description: 'Conductores asignados',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: '#a855f7',
      route: '/drivers',
    },
    {
      title: 'Ubicaciones',
      value: stats?.locations ?? 0,
      icon: Navigation,
      description: 'Registros GPS totales',
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: '#ef4444',
      route: '/admin/locations',
    },
  ];

  const quickActions = [
    { label: 'Gestionar Usuarios', description: 'Administrar usuarios y roles', icon: UserCog, color: 'text-orange-500', hover: 'hover:bg-orange-50', route: '/users' },
    { label: 'Gestionar Estudiantes', description: 'Agregar, editar o eliminar estudiantes', icon: Users, color: 'text-cyan-500', hover: 'hover:bg-cyan-50', route: '/students' },
    { label: 'Gestionar Vehículos', description: 'Administrar unidades de transporte', icon: Car, color: 'text-blue-500', hover: 'hover:bg-blue-50', route: '/vehicles' },
    { label: 'Gestionar Rutas', description: 'Configurar rutas y horarios', icon: Route, color: 'text-green-500', hover: 'hover:bg-green-50', route: '/routes' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Panel de Administración</h2>
        <p className="text-gray-600 mt-2">Gestiona todo el sistema de transporte escolar</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, index) => (
          <Card
            key={index}
            className="hover:shadow-lg transition-all cursor-pointer border-l-4 hover:scale-105"
            style={{ borderLeftColor: card.borderColor }}
            onClick={() => navigate(card.route)}
          >
            <CardHeader className="pb-2">
              <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center mb-2`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              {loading ? (
                <Skeleton className="h-8 w-12 mb-1" />
              ) : (
                <CardTitle className="text-2xl font-bold">{card.value.toLocaleString()}</CardTitle>
              )}
              <CardDescription className="font-medium">{card.title}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <p className="text-sm text-gray-600">{card.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Operaciones frecuentes del administrador</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                className={`w-full text-left px-4 py-3 rounded-lg ${action.hover} transition-colors border border-border`}
                onClick={() => navigate(action.route)}
              >
                <div className="flex items-center gap-3">
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <div>
                    <p className="font-medium">{action.label}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen del Sistema</CardTitle>
            <CardDescription>Estado actual de la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Estudiantes activos</span>
                  <span className="font-semibold text-cyan-600">{stats?.students ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Vehículos en servicio</span>
                  <span className="font-semibold text-blue-600">{stats?.activeVehicles ?? 0} / {stats?.vehicles ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Rutas operativas</span>
                  <span className="font-semibold text-green-600">{stats?.activeRoutes ?? 0} / {stats?.routes ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Conductores registrados</span>
                  <span className="font-semibold text-purple-600">{stats?.drivers ?? 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Registros de ubicación</span>
                  <span className="font-semibold text-red-600">{stats?.locations?.toLocaleString() ?? 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
