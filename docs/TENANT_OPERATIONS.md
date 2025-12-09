# Multi-Tenant Operations Guide

## Table of Contents
1. [How to Add a New Tenant](#1-how-to-add-a-new-tenant)
2. [How Subdomain-to-Database Routing Works](#2-how-subdomain-to-database-routing-works)

---

## 1. How to Add a New Tenant

### Overview
Adding a new tenant means creating a new company/organization workspace in your SaaS platform. When you add a tenant, several things happen automatically:

1. A new entry is created in the `core_client` table (in `public` schema)
2. A new PostgreSQL **schema** is automatically created (e.g., `acme_schema`)
3. All tenant-specific tables are created in that schema (projects, tasks, etc.)
4. A domain entry maps the subdomain to the tenant

### Method 1: Using Django Shell (Recommended for Development)

#### Step-by-Step Process

1. **Activate your virtual environment and start Django shell**:
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py shell
```

2. **Import the models**:
```python
from core.models import Client, Domain
```

3. **Create the tenant**:
```python
# Create the tenant (this auto-creates the database schema)
tenant = Client(
    schema_name='acme',  # Must be unique, lowercase, no spaces
    name='Acme Inc.'     # Display name
)
tenant.save()
```

**What happens when you call `tenant.save()`**:
- ✅ Django-tenants creates a PostgreSQL schema named `acme`
- ✅ Runs all migrations from `TENANT_APPS` in the new schema
- ✅ Creates tables: `acme.projects_project`, `acme.projects_task`, etc.
- ✅ The tenant is now ready to use!

4. **Create the domain mapping**:
```python
# Map a subdomain to this tenant
domain = Domain()
domain.domain = 'acme.projecthub.com'  # Or 'acme.localhost' for local testing
domain.tenant = tenant
domain.is_primary = True  # This is the main domain for this tenant
domain.save()
```

5. **Verify the tenant was created**:
```python
# List all tenants
Client.objects.all()
# Output: <QuerySet [<Client: Acme Inc.>]>

# Check the domain
Domain.objects.filter(tenant=tenant)
# Output: <QuerySet [<Domain: acme.projecthub.com>]>

# Exit shell
exit()
```

#### Complete Example (Copy-Paste Ready)

```python
from core.models import Client, Domain

# Create Globex Corp tenant
globex = Client(schema_name='globex', name='Globex Corporation')
globex.save()

# Map subdomain
globex_domain = Domain()
globex_domain.domain = 'globex.projecthub.com'
globex_domain.tenant = globex
globex_domain.is_primary = True
globex_domain.save()

print(f"✅ Tenant created: {globex.name}")
print(f"✅ Access at: https://{globex_domain.domain}")
```

### Method 2: Using a Management Command (Recommended for Production)

Create a reusable Django management command for easier tenant creation.

#### Create the Command File

**File: `backend/core/management/commands/create_tenant.py`**

First, create the directory structure:
```bash
mkdir -p backend/core/management/commands
touch backend/core/management/__init__.py
touch backend/core/management/commands/__init__.py
```

Then create the command:

```python
from django.core.management.base import BaseCommand
from core.models import Client, Domain

class Command(BaseCommand):
    help = 'Creates a new tenant with domain'

    def add_arguments(self, parser):
        parser.add_argument('schema_name', type=str, help='Unique schema name (e.g., acme)')
        parser.add_argument('name', type=str, help='Tenant display name (e.g., "Acme Inc.")')
        parser.add_argument('domain', type=str, help='Domain name (e.g., acme.projecthub.com)')

    def handle(self, *args, **options):
        schema_name = options['schema_name']
        name = options['name']
        domain_name = options['domain']

        # Validate schema name
        if not schema_name.islower() or ' ' in schema_name:
            self.stdout.write(self.style.ERROR('Schema name must be lowercase with no spaces'))
            return

        # Check if tenant already exists
        if Client.objects.filter(schema_name=schema_name).exists():
            self.stdout.write(self.style.ERROR(f'Tenant with schema "{schema_name}" already exists'))
            return

        # Create tenant
        self.stdout.write(f'Creating tenant: {name}...')
        tenant = Client(schema_name=schema_name, name=name)
        tenant.save()
        self.stdout.write(self.style.SUCCESS(f'✅ Tenant created with schema: {schema_name}'))

        # Create domain
        self.stdout.write(f'Mapping domain: {domain_name}...')
        domain = Domain()
        domain.domain = domain_name
        domain.tenant = tenant
        domain.is_primary = True
        domain.save()
        self.stdout.write(self.style.SUCCESS(f'✅ Domain mapped: {domain_name}'))

        self.stdout.write(self.style.SUCCESS(f'\n🎉 Tenant "{name}" is ready!'))
        self.stdout.write(f'   Access at: https://{domain_name}')
```

#### Usage

```bash
python manage.py create_tenant acme "Acme Inc." acme.projecthub.com
python manage.py create_tenant globex "Globex Corp." globex.projecthub.com
python manage.py create_tenant wayne "Wayne Enterprises" wayne.projecthub.com
```

### Method 3: Via API (Future Enhancement)

For a self-service SaaS, you'd create an API endpoint:

**File: `backend/core/views.py`**
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Client, Domain

class TenantViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['post'])
    def signup(self, request):
        schema_name = request.data.get('subdomain')
        name = request.data.get('company_name')
        
        # Validation
        if Client.objects.filter(schema_name=schema_name).exists():
            return Response(
                {'error': 'Subdomain already taken'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create tenant
        tenant = Client(schema_name=schema_name, name=name)
        tenant.save()
        
        # Create domain
        domain = Domain()
        domain.domain = f'{schema_name}.projecthub.com'
        domain.tenant = tenant
        domain.is_primary = True
        domain.save()
        
        return Response({
            'message': 'Tenant created successfully',
            'url': f'https://{domain.domain}'
        }, status=status.HTTP_201_CREATED)
```

### Important Considerations

1. **Schema Name Rules**:
   - ✅ Must be lowercase
   - ✅ No spaces or special characters (use `_` or `-`)
   - ✅ Must be unique
   - ✅ Should be short and memorable (used in subdomain)
   - ❌ Don't use: `public`, `information_schema`, `pg_catalog` (reserved)

2. **Auto-Creation**:
   - When `tenant.save()` is called, `django-tenants` **automatically**:
     - Executes `CREATE SCHEMA {schema_name};` in PostgreSQL
     - Runs all migrations for `TENANT_APPS`
     - Creates all tables in the new schema

3. **Deleting a Tenant**:
   ```python
   tenant = Client.objects.get(schema_name='acme')
   tenant.delete()  # This will DROP the entire schema and all data!
   ```
   **⚠️ WARNING**: This is irreversible!

---

## 2. How Subdomain-to-Database Routing Works

### The Magic Behind Multi-Tenancy

When a user visits `https://acme.projecthub.com/api/projects/`, how does Django know to query the `acme` schema instead of `globex` or `wayne`? This is handled by **django-tenants middleware**.

### File Responsible: `TenantMainMiddleware`

**Location**: Configured in `backend/projecthub/settings.py`

```python
MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',  # ⬅️ THIS LINE!
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # ... other middleware
]
```

**Why it's first**: It **MUST** run before any other middleware so it can set the correct database schema before any queries are executed.

### The Complete Flow (Step-by-Step)

#### Step 1: Request Arrives
```
User visits: https://acme.projecthub.com/api/projects/
```

#### Step 2: Nginx Receives Request
```nginx
# Nginx sees the Host header
Host: acme.projecthub.com

# Nginx proxies to Django (Gunicorn on port 8000)
proxy_pass http://127.0.0.1:8000;
proxy_set_header Host $host;  # Preserves "acme.projecthub.com"
```

#### Step 3: Gunicorn Passes to Django WSGI
```
Django receives:
  - URL: /api/projects/
  - Host: acme.projecthub.com
```

#### Step 4: TenantMainMiddleware Intercepts (THE KEY STEP)

**File**: `django_tenants.middleware.main.TenantMainMiddleware` (from the package)

**What it does**:

```python
# Simplified version of what django-tenants does:

class TenantMainMiddleware:
    def process_request(self, request):
        # 1. Extract the hostname from the request
        hostname = request.get_host()  # "acme.projecthub.com"
        
        # 2. Look up the domain in the database (public schema)
        from core.models import Domain
        try:
            domain = Domain.objects.get(domain=hostname)
            tenant = domain.tenant  # Gets the Client instance
        except Domain.DoesNotExist:
            # No tenant found, return 404 or error page
            raise Http404("Tenant not found")
        
        # 3. Set the schema for this request
        from django.db import connection
        connection.set_schema(tenant.schema_name)  # "acme"
        
        # 4. Store tenant in request for later use
        request.tenant = tenant
        
        # 5. All subsequent queries now run in the "acme" schema!
```

**Database Query Executed**:
```sql
-- Middleware executes this in the public schema:
SELECT * FROM public.core_domain WHERE domain = 'acme.projecthub.com';

-- Returns:
-- id | domain                | tenant_id
-- 1  | acme.projecthub.com   | 1

-- Then gets the tenant:
SELECT * FROM public.core_client WHERE id = 1;

-- Returns:
-- id | schema_name | name
-- 1  | acme        | Acme Inc.
```

#### Step 5: PostgreSQL Schema is Set

**Behind the scenes, Django executes**:
```sql
SET search_path TO acme, public;
```

**What this means**:
- All table queries now look in the `acme` schema first
- If a table isn't found in `acme`, it checks `public` (for shared tables)

**Example**:
```python
# In your Django view:
projects = Project.objects.all()

# Django ORM generates:
SELECT * FROM projects_project;

# But PostgreSQL interprets this as:
SELECT * FROM acme.projects_project;  # Because search_path = "acme, public"
```

#### Step 6: API Response Returns Tenant-Specific Data

```python
# View in projects/views.py
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()  # Only gets acme's projects!
    serializer_class = ProjectSerializer
```

**PostgreSQL query executed**:
```sql
-- Thanks to search_path = "acme, public"
SELECT * FROM acme.projects_project;

-- Output:
-- id | name              | description
-- 1  | Website Redesign  | New company site
-- 2  | Mobile App        | iOS app
```

**Response**:
```json
[
  {"id": 1, "name": "Website Redesign", "description": "New company site"},
  {"id": 2, "name": "Mobile App", "description": "iOS app"}
]
```

### Key Files Involved

| File | Role |
|------|------|
| **`settings.py`** | Configures `TenantMainMiddleware` and tenant settings |
| **`core/models.py`** | Defines `Client` and `Domain` models |
| **`django_tenants` package** | Provides the middleware that does the magic |
| **PostgreSQL** | Supports schema-based isolation |

### Configuration in settings.py

**File: `backend/projecthub/settings.py`**

```python
# Tell django-tenants which models to use
TENANT_MODEL = "core.Client"      # Model for tenants
TENANT_DOMAIN_MODEL = "core.Domain"  # Model for domains

# Middleware (MUST be first!)
MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',  # ⬅️ KEY
    # ... other middleware
]

# Database must use django_tenants's backend
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',  # ⬅️ Not 'django.db.backends.postgresql'
        'NAME': 'projecthub',
        # ...
    }
}

# Shared apps (tables in public schema)
SHARED_APPS = (
    'django_tenants',
    'core',  # Client and Domain models
    # ...
)

# Tenant apps (tables in each tenant's schema)
TENANT_APPS = (
    'projects',  # Project and Task models
    # ...
)
```

### Debugging: How to Verify Schema Switching

#### Method 1: Django Shell with Tenant Context

```python
from django_tenants.utils import tenant_context
from core.models import Client
from projects.models import Project

# Get the tenant
acme = Client.objects.get(schema_name='acme')

# Execute code in acme's schema context
with tenant_context(acme):
    projects = Project.objects.all()
    print(f"Acme has {projects.count()} projects")
    for project in projects:
        print(f"  - {project.name}")
```

#### Method 2: Raw SQL to Check Schema

```python
from django.db import connection

# Check current search_path
with connection.cursor() as cursor:
    cursor.execute("SHOW search_path;")
    print(cursor.fetchone())
    # Output: ('acme, public',)
```

#### Method 3: PostgreSQL CLI

```sql
-- Connect to database
psql -U postgres -d projecthub

-- List all schemas
\dn

-- Output:
--   Name   | Owner
-- ---------+--------
--   public | postgres
--   acme   | postgres
--   globex | postgres

-- View tables in acme schema
\dt acme.*

-- Output:
--   Schema |       Name        | Type  | Owner
-- --------+-------------------+-------+--------
--   acme  | projects_project  | table | postgres
--   acme  | projects_task     | table | postgres

-- Query specific schema
SELECT * FROM acme.projects_project;
```

### Visual Summary

```
┌─────────────────────────────────────────────────┐
│  User Request: acme.projecthub.com/api/projects │
└────────────────────┬────────────────────────────┘
                     │
                     ↓
         ┌───────────────────────┐
         │   TenantMainMiddleware │
         │  (django_tenants pkg)  │
         └───────────┬────────────┘
                     │
         ┌───────────┴────────────────────────────┐
         │ 1. Extract hostname from request       │
         │    hostname = "acme.projecthub.com"    │
         │                                        │
         │ 2. Query Domain table (public schema) │
         │    SELECT * FROM core_domain WHERE     │
         │    domain = 'acme.projecthub.com'      │
         │                                        │
         │ 3. Get associated tenant               │
         │    tenant = domain.tenant              │
         │    schema_name = "acme"                │
         │                                        │
         │ 4. Set PostgreSQL search_path          │
         │    SET search_path TO acme, public     │
         └────────────┬───────────────────────────┘
                     │
                     ↓
         ┌───────────────────────┐
         │   Django ORM Queries   │
         │  Project.objects.all() │
         └───────────┬────────────┘
                     │
                     ↓
         ┌───────────────────────────┐
         │  PostgreSQL Executes:     │
         │  SELECT * FROM            │
         │  acme.projects_project    │
         └───────────┬───────────────┘
                     │
                     ↓
         ┌───────────────────────────┐
         │   Returns Acme's Data     │
         │   (Globex's data is       │
         │    invisible)             │
         └───────────────────────────┘
```

---

## Summary

### Adding a Tenant
1. Create `Client` instance → Auto-creates schema
2. Create `Domain` instance → Maps subdomain to tenant
3. Done! Tenant can now access their isolated workspace

### Subdomain Routing
1. **Where**: `TenantMainMiddleware` (first in middleware stack)
2. **How**: 
   - Extracts hostname from request
   - Queries `Domain` table in `public` schema
   - Gets associated `Client` (tenant)
   - Sets PostgreSQL `search_path` to tenant's schema
3. **Result**: All queries automatically run in the correct schema

**The beauty**: Your code doesn't need to know about tenants! You write:
```python
Project.objects.all()
```

And django-tenants ensures it only returns the current tenant's projects. 🎯
