# Guía de Contribución para SchoolTrack 🚌

¡Gracias por tu interés en contribuir a **SchoolTrack**! Este proyecto es un esfuerzo impulsado por la comunidad y valoramos todas las contribuciones, desde el reporte de bugs hasta la implementación de nuevas funcionalidades.

Para mantener la calidad y consistencia del código en este repositorio, te pedimos que sigas estas directrices.

---

## 🛠 Entorno de Desarrollo

### Prerrequisitos
Asegúrate de tener instalado en tu sistema local:
- **Node.js** (v18.0 o superior)
- **MongoDB** (v6.0 o superior local, o una instancia en MongoDB Atlas)
- **Docker & Docker Compose** (Opcional, pero recomendado para aislar el entorno)

### Levantar el Proyecto Localmente

1. **Haz un fork** del repositorio y clónalo en tu máquina.
   ```bash
   git clone https://github.com/TU-USUARIO/SchoolTrack.git
   cd SchoolTrack
   ```

2. **Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configura las variables de entorno en .env, especialmente tu URI de MongoDB
   npm run dev
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run serve
   ```

---

## 🏗 Flujo de Trabajo (Git Workflow)

Utilizamos el flujo de trabajo de *Feature Branch*.

1. **Sincroniza** tu rama `main` con el repositorio original (Upstream).
2. **Crea una nueva rama** para tu trabajo a partir de `main`:
   ```bash
   git checkout -b feature/nombre-de-tu-funcionalidad
   # o
   git checkout -b fix/descripcion-del-bug
   ```
3. Realiza tus cambios y haz commits descriptivos.

---

## 📝 Convención de Commits

Este proyecto sigue la convención [Conventional Commits](https://www.conventionalcommits.org/). Todos los mensajes de commit deben seguir este formato:

```
<tipo>[ámbito opcional]: <descripción>
```

**Tipos permitidos**:
- `feat`: Una nueva característica.
- `fix`: Corrección de un bug.
- `docs`: Cambios exclusivos en la documentación.
- `style`: Cambios que no afectan el significado del código (espacios, formateo, comas, etc).
- `refactor`: Un cambio en el código que ni corrige un bug ni añade una característica.
- `perf`: Un cambio en el código que mejora el rendimiento.
- `test`: Añadir tests faltantes o corregir tests existentes.
- `chore`: Cambios en el proceso de build, herramientas auxiliares o librerías externas.

**Ejemplos**:
- `feat(auth): implementar doble validación con JWT`
- `fix(routes): corregir error de renderizado del mapa geoespacial`
- `docs: actualizar guía de instalación en README`

---

## 🧪 Pruebas (Testing)

El proyecto cuenta con suites de pruebas usando **Jest**. Antes de enviar un Pull Request, asegúrate de que todos los tests pasan y, si añadiste una funcionalidad nueva, por favor escribe pruebas para la misma.

```bash
# En el backend
npm test

# O individualmente:
npm run test:auth
npm run test:students
npm run test:vehicles
npm run test:routes
npm run test:websockets
```

No aceptaremos Pull Requests que disminuyan drásticamente la cobertura (Coverage) del proyecto ni que rompan tests existentes.

---

## 🚀 Creando un Pull Request (PR)

Cuando tu código esté listo:

1. **Sube tus ramas** a tu fork en GitHub:
   ```bash
   git push origin mi-nueva-rama
   ```
2. Ve al repositorio original y haz clic en **New Pull Request**.
3. Rellena la plantilla de PR. Explica claramente:
   - **Qué** problema resuelve o **qué** funcionalidad agrega.
   - **Cómo** fue probado.
   - Cualquier dependencia nueva añadida.
4. Espera el review de un mantenedor. Podemos sugerirte algunos cambios para mantener la integridad del código. ¡No te desanimes, todo feedback es para mejorar!

---

## 🐛 Reporte de Bugs

Si encuentras un error y no puedes corregirlo tú mismo, por favor crea un **Issue** en GitHub:

1. Utiliza un título claro y descriptivo.
2. Incluye los pasos exactos para reproducir el problema.
3. Menciona el comportamiento esperado vs el comportamiento actual.
4. Incluye fragmentos de logs (utilizando Winston si es el backend) o capturas de consola del navegador si corresponde.

¡Gracias de nuevo por tu ayuda haciendo de SchoolTrack una mejor herramienta! ❤️
