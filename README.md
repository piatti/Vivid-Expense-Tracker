# Money Tracker 🤑

**Money Tracker** es un gestor personal de finanzas ágil, moderno y 100% responsivo (Mobile-First) construido sobre Next.js (App Router), PostgreSQL (Drizzle ORM) y Supabase Auth, diseñado para ayudarte a controlar y analizar tus gastos de forma visual y sin fricciones.

---

## Características Principales

* **Visualización de Gastos Inteligente:**
  * **Vista Mensual:** Total de gastos acumulados, selector de mes interactivo y un gráfico horizontal interactivo que muestra las categorías con colores dinámicos y sus respectivos emojis.
  * **Vista Anual:** Evolución mensual mediante gráficos de barras verticales animados (Ene-Dic) e indicadores de distribución anual porcentual.
* **Flujo de Carga Ágil (Mobile Sheet Modal):**
  * Drawer/Bottom Sheet deslizante que se despliega desde abajo en pantallas móviles para cargar y editar gastos con micro-interacciones.
  * **Input con Fórmulas Aritméticas:** Soporta operaciones matemáticas simples en caliente (ej: `1500*1.21` o `250+300`) evaluadas y desinfectadas de forma segura en el Backend.
* **Categorías a tu Medida:**
  * Creación dinámica de categorías personalizadas asignando un nombre, colores aleatorios y un selector visual de emojis.
  * Eliminación de categorías personalizadas manejando de forma segura la cascada de gastos asociados.
* **Detalle de Categoría y Ordenamiento:**
  * Vista dedicada para cada categoría con ordenamiento reactivo por Fecha (asc/desc), Monto (asc/desc) o Concepto (A-Z).
* **Exportador de Datos:**
  * Descarga directa de todo tu historial de gastos a un archivo CSV estructurado compatible con Excel y Google Sheets.
* **Aislamiento Multiusuario Seguro:**
  * Integración con Supabase Auth para garantizar la privacidad y el aislamiento absoluto de los datos de cada cuenta de usuario.

---

## Stack Tecnológico

* **Core:** Next.js 16 (App Router)
* **Base de Datos:** PostgreSQL
* **ORM:** Drizzle ORM
* **Autenticación:** Supabase Auth (`@supabase/ssr`)
* **Diseño y Estilo:** TailwindCSS v3 + Shadcn UI + Radix
* **Animaciones:** Framer Motion
* **Iconos:** Lucide React

---

## Configuración y Desarrollo Local

### Requisitos Previos
* Node.js (v18+) e `npm`.
* Docker y Docker Compose (o Colima en macOS) para la base de datos local.
* Un proyecto gratuito en [Supabase.com](https://supabase.com) (para la autenticación).

### Paso 1: Configurar Variables de Entorno
Copia el archivo `.env.example` como `.env` en la raíz de tu proyecto:
```bash
cp .env.example .env
```
Abre `.env` y coloca tus claves de **Supabase en la nube** (necesarias para el login en desarrollo):
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-real-de-supabase
DATABASE_URL=postgresql://devuser:devpass@localhost:5432/shipfreedev
```
*(Nota: Mantén `DATABASE_URL` apuntando a `localhost:5432` para usar la base de datos local en Docker).*

### Paso 2: Levantar Postgres en Docker
Inicia el contenedor de Postgres local:
```bash
docker-compose -f docker/dev/docker-compose.postgres.yml up -d postgres
```

### Paso 3: Sincronizar Base de Datos y Poblado (Seed)
Aplica la estructura de tablas a tu Postgres local e inicializa las categorías globales por defecto:
```bash
npm run db:push
npm run db:seed
```

### Paso 4: Ejecutar Servidor Local
Lanza la aplicación localmente en modo desarrollo con soporte Turbopack:
```bash
npm run dev
```
Entra en **[http://localhost:3000](http://localhost:3000)** en tu navegador. Para ver tu panel de gastos ve directamente a **[http://localhost:3000/gastos](http://localhost:3000/gastos)**.

---

## Despliegue en Producción (Vercel)

1. Conecta tu repositorio de GitHub a tu cuenta de **Vercel**.
2. En la configuración del proyecto en Vercel, agrega las siguientes **Variables de Entorno**:
   * `NEXT_PUBLIC_SUPABASE_URL` (Tu URL de proyecto de Supabase)
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Tu anon key de Supabase)
   * `DATABASE_URL` (La cadena de conexión de producción obtenida en *Supabase settings -> Database -> Connection Strings (URI - Transaction pooler)* replacing the password placeholder).
3. Vercel desplegará tu app en vivo de manera nativa.
4. Para inicializar la base de datos de producción con el esquema y categorías por defecto, cambia temporalmente tu `.env` local para apuntar a la base de datos de producción y ejecuta una única vez:
   ```bash
   npm run db:push
   npm run db:seed
   ```
