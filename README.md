# ProjectHub - Multi-Tenant SaaS Platform

A production-ready multi-tenant project management SaaS platform built with Django (backend), React (frontend), and PostgreSQL (database with schema-based isolation).

## 🚀 Features

- **Multi-Tenancy**: Schema-based isolation using django-tenants
- **Self-Service Signup**: Users can create their own workspaces
- **Subdomain Routing**: Each tenant gets their own subdomain (e.g., `acme.projecthub.com`)
- **REST API**: Full-featured API with Django REST Framework
- **Interactive API Docs**: Swagger UI and ReDoc
- **Modern UI**: React 18 with Vite, responsive dark theme
- **Production Ready**: Configured for AWS deployment with Nginx, Gunicorn, RDS

## 📁 Project Structure

```
website-evnt/
├── backend/              # Django backend
│   ├── core/            # Tenant models (Client, Domain)
│   ├── projects/        # Project & Task models
│   ├── projecthub/      # Django project settings
│   └── manage.py
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── pages/      # Home, Login, Signup, Dashboard
│   │   ├── components/ # Reusable components
│   │   └── index.css   # Design system
│   └── package.json
│
├── docs/                # Documentation
│   ├── GETTING_STARTED.md
│   ├── DEPLOY_LOCAL.md
│   ├── DEPLOY_AWS.md
│   ├── PROJECT_OVERVIEW.md
│   ├── TENANT_OPERATIONS.md
│   ├── SIGNUP_FEATURE.md
│   └── SWAGGER_DOCS.md
│
└── README.md            # This file
```

## 🛠️ Tech Stack

### Backend
- **Django 5.2.8**: Web framework
- **django-tenants 3.7.0**: Multi-tenancy support
- **Django REST Framework**: API
- **PostgreSQL**: Database with schema isolation
- **drf-spectacular**: OpenAPI/Swagger docs

### Frontend
- **React 18**: UI library
- **Vite**: Build tool
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Lucide React**: Icons

### Infrastructure
- **Nginx**: Reverse proxy
- **Gunicorn**: WSGI server
- **AWS EC2 + RDS**: Hosting
- **Let's Encrypt**: SSL certificates

## 🎯 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Setup

```bash
git clone <repository-url>
cd website-evnt
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create database (if not already created via pgAdmin)
python create_db.py  # Optional: Update password in script first

# Update database credentials in projecthub/settings.py
# Then run migrations
python manage.py migrate_schemas --shared
python create_tenant.py

# Start server
python manage.py runserver
```

**Backend available at**: `http://localhost:8000`  
**API Docs**: `http://localhost:8000/api/docs/`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend available at**: `http://localhost:5173`

## 📚 Documentation

All documentation is in the `docs/` folder:

| Document | Description |
|----------|-------------|
| **GETTING_STARTED.md** | Quick setup guide and next steps |
| **DEPLOY_LOCAL.md** | Complete local development setup |
| **DEPLOY_AWS.md** | Step-by-step AWS production deployment |
| **PROJECT_OVERVIEW.md** | Architecture, file structure, concepts |
| **TENANT_OPERATIONS.md** | How to create tenants and routing logic |
| **SIGNUP_FEATURE.md** | Self-service signup implementation |
| **SWAGGER_DOCS.md** | API documentation usage guide |

## 🌐 Key Endpoints

### Frontend Routes
- `/` - Landing page
- `/signup` - Create new workspace
- `/login` - Workspace login
- `/dashboard` - Tenant dashboard

### API Endpoints
- `POST /api/signup/` - Create tenant
- `GET /api/check-subdomain/` - Check availability
- `GET/POST /api/projects/` - Project CRUD
- `GET/POST /api/tasks/` - Task CRUD
- `GET /api/docs/` - Swagger UI
- `GET /api/redoc/` - ReDoc

## 🔐 Multi-Tenancy

Each tenant (company) gets:
- ✅ Unique subdomain (`acme.projecthub.com`)
- ✅ Isolated PostgreSQL schema
- ✅ Complete data separation
- ✅ Custom branding potential

**How it works**:
1. User visits `acme.projecthub.com`
2. Django middleware reads subdomain
3. PostgreSQL schema switches to `acme`
4. All queries return only Acme's data

## 📖 Learning Resources

Start with these docs in order:
1. **GETTING_STARTED.md** - Set up locally
2. **PROJECT_OVERVIEW.md** - Understand the architecture
3. **TENANT_OPERATIONS.md** - Learn multi-tenancy mechanics
4. **DEPLOY_AWS.md** - Deploy to production

## 🚢 Deployment

### Local Testing
```bash
# Create test tenant
python manage.py shell
>>> from core.models import Client, Domain
>>> tenant = Client(schema_name='test', name='Test Co')
>>> tenant.save()
>>> domain = Domain(domain='test.localhost', tenant=tenant)
>>> domain.save()
```
Access at: `http://test.localhost:5173`

### Production (AWS)
See **`docs/DEPLOY_AWS.md`** for complete step-by-step instructions covering:
- EC2 instance setup
- RDS PostgreSQL configuration
- Nginx configuration
- SSL certificates
- DNS setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: `docs/` folder
- **API Docs**: `http://localhost:8000/api/docs/`

## 🎉 Acknowledgments

- django-tenants for multi-tenancy
- DRF for API framework
- drf-spectacular for API docs
- React team for the UI library

---

**Built with ❤️ for modern SaaS applications**
