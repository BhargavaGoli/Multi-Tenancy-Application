# Local Deployment Guide

This guide covers how to run the SaaS Project Hub locally for development.

## Prerequisites

1.  **Python 3.10+** installed
2.  **Node.js 18+** and **npm** installed
3.  **PostgreSQL 14+** installed and running

## Step-by-Step Setup

### 1. Database Setup

#### Start PostgreSQL
Ensure your PostgreSQL server is running on `localhost:5432`.

**Windows**: 
- PostgreSQL should auto-start as a service
- Check: Services → "postgresql-x64-14" should be "Running"
- Or use pgAdmin to verify connection

**Mac**: 
```bash
brew services start postgresql@14
```

**Linux**: 
```bash
sudo systemctl start postgresql
```

#### Create the Database
You have several options:

**Option A: Using SQL Client (Recommended for Windows)**

If you have **pgAdmin** (installed with PostgreSQL):
1. Open pgAdmin
2. Connect to PostgreSQL server
3. Right-click "Databases" → "Create" → "Database..."
4. Name: `projecthub`
5. Owner: `postgres`
6. Click "Save"

**Option B: Using psql command line** (if psql is in your PATH)
```bash
createdb projecthub
```

**Option C: Using the provided Python script**
1. First, update credentials in `backend/create_db.py` (line 13)
   - Change `password='password'` to your actual PostgreSQL password
2. Run the script:
   ```bash
   cd backend
   python create_db.py
   ```

**Note**: If Option C fails with "connection refused", use Option A (pgAdmin) instead.

### 2. Backend Setup (Django)

#### Navigate to Backend Directory
```bash
cd backend
```

#### Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

This installs:
- Django 5.2.8
- django-tenants 3.7.0
- psycopg2-binary 2.9.10
- djangorestframework 3.15.2
- django-cors-headers 4.6.0
- gunicorn 23.0.0

#### Configure Database Credentials

**IMPORTANT**: Update `projecthub/settings.py` with your PostgreSQL credentials.

Open `backend/projecthub/settings.py` and find the `DATABASES` section (around line 90):

```python
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': 'projecthub',
        'USER': 'postgres',          # Update if different
        'PASSWORD': 'YOUR_PASSWORD',  # ⚠️ CHANGE THIS!
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

#### Run Migrations

This creates the schema structure in PostgreSQL:

```bash
# Create shared schema tables (Tenant, Domain, etc.)
python manage.py migrate_schemas --shared
```

#### Create the Public Tenant

The public tenant is **required** for django-tenants to work:

```bash
python create_tenant.py
```

You should see: `"Public tenant and domain created successfully."`

#### (Optional) Create Test Tenants

Create tenant workspaces for testing multi-tenancy:

```bash
python manage.py shell
```

Then in the shell:

```python
from core.models import Client, Domain

# Create Acme Inc. tenant
acme = Client(schema_name='acme', name='Acme Inc.')
acme.save()  # This auto-creates the 'acme' schema

acme_domain = Domain()
acme_domain.domain = 'acme.localhost'
acme_domain.tenant = acme
acme_domain.is_primary = True
acme_domain.save()

# Create Globex Corp. tenant
globex = Client(schema_name='globex', name='Globex Corp.')
globex.save()

globex_domain = Domain()
globex_domain.domain = 'globex.localhost'
globex_domain.tenant = globex
globex_domain.is_primary = True
globex_domain.save()

exit()
```

#### Run the Django Development Server

```bash
python manage.py runserver
```

The backend API will be available at **`http://localhost:8000`**

**Test it**: Open http://localhost:8000/api/ in your browser.

---

### 3. Frontend Setup (React/Vite)

Open a **new terminal** (keep the backend running).

#### Navigate to Frontend Directory
```bash
cd frontend
```

#### Install Dependencies
```bash
npm install
```

This installs:
- React 18
- React Router DOM
- Axios (for API calls)
- Lucide React (icons)
- Framer Motion (animations)

#### Run the Development Server
```bash
npm run dev
```

The frontend will be available at **`http://localhost:5173`**

---

### 4. Testing Multi-Tenancy Locally

By default, browsers don't route subdomains of `localhost` properly. You have two options:

#### Option A: Use `.localhost` (Recommended - Chrome/Firefox support this natively)

Access your tenants using:
- **Public/Main**: http://localhost:5173
- **Acme**: http://acme.localhost:5173
- **Globex**: http://globex.localhost:5173

Modern browsers automatically resolve `*.localhost` to `127.0.0.1`.

#### Option B: Edit Hosts File (For custom domains)

If you want to use custom local domains like `projecthub.local`:

**Windows**: `C:\Windows\System32\drivers\etc\hosts`  
**Mac/Linux**: `/etc/hosts`

Add these lines:
```
127.0.0.1   projecthub.local
127.0.0.1   acme.projecthub.local
127.0.0.1   globex.projecthub.local
```

Then update:
1. **Django `ALLOWED_HOSTS`** (in `settings.py`): Add `.projecthub.local`
2. **Tenant Domains** (in Django shell): Change domains to `acme.projecthub.local`, etc.

---

## 5. Verify Everything Works

### Test Backend API
```bash
# List all projects (should be empty initially)
curl http://localhost:8000/api/projects/

# Create a project (will be in the current tenant's schema)
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "My first project"}'
```

### Test Frontend
1. Open http://localhost:5173
2. You should see the **Landing Page** with "Manage Projects. Isolated & Secure."
3. Click **"Log In"** → Enter a workspace name (e.g., `acme`) → **Continue**
4. You'll be redirected to the dashboard

---

## 6. Development Workflow

### Backend Changes
- Code changes auto-reload (Django's dev server)
- After model changes:
  ```bash
  python manage.py makemigrations
  python manage.py migrate_schemas
  ```

### Frontend Changes
- Vite auto-reloads on save
- Build for production:
  ```bash
  npm run build
  ```

---

## Troubleshooting

### Database Connection Errors
- **Error**: `FATAL: password authentication failed`
  - **Fix**: Update `PASSWORD` in `settings.py`
- **Error**: `database "projecthub" does not exist`
  - **Fix**: Run `createdb projecthub`

### Port Already in Use
- **Backend (8000)**: Stop other Django servers or use `python manage.py runserver 8001`
- **Frontend (5173)**: Vite will auto-increment to 5174

### Subdomain Not Working
- Use `*.localhost` domains (e.g., `acme.localhost:5173`)
- Or edit hosts file as described above

### CORS Errors
- Ensure `django-cors-headers` is installed
- Check `CORS_ALLOWED_ORIGINS` in `settings.py` includes `http://localhost:5173`

---

## Next Steps

Once local development is working:
1. **Add Authentication**: Implement user login/registration
2. **Extend Models**: Add more features to Projects/Tasks
3. **Build UI**: Create more pages and components
4. **Deploy**: Follow `DEPLOY_AWS.md` for production deployment

---

**Happy Coding! 🚀**
