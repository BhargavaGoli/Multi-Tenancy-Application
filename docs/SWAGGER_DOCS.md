# Swagger/OpenAPI Integration Guide

## Overview

Swagger (OpenAPI) documentation has been integrated using **drf-spectacular**, the modern and actively maintained OpenAPI 3.0 schema generator for Django REST Framework.

## Accessing the API Documentation

Once the backend server is running, you can access the API documentation at:

### 1. **Swagger UI** (Interactive Documentation)
```
http://localhost:8000/api/docs/
```
- Interactive API explorer
- Try out API endpoints directly from the browser
- See request/response examples
- Test with different parameters

### 2. **ReDoc** (Alternative Documentation UI)
```
http://localhost:8000/api/redoc/
```
- Clean, three-panel layout
- Great for reading and sharing
- Mobile-friendly
- Printable documentation

### 3. **OpenAPI Schema** (Raw JSON)
```
http://localhost:8000/api/schema/
```
- Download the raw OpenAPI 3.0 schema
- Use with other tools (Postman, Insomnia, etc.)
- Import into API clients

## What's Documented

### Current Endpoints

All your API endpoints are automatically documented:

#### **Tenant Management**
- `POST /api/signup/` - Create a new tenant workspace
- `GET /api/check-subdomain/` - Check subdomain availability

#### **Projects**
- `GET /api/projects/` - List all projects (tenant-specific)
- `POST /api/projects/` - Create a new project
- `GET /api/projects/{id}/` - Retrieve a specific project
- `PUT /api/projects/{id}/` - Update a project
- `PATCH /api/projects/{id}/` - Partial update
- `DELETE /api/projects/{id}/` - Delete a project

#### **Tasks**
- `GET /api/tasks/` - List all tasks
- `POST /api/tasks/` - Create a new task
- `GET /api/tasks/{id}/` - Retrieve a specific task
- `PUT /api/tasks/{id}/` - Update a task
- `PATCH /api/tasks/{id}/` - Partial update
- `DELETE /api/tasks/{id}/` - Delete a task

## Features

### ✅ What's Included

1. **Auto-generated Schemas**: All ViewSets and endpoints are automatically documented
2. **Request/Response Examples**: See sample data for each endpoint
3. **Interactive Testing**: Try API calls directly from Swagger UI
4. **Validation Details**: See required fields, data types, constraints
5. **Tags & Organization**: Endpoints grouped by feature
6. **Authentication Info**: Shows which endpoints require auth (when implemented)

### 📝 Enhanced Documentation

The following endpoints have enhanced documentation with custom examples:

- **Tenant Signup**: Detailed request/response schemas with examples
- **Subdomain Check**: Query parameter documentation

## Installation

Already installed! The following was added to your project:

### 1. **requirements.txt**
```
drf-spectacular==0.27.2
```

### 2. **settings.py**
```python
SHARED_APPS = (
    # ...
    'drf_spectacular',
    # ...
)

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'ProjectHub API',
    'DESCRIPTION': 'Multi-tenant SaaS Project Management Platform',
    'VERSION': '1.0.0',
    # ...
}
```

### 3. **urls.py**
```python
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)

urlpatterns = [
    # ...
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
```

## Usage Examples

### Using Swagger UI

1. **Start the backend**:
   ```bash
   cd backend
   source venv/bin/activate
   python manage.py runserver
   ```

2. **Open Swagger UI**:
   ```
   http://localhost:8000/api/docs/
   ```

3. **Try an endpoint**:
   - Click on `POST /api/signup/`
   - Click "Try it out"
   - Fill in the example data:
     ```json
     {
       "subdomain": "testcompany",
       "company_name": "Test Company Inc.",
       "admin_email": "admin@test.com",
       "admin_name": "John Doe"
     }
     ```
   - Click "Execute"
   - See the response!

### Downloading the Schema

Download the OpenAPI schema for use with other tools:

```bash
# Download schema
curl http://localhost:8000/api/schema/ > openapi-schema.json

# Import into Postman/Insomnia
# File → Import → openapi-schema.json
```

## Customizing Documentation

### Adding Custom Descriptions

You can enhance any view with custom documentation:

```python
from drf_spectacular.utils import extend_schema, OpenApiParameter

@extend_schema(
    description='Your custom description here',
    tags=['Custom Tag'],
    parameters=[
        OpenApiParameter(
            name='param_name',
            type=str,
            location=OpenApiParameter.QUERY,
            description='Parameter description',
            required=True
        )
    ]
)
@api_view(['GET'])
def your_view(request):
    # ...
```

### Adding Examples

```python
from drf_spectacular.utils import extend_schema, OpenApiExample

@extend_schema(
    examples=[
        OpenApiExample(
            'Example Name',
            value={'field': 'value'},
            request_only=True,
        ),
    ]
)
```

## Configuration Options

Current settings in `backend/projecthub/settings.py`:

```python
SPECTACULAR_SETTINGS = {
    'TITLE': 'ProjectHub API',
    'DESCRIPTION': 'Multi-tenant SaaS Project Management Platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
}
```

### Additional Options You Can Add

```python
SPECTACULAR_SETTINGS = {
    # ... existing settings ...
    
    # Contact Info
    'CONTACT': {
        'name': 'API Support',
        'email': 'support@projecthub.com',
    },
    
    # License
    'LICENSE': {
        'name': 'MIT',
        'url': 'https://opensource.org/licenses/MIT',
    },
    
    # Security Schemes (for authentication)
    'APPEND_COMPONENTS': {
        'securitySchemes': {
            'BearerAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
            }
        }
    },
    
    # Tags
    'TAGS': [
        {'name': 'Tenant Management', 'description': 'Tenant signup and management'},
        {'name': 'Projects', 'description': 'Project CRUD operations'},
        {'name': 'Tasks', 'description': 'Task management'},
    ],
}
```

## Production Considerations

### Security

In production, you might want to restrict access to documentation:

```python
# settings.py (production)
if not DEBUG:
    # Disable schema endpoint in production
    SPECTACULAR_SETTINGS['SERVE_INCLUDE_SCHEMA'] = False
    
    # Or require authentication
    SPECTACULAR_SETTINGS['SERVE_PERMISSIONS'] = ['rest_framework.permissions.IsAdminUser']
```

### Hosting Static Docs

Generate static HTML documentation for hosting:

```bash
python manage.py spectacular --file openapi-schema.yaml
# Use tools like redoc-cli to generate static HTML
```

## Troubleshooting

### Schema Not Showing Endpoints

1. Ensure `drf-spectacular` is in `SHARED_APPS`
2. Check `REST_FRAMEWORK` settings include the AutoSchema
3. Restart the Django server

### ViewSets Not Appearing

- Ensure ViewSets are registered in the router
- Check that views inherit from DRF's ViewSet classes

### Custom Views Not Documented

- Add `@extend_schema` decorator
- Use `@api_view` decorator for function-based views

## Next Steps

1. **Add Authentication Documentation**: Document JWT/Token auth when implemented
2. **Add More Examples**: Enhance each endpoint with realistic examples
3. **Custom Tags**: Organize endpoints into logical groups
4. **Response Examples**: Add success/error response examples
5. **Versioning**: Add API versioning to the schema

## Resources

- **drf-spectacular docs**: https://drf-spectacular.readthedocs.io/
- **OpenAPI Specification**: https://swagger.io/specification/
- **Swagger UI**: https://swagger.io/tools/swagger-ui/
- **ReDoc**: https://redocly.com/redoc/

---

**Your API is now fully documented and interactive! 📚**
