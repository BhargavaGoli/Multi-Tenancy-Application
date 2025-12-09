# Tenant Signup Feature - Complete Implementation

This feature allows users to create new tenant workspaces through a self-service signup form.

## Features Implemented

### 🔧 Backend (Django REST Framework)

#### 1. **Serializer** (`backend/core/serializers.py`)
- **TenantSignupSerializer**: Validates and creates new tenants
- **Validation**:
  - Subdomain format (lowercase, alphanumeric, hyphens only)
  - Minimum length (3 characters)
  - Reserved subdomain checking (www, api, admin, etc.)
  - Uniqueness check
- **Auto-creation**: Automatically creates PostgreSQL schema and domain mapping

#### 2. **API Views** (`backend/core/views.py`)
- **`POST /api/signup/`**: Creates a new tenant
  - Public endpoint (no authentication required)
  - Returns workspace URL and success message
  
- **`GET /api/check-subdomain/`**: Checks subdomain availability
  - Real-time availability checking
  - Used for instant feedback in the form

#### 3. **URL Configuration** (`backend/projecthub/urls.py`)
- Added signup endpoints to the API

### 🎨 Frontend (React)

#### 1. **Signup Page** (`frontend/src/pages/Signup.jsx`)

**Features**:
- ✅ **Real-time subdomain checking** (with debounce)
- ✅ **Visual availability indicators** (check/x icons, colors)
- ✅ **Form validation** with error display
- ✅ **Loading states** during submission
- ✅ **Success screen** with auto-redirect
- ✅ **Responsive design** with modern UI

**Form Fields**:
1. **Subdomain** (required, min 3 chars)
   - Live availability check
   - Auto-formats to lowercase
2. **Company Name** (required)
3. **Admin Name** (required)
4. **Admin Email** (required, email validation)

**User Flow**:
```
1. User visits /signup
2. Fills in form
3. Types subdomain → Instant availability check
4. Submits form
5. Success screen shows workspace URL
6. Auto-redirects to new workspace in 3 seconds
```

#### 2. **Routing** (`frontend/src/App.jsx`)
- Added `/signup` route

#### 3. **Updated Landing Page** (`frontend/src/pages/Home.jsx`)
- Changed "Get Started" button to link to `/signup` instead of `/login`

## API Endpoints

### Create Tenant
```http
POST /api/signup/
Content-Type: application/json

{
  "subdomain": "acme",
  "company_name": "Acme Inc.",
  "admin_email": "admin@acme.com",
  "admin_name": "John Doe"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Workspace created successfully!",
  "data": {
    "subdomain": "acme",
    "company_name": "Acme Inc.",
    "workspace_url": "http://acme.localhost:5173",
    "admin_email": "admin@acme.com",
    "admin_name": "John Doe"
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "subdomain": ["This subdomain is already taken"]
  }
}
```

### Check Subdomain Availability
```http
GET /api/check-subdomain/?subdomain=acme
```

**Response**:
```json
{
  "available": false,
  "subdomain": "acme",
  "message": "Already taken"
}
```

## How It Works

### 1. User Fills Form
```jsx
// Frontend: Signup.jsx
const [formData, setFormData] = useState({
  subdomain: '',
  company_name: '',
  admin_name: '',
  admin_email: ''
});
```

### 2. Real-Time Subdomain Check
```jsx
// Debounced API call as user types
const checkSubdomain = async (subdomain) => {
  const response = await axios.get(
    `http://localhost:8000/api/check-subdomain/`,
    { params: { subdomain } }
  );
  // Show available/taken indicator
};
```

### 3. Form Submission
```jsx
// POST to /api/signup/
const response = await axios.post(
  `http://localhost:8000/api/signup/`,
  formData
);
```

### 4. Backend Creates Tenant
```python
# Serializer creates tenant
tenant = Client(schema_name='acme', name='Acme Inc.')
tenant.save()  # Auto-creates PostgreSQL schema

