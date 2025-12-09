# Project Overview: Multi-Tenant SaaS Project Hub

## 🎯 What Is This Project?

**Project Hub** is a **multi-tenant SaaS (Software as a Service) platform** designed to manage projects and tasks for multiple companies/organizations, all running on a single codebase and shared infrastructure.

### Real-World Example

Imagine you're building a project management tool like **Asana** or **Trello**, but you want to sell it to different companies:

- **Acme Inc.** uses your platform at `acme.projecthub.com`
- **Globex Corp.** uses it at `globex.projecthub.com`
- **Wayne Enterprises** uses it at `wayne.projecthub.com`

**Key Requirement**: Each company's data must be **completely isolated**. Acme should never see Globex's projects, and vice versa.

### How Multi-Tenancy Works

Instead of deploying a separate instance for each customer (expensive and hard to maintain), this project uses **schema-based multi-tenancy**:

1. **Single Application**: One Django backend and React frontend serve all customers
2. **Single Database Server**: One PostgreSQL instance hosts all data
3. **Separate Schemas**: Each tenant gets their own database schema (like a private workspace)
4. **Subdomain Routing**: The subdomain (`acme.projecthub.com`) identifies which tenant is accessing the app

```
Request: https://acme.projecthub.com/api/projects/
   ↓
Nginx: Sees "acme" subdomain
   ↓
Django Middleware: Looks up "acme" in Domain table
   ↓
Database: Switches to "acme_schema"
   ↓
Response: Returns ONLY projects from acme_schema (100% isolated)
```

---

## 🏗️ Project Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
│  acme.projecthub.com    globex.projecthub.com               │
└────────────────────────┬────────────────────────────────────┘
                         │
                    [DNS / GoDaddy]
                         │
                         ↓
        ┌────────────────────────────────┐
        │      Nginx (Reverse Proxy)     │
        │   - Wildcard subdomain routing │
        │   - SSL/TLS termination        │
        │   - Static file serving        │
        └───────────┬────────────────────┘
                    │
        ┌───────────┴──────────────┐
        │                          │
   [API Requests]          [Static Files]
        │                          │
        ↓                          ↓
┌───────────────┐         ┌──────────────┐
│   Gunicorn    │         │    React     │
│   (WSGI)      │         │  (Frontend)  │
└───────┬───────┘         └──────────────┘
        │
        ↓
┌───────────────────────────────────┐
│       Django Backend              │
│  - django-tenants middleware      │
│  - REST API (DRF)                 │
│  - Multi-tenant routing           │
└──────────────┬────────────────────┘
               │
               ↓
    ┌──────────────────────┐
    │   PostgreSQL (RDS)   │
    │                      │
    │  ┌─────────────────┐ │
    │  │ public schema   │ │  ← Shared: Tenants, Domains
    │  └─────────────────┘ │
    │  ┌─────────────────┐ │
    │  │ acme_schema     │ │  ← Isolated: Acme's Projects/Tasks
    │  └─────────────────┘ │
    │  ┌─────────────────┐ │
    │  │ globex_schema   │ │  ← Isolated: Globex's Projects/Tasks
    │  └─────────────────┘ │
    └──────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Backend** | Django 5.2.8 | Web framework |
| **Multi-Tenancy** | django-tenants 3.7.0 | Schema-based isolation |
| **API** | Django REST Framework 3.15.2 | RESTful API |
| **Database** | PostgreSQL 14+ | Relational database with schema support |
| **Frontend** | React 18 + Vite | Modern UI framework |
| **Routing** | React Router DOM | Client-side navigation |
| **Styling** | Vanilla CSS (utility classes) | Lightweight, custom design system |
| **Icons** | Lucide React | Modern icon library |
| **Server** | Gunicorn | Production WSGI server |
| **Reverse Proxy** | Nginx | Load balancing, SSL, static files |
| **Database Driver** | psycopg2 | PostgreSQL adapter for Python |

