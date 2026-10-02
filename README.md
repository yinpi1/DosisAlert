# DosisAlert - Farmacia Personal Digital 💊

> **Proyecto Universitario de 2do Año - Ingeniería de Software**  
> MVP para el registro de medicamentos, control de inventario/stock y recordatorios automatizados de tomas con alertas de reposición.

---

## 🚀 Tecnologías Utilizadas

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript).
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) (Diseño clínico accesible, alto contraste y botones grandes para UX de salud).
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) (Corriendo en `localhost:5432`, estructurado para migración directa a [Neon](https://neon.tech/) Serverless).
- **ORM**: [Prisma ORM](https://www.prisma.io/) (Esquema relacional estricto con claves foráneas, índices y migraciones).
- **Iconografía**: [Lucide React](https://lucide.dev/).

---

## 🏛️ Arquitectura de Base de Datos (7 Entidades Principales)

El sistema implementa estrictamente las 7 entidades del modelo Entidad-Relación:

1. **Usuario**: `id`, `rut`, `correo`, `contrasena`, `nombre`.
2. **Medicamento**: `id`, `usuarioId`, `nombre`, `presentacion`, `cantidadDisponible`, `cantidadMinima`, `estado`.
3. **HorarioToma**: `id`, `usuarioId`, `medicamentoId`, `diasToma`, `hora`, `dosis`, `estado`.
4. **Recordatorio**: `id`, `usuarioId`, `medicamentoId`, `horarioTomaId`, `fechaProgramada`, `horaProgramada`, `estado`.
5. **Toma**: `id`, `usuarioId`, `medicamentoId`, `recordatorioId`, `fechaConfirmacion`, `horaConfirmacion`, `cantidadTomada`.
6. **AlertaReposicion**: `id`, `usuarioId`, `medicamentoId`, `fechaGenerada`, `horaGenerada`, `cantidadRestante`, `estado`.
7. **Reporte**: `id`, `usuarioId`, `fechaReporte`, `totalMedicamentos`, `cantidadPorReponer`.

---

## ⚙️ Reglas Críticas de Negocio Implementadas

1. **Cálculo Automático del Estado del Medicamento**:
   - El usuario **no** ingresa el estado manualmente. El sistema lo calcula en base a la relación entre stock disponible y umbral mínimo:
     - `Disponibles > Mínima` $\rightarrow$ **"Disponible"** (Badge Verde)
     - `Disponibles <= Mínima y > 0` $\rightarrow$ **"Pocas unidades"** (Badge Ámbar)
     - `Disponibles == 0` $\rightarrow$ **"Agotado"** (Badge Rojo)

2. **Mantenedor de Medicamentos (CRUD Dividido)**:
   - **Izquierda**: Tabla interactiva con stock, presentación, alerta mínima, estado y acciones (**Ver detalle**, **Editar**, **Eliminar** con modal de confirmación).
   - **Derecha**: Formulario para agregar y editar con cálculo reactivo en tiempo real del estado.

3. **Búsqueda y Filtros**:
   - Búsqueda en vivo por nombre y filtro por estado del medicamento.

4. **Reportes y Auditoría con Alerta Automática**:
   - Tabla completa con columna especial de **Reposición** (*Reponer* / *No requiere*).
   - Resumen inferior con **Total de medicamentos** y **Requieren reposición**.
   - **Modal/Alerta automática**: Al entrar a la vista, si existen medicamentos con estado *Pocas unidades* o *Agotado*, se dispara un modal informando la cantidad exacta que requiere reposición.

5. **Transacción Crítica de Tomas (Alarma y Descuento de Stock)**:
   - Vista de alarma con nombre, hora, dosis a tomar y disponibles.
   - Botón **"Ya lo tomé"**: Descuenta atómicamente la dosis de la cantidad disponible en PostgreSQL y registra la toma.
   - Muestra pantalla de confirmación con **Cantidad anterior**, **Dosis registrada** y **Cantidad restante**.
   - Si la cantidad restante cae a nivel de alerta mínima ($\le$ mínima), despliega visualmente una advertencia destacada de **"Pocas unidades disponibles"**.

---

## 🛠️ Instalación y Ejecución Local

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/yinpi1/dosisalert.git
cd dosisalert
npm install
```

### 2. Configurar Base de Datos PostgreSQL
Copia el archivo de variables de entorno:
```bash
cp .env.example .env
```
Asegúrate de que PostgreSQL esté corriendo en `localhost:5432` y que tu archivo `.env` apunte a tu base de datos:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dosisalert_db?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/dosisalert_db?schema=public"
```

### 3. Ejecutar Migraciones y Generar Prisma Client
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Despliegue en Vercel con Neon (PostgreSQL en la Nube)

1. En [Neon.tech](https://neon.tech), crea una base de datos PostgreSQL Serverless gratuita.
2. En el panel de **Vercel**, conecta este repositorio de GitHub.
3. Configura las variables de entorno en Vercel:
   - `DATABASE_URL`: URL del Connection Pooler de Neon.
   - `DIRECT_URL`: URL de conexión directa de Neon.
4. En el build command de Vercel se ejecutará: `npx prisma generate && next build`.

---

## 👨‍💻 Autor
Proyecto desarrollado por **yinpi1** (Jean) para la carrera de Ingeniería de Software.