# Creates domain mapping
domain = Domain(domain='acme.localhost:5173', tenant=tenant)
domain.save()
```

### 5. Success & Redirect
```jsx
// Show success screen
setSuccessData(response.data.data);

// Auto-redirect after 3 seconds
setTimeout(() => {
  window.location.href = response.data.data.workspace_url;
}, 3000);
```

## Configuration

### Environment Variable (Backend)
Add to `backend/.env`:
```env
BASE_DOMAIN=localhost:5173  # For local development
# BASE_DOMAIN=projecthub.com  # For production
```

The subdomain will be: `{subdomain}.{BASE_DOMAIN}`

### CORS (Already configured)
```python
# backend/projecthub/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

## Testing the Feature

### Local Testing

1. **Start Backend**:
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver
```

2. **Start Frontend**:
```bash
cd frontend
npm run dev
```

3. **Test Signup**:
   - Visit http://localhost:5173
   - Click "Get Started"
   - Fill signup form:
     - Subdomain: `testcompany`
     - Company: `Test Company Inc.`
     - Name: `John Doe`
     - Email: `john@test.com`
   - Submit
   - See success screen
   - Get redirected to `http://testcompany.localhost:5173`

### Verify in Database

```bash
cd backend
python manage.py shell
```

```python
from core.models import Client, Domain

# Check if tenant was created
Client.objects.all()
# Output: <QuerySet [<Client: Test Company Inc.>]>

# Check domain
Domain.objects.all()
# Output: <QuerySet [<Domain: testcompany.localhost:5173>]>

# Check schema exists
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT schema_name FROM information_schema.schemata;")
    print([row[0] for row in cursor.fetchall()])
# Output: ['public', 'testcompany', ...]
```

## Production Considerations

### 1. Email Verification
Add email verification before tenant creation:
```python
# Send verification email
# Only create tenant after email is confirmed
```

### 2. Payment Integration
Add payment/subscription before tenant creation:
```python
# Integrate Stripe/PayPal
# Create tenant only after successful payment
```

### 3. Domain Configuration
Update `BASE_DOMAIN` in production:
```python
BASE_DOMAIN = os.getenv('BASE_DOMAIN', 'projecthub.com')
full_domain = f"{subdomain}.{BASE_DOMAIN}"
```

### 4. Rate Limiting
Prevent abuse with rate limiting:
```python
from rest_framework.throttling import AnonRateThrottle

class SignupRateThrottle(AnonRateThrottle):
    rate = '3/hour'  # 3 signups per hour per IP
```

### 5. Captcha
Add reCAPTCHA to prevent bots:
```jsx
// Frontend
import ReCAPTCHA from "react-google-recaptcha";
```

## UI Screenshots Description

### Signup Form
- Dark theme with glassmorphism effect
- Real-time subdomain availability indicator
- Inline validation errors
- Disabled submit button when subdomain is taken
- Loading spinner during submission

### Success Screen
- Green checkmark icon
- Workspace details
- URL in monospace font
- Auto-redirect countdown
- Clean, celebratory design

## Files Modified/Created

| File | Type | Description |
|------|------|-------------|
| `backend/core/serializers.py` | Created | Tenant signup validation and creation |
| `backend/core/views.py` | Created | API endpoints for signup and checking |
| `backend/projecthub/urls.py` | Modified | Added signup routes |
| `frontend/src/pages/Signup.jsx` | Created | Signup UI component |
| `frontend/src/App.jsx` | Modified | Added /signup route |
| `frontend/src/pages/Home.jsx` | Modified | Link to signup page |

## Next Steps

1. **Add User Authentication**: Create admin user when tenant is created
2. **Email Verification**: Verify email before creating tenant
3. **Onboarding Flow**: Guide new tenants through initial setup
4. **Billing Integration**: Add subscription/payment
5. **Tenant Settings**: Allow tenants to update their info
6. **Delete Tenant**: Admin ability to delete workspaces

---

**Your SaaS now has self-service tenant signup! 🎉**