---

## 📁 Project Structure

```
website-evnt/
│
├── backend/                      # Django Backend
│   ├── core/                     # Shared/Tenant management app
│   │   ├── models.py            # Client (Tenant) and Domain models
│   │   ├── admin.py             # Django admin configuration
│   │   └── migrations/          # Database migrations for core
│   │
│   ├── projects/                 # Tenant-specific app
│   │   ├── models.py            # Project and Task models
│   │   ├── views.py             # API ViewSets (DRF)
│   │   ├── serializers.py       # DRF serializers
│   │   └── migrations/          # Database migrations for projects
│   │
│   ├── projecthub/              # Django project configuration
│   │   ├── settings.py          # Main settings (CRITICAL)
│   │   ├── urls.py              # API routing
│   │   ├── wsgi.py              # WSGI entry point for Gunicorn
│   │   └── asgi.py              # ASGI entry point (for async)
│   │
│   ├── venv/                    # Python virtual environment
│   ├── manage.py                # Django management script
│   ├── requirements.txt         # Python dependencies
│   ├── create_tenant.py         # Script to create public tenant
│   └── README.md                # Backend setup instructions
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── pages/               # Page components
│   │   │   ├── Home.jsx         # Landing page
│   │   │   ├── Login.jsx        # Workspace login
│   │   │   └── Dashboard.jsx   # Tenant dashboard
│   │   │
│   │   ├── components/          # Reusable components (empty for now)
│   │   ├── App.jsx              # Main app with routing
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles and utility classes
│   │
│   ├── public/                  # Static assets
│   ├── dist/                    # Production build (generated)
│   ├── package.json             # NPM dependencies and scripts
│   ├── vite.config.js           # Vite configuration
│   └── index.html               # HTML entry point
│
├── Documentation Files
│   ├── README.md                # Project overview
│   ├── GETTING_STARTED.md       # Quick start guide
│   ├── DEPLOY_LOCAL.md          # Local development setup
│   ├── DEPLOY_AWS.md            # AWS production deployment
│   └── SETUP_GODADDY.md         # DNS configuration
│
└── Utility Scripts
    └── create_db.py             # Script to create PostgreSQL database
```

---

## 📄 File Significance Breakdown

### Backend Files

#### 🔧 **Configuration Files**

**`backend/projecthub/settings.py`** ⭐ MOST IMPORTANT
- **Purpose**: Django configuration (database, apps, middleware, security)
- **Why Critical**: 
  - Configures `django-tenants` with `SHARED_APPS` and `TENANT_APPS`
  - Sets up PostgreSQL connection with schema routing
  - Defines CORS, security, and allowed hosts
  - **If this is wrong, nothing works**

**`backend/requirements.txt`**
- **Purpose**: Lists all Python dependencies
- **Why Needed**: Ensures consistent environment across dev/staging/prod
- **Contains**: Django, django-tenants, DRF, psycopg2, gunicorn, etc.

**`backend/projecthub/urls.py`**
- **Purpose**: API routing configuration
- **Why Needed**: Maps URLs (like `/api/projects/`) to view functions
- **Uses**: Django REST Framework's `DefaultRouter`

**`backend/projecthub/wsgi.py`**
- **Purpose**: WSGI application entry point
- **Why Needed**: Gunicorn uses this to run Django in production
- **Production**: `gunicorn projecthub.wsgi:application`

#### 📊 **Data Models**

**`backend/core/models.py`** ⭐ CRITICAL FOR MULTI-TENANCY
```python
class Client(TenantMixin):  # Represents a company/tenant
    name = models.CharField(max_length=100)
    # Inherited: schema_name, created_on, etc.

class Domain(DomainMixin):  # Maps subdomain to tenant
    # domain = 'acme.projecthub.com'
    # tenant = <Client instance>
```
- **Purpose**: Defines tenants and their domains
- **Why Critical**: `django-tenants` uses these to route requests
- **Storage**: Lives in the `public` schema (shared across all tenants)

