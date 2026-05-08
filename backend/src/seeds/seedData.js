import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Vehicle from '../models/Vehicle.js';
import Route from '../models/Route.js';
import Waypoint from '../models/Waypoint.js';
import BlogPost from '../models/BlogPost.js';

dotenv.config();

const seedData = async () => {
  try {
    // Conectar a BD
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/schooltrack');
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones existentes
    await User.deleteMany({});
    await Student.deleteMany({});
    await Vehicle.deleteMany({});
    await Route.deleteMany({});
    await Waypoint.deleteMany({});
    await BlogPost.deleteMany({});
    console.log('🗑️  Colecciones limpiadas');

    // ============================================================
    // 1. CREAR USUARIOS (Admin, Conductores, Padres, Estudiantes)
    // ============================================================

    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const admin = await User.create({
      firstName: 'Juan',
      lastName: 'García',
      email: 'admin@schooltrack.com',
      password: hashedPassword,
      phone: '+52 441 123 4567',
      role: 'admin',
      status: 'active',
      isVerified: true,
      profile: {
        currentLocation: {
          latitude: 20.3889,
          longitude: -99.9981,
          timestamp: new Date()
        }
      }
    });

    console.log('✅ Admin creado');

    // Crear conductores
    const drivers = await User.insertMany([
      {
        firstName: 'Carlos',
        lastName: 'Mendoza',
        email: 'carlos.mendoza@schooltrack.com',
        password: hashedPassword,
        phone: '+52 441 234 5678',
        role: 'driver',
        status: 'active',
        isVerified: true,
        profile: {
          driver: {
            licenseNumber: 'DL123456789',
            licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            experience: 5,
            vehicleType: 'Sprinter',
            certifications: ['First Aid', 'Defensive Driving']
          },
          currentLocation: {
            latitude: 20.3889,
            longitude: -99.9981,
            timestamp: new Date()
          }
        }
      },
      {
        firstName: 'Roberto',
        lastName: 'López',
        email: 'roberto.lopez@schooltrack.com',
        password: hashedPassword,
        phone: '+52 441 345 6789',
        role: 'driver',
        status: 'active',
        isVerified: true,
        profile: {
          driver: {
            licenseNumber: 'DL987654321',
            licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            experience: 8,
            vehicleType: 'Transit',
            certifications: ['First Aid', 'CPR']
          },
          currentLocation: {
            latitude: 20.3950,
            longitude: -99.9920,
            timestamp: new Date()
          }
        }
      },
      {
        firstName: 'Miguel',
        lastName: 'Hernández',
        email: 'miguel.hernandez@schooltrack.com',
        password: hashedPassword,
        phone: '+52 441 456 7890',
        role: 'driver',
        status: 'active',
        isVerified: true,
        profile: {
          driver: {
            licenseNumber: 'DL555666777',
            licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            experience: 3,
            vehicleType: 'Crafter',
            certifications: ['First Aid']
          },
          currentLocation: {
            latitude: 20.3820,
            longitude: -100.0050,
            timestamp: new Date()
          }
        }
      }
    ]);

    console.log('✅ 3 Conductores creados');

    // Crear padres
    const parents = await User.insertMany([
      {
        firstName: 'María',
        lastName: 'Sánchez',
        email: 'maria.sanchez@email.com',
        password: hashedPassword,
        phone: '+52 441 111 1111',
        role: 'parent',
        status: 'active',
        isVerified: true,
        profile: {
          parent: {
            preferredContactMethod: 'push',
            notificationSettings: {
              pickup: true,
              dropoff: true,
              delays: true,
              emergencies: true
            }
          }
        }
      },
      {
        firstName: 'Antonio',
        lastName: 'Rodríguez',
        email: 'antonio.rodriguez@email.com',
        password: hashedPassword,
        phone: '+52 441 222 2222',
        role: 'parent',
        status: 'active',
        isVerified: true,
        profile: {
          parent: {
            preferredContactMethod: 'email',
            notificationSettings: {
              pickup: true,
              dropoff: true,
              delays: true,
              emergencies: true
            }
          }
        }
      },
      {
        firstName: 'Laura',
        lastName: 'González',
        email: 'laura.gonzalez@email.com',
        password: hashedPassword,
        phone: '+52 441 333 3333',
        role: 'parent',
        status: 'active',
        isVerified: true,
        profile: {
          parent: {
            preferredContactMethod: 'push',
            notificationSettings: {
              pickup: true,
              dropoff: true,
              delays: true,
              emergencies: true
            }
          }
        }
      },
      {
        firstName: 'Diego',
        lastName: 'Martínez',
        email: 'diego.martinez@email.com',
        password: hashedPassword,
        phone: '+52 441 444 4444',
        role: 'parent',
        status: 'active',
        isVerified: true,
        profile: {
          parent: {
            preferredContactMethod: 'email',
            notificationSettings: {
              pickup: true,
              dropoff: true,
              delays: true,
              emergencies: true
            }
          }
        }
      }
    ]);

    console.log('✅ 4 Padres creados');

    // ============================================================
    // 2. CREAR VEHÍCULOS
    // ============================================================

    const vehicles = await Vehicle.insertMany([
      {
        licensePlate: 'ABC-123-XY',
        model: 'Sprinter 2022',
        brand: 'Mercedes-Benz',
        year: 2022,
        color: 'Blanco',
        capacity: 20,
        status: 'active',
        driver: drivers[0]._id,
        lastLocation: {
          latitude: 20.3889,
          longitude: -99.9981,
          timestamp: new Date()
        }
      },
      {
        licensePlate: 'DEF-456-ZW',
        model: 'Transit 2021',
        brand: 'Ford',
        year: 2021,
        color: 'Azul',
        capacity: 15,
        status: 'active',
        driver: drivers[1]._id,
        lastLocation: {
          latitude: 20.3950,
          longitude: -99.9920,
          timestamp: new Date()
        }
      },
      {
        licensePlate: 'GHI-789-UV',
        model: 'Crafter 2023',
        brand: 'Volkswagen',
        year: 2023,
        color: 'Plateado',
        capacity: 18,
        status: 'active',
        driver: drivers[2]._id,
        lastLocation: {
          latitude: 20.3820,
          longitude: -100.0050,
          timestamp: new Date()
        }
      }
    ]);

    console.log('✅ 3 Vehículos creados');

    // ============================================================
    // 3. CREAR RUTAS CON WAYPOINTS
    // ============================================================

    const routes = await Route.insertMany([
      {
        name: 'Ruta Centro - UTSJR',
        code: 'RT001',
        description: 'Ruta desde el centro de San Juan del Río a la Universidad Tecnológica',
        type: 'both',
        status: 'active',
        vehicle: vehicles[0]._id,
        driver: drivers[0]._id,
        estimatedDuration: 30,
        totalDistance: 12.5,
        school: {
          name: 'Universidad Tecnológica de San Juan del Río',
          address: 'Querétaro, México',
          coordinates: {
            type: 'Point',
            coordinates: [-99.972222, 20.403611]
          }
        }
      },
      {
        name: 'Ruta Norte - UTSJR',
        code: 'RT002',
        description: 'Ruta desde la zona norte de SJR a la Universidad',
        type: 'both',
        status: 'active',
        vehicle: vehicles[1]._id,
        driver: drivers[1]._id,
        estimatedDuration: 35,
        totalDistance: 15.0,
        school: {
          name: 'Universidad Tecnológica de San Juan del Río',
          address: 'Querétaro, México',
          coordinates: {
            type: 'Point',
            coordinates: [-99.972222, 20.403611]
          }
        }
      },
      {
        name: 'Ruta Sur - UTSJR',
        code: 'RT003',
        description: 'Ruta desde la zona sur de SJR a la Universidad',
        type: 'both',
        status: 'active',
        vehicle: vehicles[2]._id,
        driver: drivers[2]._id,
        estimatedDuration: 40,
        totalDistance: 18.0,
        school: {
          name: 'Universidad Tecnológica de San Juan del Río',
          address: 'Querétaro, México',
          coordinates: {
            type: 'Point',
            coordinates: [-99.972222, 20.403611]
          }
        }
      }
    ]);

    console.log('✅ 3 Rutas creadas');

    // ============================================================
    // 4. CREAR WAYPOINTS PARA CADA RUTA
    // ============================================================

    // Waypoints para Ruta Centro
    const waypointsRuta1 = await Waypoint.insertMany([
      {
        route: routes[0]._id,
        name: 'Centro Histórico SJR',
        location: {
          type: 'Point',
          coordinates: [-99.995833, 20.387778]
        },
        address: {
          street: 'Plaza Principal',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 1,
        type: 'pickup',
        estimatedArrivalTime: 0,
        status: 'pending',
        students: []
      },
      {
        route: routes[0]._id,
        name: 'Plaza Comercial',
        location: {
          type: 'Point',
          coordinates: [-99.991111, 20.389444]
        },
        address: {
          street: 'Av. Central',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 2,
        type: 'pickup',
        estimatedArrivalTime: 5,
        status: 'pending',
        students: []
      },
      {
        route: routes[0]._id,
        name: 'Colonia Estrella',
        location: {
          type: 'Point',
          coordinates: [-99.985556, 20.394167]
        },
        address: {
          street: 'Calle Principal',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 3,
        type: 'pickup',
        estimatedArrivalTime: 12,
        status: 'pending',
        students: []
      },
      {
        route: routes[0]._id,
        name: 'Boulevard Bernardo Quintana',
        location: {
          type: 'Point',
          coordinates: [-99.979167, 20.398889]
        },
        address: {
          street: 'Boulevard Principal',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 4,
        type: 'intermediate',
        estimatedArrivalTime: 20,
        status: 'pending',
        students: []
      },
      {
        route: routes[0]._id,
        name: 'Entrada UTSJR',
        location: {
          type: 'Point',
          coordinates: [-99.973889, 20.402222]
        },
        address: {
          street: 'Entrada Principal',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 5,
        type: 'intermediate',
        estimatedArrivalTime: 28,
        status: 'pending',
        students: []
      },
      {
        route: routes[0]._id,
        name: 'Universidad Tecnológica SJR',
        location: {
          type: 'Point',
          coordinates: [-99.972222, 20.403611]
        },
        address: {
          street: 'Avenida Universidad',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 6,
        type: 'dropoff',
        estimatedArrivalTime: 30,
        status: 'pending',
        students: []
      }
    ]);

    console.log('✅ 6 Waypoints Ruta Centro creados');

    // Waypoints Ruta Norte
    const waypointsRuta2 = await Waypoint.insertMany([
      {
        route: routes[1]._id,
        name: 'Col. Guadalupe',
        location: {
          type: 'Point',
          coordinates: [-100.010000, 20.380000]
        },
        address: {
          street: 'Calle Norte 1',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 1,
        type: 'pickup',
        estimatedArrivalTime: 0
      },
      {
        route: routes[1]._id,
        name: 'Valle Dorado',
        location: {
          type: 'Point',
          coordinates: [-100.000000, 20.390000]
        },
        address: {
          street: 'Calle Norte 2',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 2,
        type: 'pickup',
        estimatedArrivalTime: 10
      },
      {
        route: routes[1]._id,
        name: 'Universidad Tecnológica SJR',
        location: {
          type: 'Point',
          coordinates: [-99.972222, 20.403611]
        },
        address: {
          street: 'Avenida Universidad',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 3,
        type: 'dropoff',
        estimatedArrivalTime: 35
      }
    ]);

    console.log('✅ 3 Waypoints Ruta Norte creados');

    // Waypoints Ruta Sur
    const waypointsRuta3 = await Waypoint.insertMany([
      {
        route: routes[2]._id,
        name: 'Col. La Trinidad',
        location: {
          type: 'Point',
          coordinates: [-100.010000, 20.375000]
        },
        address: {
          street: 'Calle Sur 1',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 1,
        type: 'pickup',
        estimatedArrivalTime: 0
      },
      {
        route: routes[2]._id,
        name: 'Fraccionamiento Jazmín',
        location: {
          type: 'Point',
          coordinates: [-99.990000, 20.370000]
        },
        address: {
          street: 'Calle Sur 2',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 2,
        type: 'pickup',
        estimatedArrivalTime: 15
      },
      {
        route: routes[2]._id,
        name: 'Universidad Tecnológica SJR',
        location: {
          type: 'Point',
          coordinates: [-99.972222, 20.403611]
        },
        address: {
          street: 'Avenida Universidad',
          city: 'San Juan del Río',
          state: 'Querétaro',
          country: 'México'
        },
        order: 3,
        type: 'dropoff',
        estimatedArrivalTime: 40
      }
    ]);

    console.log('✅ 3 Waypoints Ruta Sur creados');

    // ============================================================
    // 5. CREAR ESTUDIANTES
    // ============================================================

    const students = await Student.insertMany([
      {
        firstName: 'Ana',
        lastName: 'Sánchez',
        parent: parents[0]._id,
        assignedRoute: routes[0]._id,
        assignedVehicle: vehicles[0]._id,
        studentId: 'STU001',
        qrCode: `QR_${Date.now()}_001`,
        grade: '3rd',
        academicYear: '2024-2025',
        dateOfBirth: new Date('2010-05-15'),
        emergencyContact: {
          name: 'María Sánchez',
          phone: '+52 441 111 1111',
          relationship: 'Parent'
        },
        medicalInfo: {
          allergies: [],
          bloodType: 'O+'
        }
      },
      {
        firstName: 'Luis',
        lastName: 'Rodríguez',
        parent: parents[1]._id,
        assignedRoute: routes[1]._id,
        assignedVehicle: vehicles[1]._id,
        studentId: 'STU002',
        qrCode: `QR_${Date.now()}_002`,
        grade: '5th',
        academicYear: '2024-2025',
        dateOfBirth: new Date('2008-03-20'),
        emergencyContact: {
          name: 'Antonio Rodríguez',
          phone: '+52 441 222 2222',
          relationship: 'Parent'
        },
        medicalInfo: {
          allergies: ['Nuts'],
          bloodType: 'A+'
        }
      },
      {
        firstName: 'Carlos',
        lastName: 'González',
        parent: parents[2]._id,
        assignedRoute: routes[2]._id,
        assignedVehicle: vehicles[2]._id,
        studentId: 'STU003',
        qrCode: `QR_${Date.now()}_003`,
        grade: '7th',
        academicYear: '2024-2025',
        dateOfBirth: new Date('2006-07-10'),
        emergencyContact: {
          name: 'Laura González',
          phone: '+52 441 333 3333',
          relationship: 'Parent'
        },
        medicalInfo: {
          allergies: [],
          bloodType: 'B+'
        }
      },
      {
        firstName: 'Sofía',
        lastName: 'Martínez',
        parent: parents[3]._id,
        assignedRoute: routes[0]._id,
        assignedVehicle: vehicles[0]._id,
        studentId: 'STU004',
        qrCode: `QR_${Date.now()}_004`,
        grade: '4th',
        academicYear: '2024-2025',
        dateOfBirth: new Date('2009-11-25'),
        emergencyContact: {
          name: 'Diego Martínez',
          phone: '+52 441 444 4444',
          relationship: 'Parent'
        },
        medicalInfo: {
          allergies: ['Dairy'],
          bloodType: 'O-'
        }
      },
      {
        firstName: 'Marco',
        lastName: 'Sánchez',
        parent: parents[0]._id,
        assignedRoute: routes[1]._id,
        assignedVehicle: vehicles[1]._id,
        studentId: 'STU005',
        qrCode: `QR_${Date.now()}_005`,
        grade: '6th',
        academicYear: '2024-2025',
        dateOfBirth: new Date('2007-09-30'),
        emergencyContact: {
          name: 'María Sánchez',
          phone: '+52 441 111 1111',
          relationship: 'Parent'
        },
        medicalInfo: {
          allergies: [],
          bloodType: 'AB+'
        }
      }
    ]);

    console.log('✅ 5 Estudiantes creados');

    // ============================================================
    // 6. CREAR POSTS DE BLOG
    // ============================================================

    const blogPosts = await BlogPost.insertMany([
      {
        title: 'Bienvenidos a SchoolTrack UTSJR',
        slug: 'bienvenidos-schooltrack-utsjr',
        excerpt: 'Sistema de seguimiento en tiempo real para transporte escolar de UTSJR',
        content: `SchoolTrack es el sistema de seguimiento de transporte escolar de la Universidad Tecnológica de San Juan del Río. 
                  Con nuestra plataforma, padres y estudiantes pueden rastrear en tiempo real la ubicación de las unidades de transporte.
                  
                  Características principales:
                  - Rastreo en tiempo real de vehículos
                  - Notificaciones a padres
                  - Sistema de QR para check-in
                  - Historial de viajes
                  - Comunicación directa con conductores`,
        author: admin._id,
        category: 'noticias',
        tags: ['bienvenida', 'utsjr', 'seguimiento'],
        published: true,
        publishedAt: new Date(),
        featured: true,
        seoTitle: 'SchoolTrack - Sistema de Transporte UTSJR',
        seoDescription: 'Plataforma de seguimiento de transporte escolar para UTSJR'
      },
      {
        title: 'Seguridad en el Transporte Escolar',
        slug: 'seguridad-transporte-escolar',
        excerpt: 'Conoce las medidas de seguridad implementadas en el transporte',
        content: `La seguridad de nuestros estudiantes es nuestra prioridad principal.
                  
                  Medidas de seguridad:
                  - Todos nuestros conductores están certificados y verificados
                  - Las unidades cuentan con GPS en tiempo real
                  - Seguimiento 24/7 de ubicación
                  - Contacto de emergencia permanente
                  - Protocolos de seguridad implementados
                  
                  Creemos que la transparencia y la tecnología son fundamentales para la seguridad de nuestros estudiantes.`,
        author: admin._id,
        category: 'seguridad',
        tags: ['seguridad', 'conductores', 'gps'],
        published: true,
        publishedAt: new Date(Date.now() - 86400000), // Hace 1 día
        featured: true,
        seoTitle: 'Seguridad en Transporte Escolar - Medidas de SchoolTrack',
        seoDescription: 'Medidas de seguridad y protocolos implementados en SchoolTrack'
      },
      {
        title: 'Nuevas Rutas Disponibles',
        slug: 'nuevas-rutas-disponibles',
        excerpt: 'Más opciones de transporte para la comunidad estudiantil',
        content: `Nos complace anunciar la apertura de nuevas rutas en San Juan del Río.
                  
                  Rutas disponibles:
                  - Ruta Centro → UTSJR (30 minutos)
                  - Ruta Norte → UTSJR (35 minutos)
                  - Ruta Sur → UTSJR (40 minutos)
                  
                  Estas nuevas rutas facilitan el acceso a la Universidad Tecnológica desde diferentes zonas de la ciudad.`,
        author: admin._id,
        category: 'actualizaciones',
        tags: ['rutas', 'transporte', 'utsjr'],
        published: true,
        publishedAt: new Date(Date.now() - 172800000), // Hace 2 días
        featured: false,
        seoTitle: 'Nuevas Rutas de Transporte - SchoolTrack UTSJR',
        seoDescription: 'Nuevas rutas de transporte escolar disponibles en San Juan del Río'
      },
      {
        title: 'Tips de Seguridad para Padres',
        slug: 'tips-seguridad-padres',
        excerpt: 'Recomendaciones para mantener a sus hijos seguros',
        content: `Como padres, es importante seguir estas recomendaciones:
                  
                  1. Enseñe a sus hijos sobre seguridad en transporte
                  2. Activar notificaciones en la app
                  3. Conocer al conductor
                  4. Tener siempre contacto de emergencia
                  5. Revisar historial de viajes regularmente
                  
                  La comunicación constante es fundamental para la seguridad.`,
        author: admin._id,
        category: 'tips',
        tags: ['padres', 'seguridad', 'hijos'],
        published: true,
        publishedAt: new Date(Date.now() - 259200000), // Hace 3 días
        featured: false
      },
      {
        title: 'Tecnología en Transporte: El futuro es hoy',
        slug: 'tecnologia-transporte-futuro',
        excerpt: 'Cómo la tecnología está transformando el transporte escolar',
        content: `La tecnología GPS y las aplicaciones móviles han revolucionado la forma en que los padres pueden 
                  monitorear el transporte de sus hijos.
                  
                  Beneficios:
                  - Tranquilidad y paz mental
                  - Comunicación en tiempo real
                  - Historial de viajes
                  - Alertas de seguridad
                  
                  SchoolTrack utiliza tecnología de punta para garantizar la seguridad y comodidad.`,
        author: admin._id,
        category: 'noticias',
        tags: ['tecnologia', 'gps', 'innovacion'],
        published: true,
        publishedAt: new Date(Date.now() - 345600000), // Hace 4 días
        featured: false
      }
    ]);

    console.log('✅ 5 Blog Posts creados');

    // ============================================================
    // RESUMEN
    // ============================================================

    console.log(`
╔════════════════════════════════════════╗
║   ✅ SEED COMPLETADO EXITOSAMENTE    ║
╚════════════════════════════════════════╝

📊 DATOS CREADOS:
  ✓ 1 Admin
  ✓ 3 Conductores
  ✓ 4 Padres
  ✓ 5 Estudiantes
  ✓ 3 Vehículos (placas SJR)
  ✓ 3 Rutas (Centro, Norte, Sur)
  ✓ 12 Waypoints (4-3-3-2)
  ✓ 5 Blog Posts

📍 UBICACIÓN: San Juan del Río, Querétaro
🏫 DESTINO: Universidad Tecnológica de San Juan del Río

🔑 CREDENCIALES DE PRUEBA:
  Admin: admin@schooltrack.com / Password123!
  Driver 1: carlos.mendoza@schooltrack.com / Password123!
  Driver 2: roberto.lopez@schooltrack.com / Password123!
  Parent 1: maria.sanchez@email.com / Password123!
  
✨ Sistema listo para testing y demostración
    `);

    await mongoose.connection.close();
    console.log('✅ Conexión a BD cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedData();