**`backend/projects/models.py`** (Tenant-Specific)
```python
class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()

class Task(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False)
```
- **Purpose**: Core business logic (projects and tasks)
- **Why Isolated**: Each tenant's projects live in their own schema
- **Example**: Acme's projects are in `acme_schema.projects_project`

#### 🔌 **API Layer**

**`backend/projects/serializers.py`**
- **Purpose**: Converts Django models to JSON (and vice versa)
- **Why Needed**: DRF uses serializers for API requests/responses
- **Example**: `ProjectSerializer` → `{"id": 1, "name": "Website Redesign"}`

**`backend/projects/views.py`**
```python
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()  # Auto-filtered to current tenant
    serializer_class = ProjectSerializer
```
- **Purpose**: Handles API requests (GET, POST, PUT, DELETE)
- **Why Automatic Filtering**: `django-tenants` middleware sets the schema
- **Endpoints**: `/api/projects/`, `/api/tasks/`

#### 🛠️ **Utility Scripts**

**`backend/create_tenant.py`**
- **Purpose**: Creates the "public" tenant (required by django-tenants)
- **When Used**: After initial migrations
- **Why Needed**: The app won't work without at least one tenant

**`create_db.py`** (Root Directory)
- **Purpose**: Creates the PostgreSQL database programmatically
- **Why Useful**: Alternative to `createdb` command
- **When Used**: Initial setup when psql isn't in PATH

**`backend/manage.py`**
- **Purpose**: Django's command-line utility
- **Common Uses**: 
  - `python manage.py runserver` (dev server)
  - `python manage.py migrate_schemas` (run migrations)
  - `python manage.py shell` (interactive Python)

---

### Frontend Files

#### ⚛️ **React Components**

**`frontend/src/App.jsx`**
- **Purpose**: Main application component with routing
- **Routes**:
  - `/` → Home (landing page)
  - `/login` → Login/Workspace selector
  - `/dashboard/*` → Dashboard with nested routes

**`frontend/src/pages/Home.jsx`**
- **Purpose**: Marketing/landing page
- **Features**: Hero section, feature cards, call-to-action

**`frontend/src/pages/Login.jsx`**
- **Purpose**: Workspace selection (subdomain input)
- **Flow**: User enters "acme" → Redirects to `acme.localhost:5173`

**`frontend/src/pages/Dashboard.jsx`**
- **Purpose**: Main tenant dashboard
- **Features**: Sidebar, project list, stats overview
- **Nested Routes**: `/dashboard`, `/dashboard/projects`, `/dashboard/settings`

#### 🎨 **Styling**

**`frontend/src/index.css`** ⭐ DESIGN SYSTEM
- **Purpose**: Global styles and utility classes
- **Contains**:
  - CSS variables (colors, fonts, spacing)
  - Utility classes (Tailwind-like: `.flex`, `.text-xl`, `.bg-gray-800`)
  - Component classes (`.btn`, `.card`)
- **Why Vanilla CSS**: Lightweight, no build dependencies, full control

#### 📦 **Configuration**

**`frontend/package.json`**
- **Purpose**: NPM dependencies and scripts
- **Scripts**:
  - `npm run dev` → Start Vite dev server
  - `npm run build` → Build for production
- **Dependencies**: React, React Router, Axios, Lucide, etc.

**`frontend/vite.config.js`**
- **Purpose**: Vite build tool configuration
- **Why Vite**: Faster than Webpack, modern tooling

**`frontend/index.html`**
- **Purpose**: HTML entry point
- **Contains**: Root div (`<div id="root">`) where React mounts

---

## 🔑 Key Concepts Explained

### 1. **Schema-Based Multi-Tenancy**

**Traditional Approach (Inefficient)**:
```
Database 1: acme_db       → Separate server/instance
Database 2: globex_db     → Separate server/instance
Database 3: wayne_db      → Separate server/instance
```
**Cost**: 3x servers, 3x maintenance, 3x backups

**Our Approach (Efficient)**:
```
Single PostgreSQL Server
  ├── public schema (shared: tenants, domains)
  ├── acme_schema (isolated: acme's data)
  ├── globex_schema (isolated: globex's data)
  └── wayne_schema (isolated: wayne's data)
```
**Benefit**: 1 server, 1 codebase, automatic isolation

### 2. **How Requests Are Routed**

```
1. User visits: https://acme.projecthub.com/api/projects/
2. DNS resolves: acme.projecthub.com → EC2 IP (54.123.45.67)
3. Nginx receives request: Sees Host header "acme.projecthub.com"
4. Nginx proxies to Django: Forwards request with Host header
5. Django-Tenants Middleware:
   - Extracts domain: "acme.projecthub.com"
   - Queries: Domain.objects.get(domain="acme.projecthub.com")
   - Finds: tenant = Client(schema_name="acme")
   - Sets: PostgreSQL search_path = "acme, public"
6. Django ORM:
   - Query: Project.objects.all()
   - Executes: SELECT * FROM acme.projects_project
   - Returns: ONLY acme's projects (globex's are invisible)
```

### 3. **SHARED_APPS vs TENANT_APPS**

**`SHARED_APPS`** (in `settings.py`):
- Apps that install tables in the `public` schema
- Examples: `core` (tenants/domains), `django.contrib.auth`
- **Shared by all tenants**

**`TENANT_APPS`** (in `settings.py`):
- Apps that install tables in each tenant's schema
- Examples: `projects` (projects/tasks)
- **Isolated per tenant**

**Migration Commands**:
- `python manage.py migrate_schemas --shared` → Creates public schema tables
- `python manage.py migrate_schemas` → Creates tenant-specific tables in ALL schemas

---

## 🚀 Why Each File Matters

### Backend

| File | Without It... |
|------|---------------|
| `settings.py` | The app wouldn't know how to connect to the database or which apps to load |
| `core/models.py` | No way to create or identify tenants |
| `projects/models.py` | No data structure for projects/tasks |
| `projecthub/urls.py` | API endpoints wouldn't exist |
| `requirements.txt` | Missing dependencies, app won't run |
| `create_tenant.py` | Can't create the required public tenant |

### Frontend

| File | Without It... |
|------|---------------|
| `App.jsx` | No routing, all pages would be inaccessible |
| `index.css` | No styling, app would look broken |
| `pages/Home.jsx` | No landing page to attract users |
| `pages/Login.jsx` | No way to select a workspace |
| `pages/Dashboard.jsx` | No interface to manage projects |
| `package.json` | Can't install dependencies or run dev server |

### Documentation

| File | Purpose |
|------|---------|
| `GETTING_STARTED.md` | Quick start for first-time setup |
| `DEPLOY_LOCAL.md` | Complete local development guide |
| `DEPLOY_AWS.md` | Production deployment on AWS |
| `SETUP_GODADDY.md` | DNS configuration for subdomains |

---

## 💡 Summary

**This project is**:
- A **multi-tenant SaaS** platform for project management
- Uses **Django + PostgreSQL** for backend with schema-based isolation
- Uses **React + Vite** for a modern, responsive frontend
- Supports **unlimited tenants** on a single codebase
- Routes tenants via **subdomains** (acme.yourdomain.com)

**The file structure is organized to**:
- Separate **frontend** and **backend** concerns
- Distinguish **shared** (all tenants) from **tenant-specific** (isolated) data
- Provide clear **documentation** for deployment and setup
- Follow Django and React **best practices**

**Every file has a purpose**:
- Configuration files set up the environment
- Model files define data structures
- View/Serializer files handle API logic
- Frontend files create the user interface
- Scripts automate common tasks
- Documentation guides deployment

This architecture is production-ready, scalable, and follows SaaS industry standards! 🎯
