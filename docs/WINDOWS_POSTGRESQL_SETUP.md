# Windows Setup Guide - PostgreSQL Installation

This guide helps Windows users set up PostgreSQL for the ProjectHub application.

## Installing PostgreSQL on Windows

### Option 1: Official PostgreSQL Installer (Recommended)

1. **Download PostgreSQL**:
   - Go to: https://www.postgresql.org/download/windows/
   - Click "Download the installer"
   - Choose version 14.x or later
   - Download the Windows x86-64 installer

2. **Run the Installer**:
   - Double-click the downloaded `.exe` file
   - Click "Next" through the setup wizard
   
3. **Installation Directory**:
   - Default: `C:\Program Files\PostgreSQL\14`
   - Click "Next"

4. **Select Components**:
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (GUI tool - highly recommended!)
   - ✅ Command Line Tools
   - ✅ Stack Builder (optional)
   - Click "Next"

5. **Data Directory**:
   - Default: `C:\Program Files\PostgreSQL\14\data`
   - Click "Next"

6. **Set Password**:
   - Enter a password for the `postgres` superuser
   - **IMPORTANT**: Remember this password!
   - Recommended: Use something like `postgres123` for development
   - Click "Next"

7. **Port**:
   - Default: `5432`
   - Click "Next"

8. **Locale**:
   - Default: `[Default locale]`
   - Click "Next"

9. **Complete Installation**:
   - Review settings
   - Click "Next" to install
   - Wait for installation (2-3 minutes)
   - Uncheck "Launch Stack Builder" (not needed)
   - Click "Finish"

## Verify Installation

### Using pgAdmin (Recommended for Beginners)

1. **Open pgAdmin**:
   - Start Menu → PostgreSQL 14 → pgAdmin 4
   - Wait for it to open in your browser

2. **Connect to Server**:
   - Expand "Servers" in left panel
   - Click "PostgreSQL 14"
   - Enter the password you set during installation
   - ✅ You should see "Databases" folder

3. **Create Project Database**:
   - Right-click "Databases"
   - Select "Create" → "Database..."
   - Database name: `projecthub`
   - Owner: `postgres`
   - Click "Save"

### Using Command Line (Optional)

If you want to use `psql` from command line:

1. **Add PostgreSQL to PATH**:
   - Right-click "This PC" → Properties
   - Advanced system settings → Environment Variables
   - Under "System variables", find `Path`
   - Click "Edit" → "New"
   - Add: `C:\Program Files\PostgreSQL\14\bin`
   - Click "OK" on all windows

2. **Restart Command Prompt/PowerShell**

3. **Test `psql`**:
   ```powershell
   psql --version
   ```
   Should show: `psql (PostgreSQL) 14.x`

4. **Create Database**:
   ```powershell
   createdb -U postgres projecthub
   ```

## Common Issues

### Issue 1: "psql is not recognized"

**Solution**: PostgreSQL binaries are not in your PATH.

**Fix Option A** (Recommended): Use pgAdmin instead
- No need for command line
- GUI is easier

**Fix Option B**: Add to PATH
- Follow "Add PostgreSQL to PATH" instructions above

### Issue 2: "Connection refused" or "Could not connect"

**Solution**: PostgreSQL service is not running.

**Fix**:
1. Press `Win + R`
2. Type: `services.msc`
3. Find: `postgresql-x64-14`
4. Right-click → Start
5. If already running, right-click → Restart

### Issue 3: "Password authentication failed"

**Solution**: Incorrect password.

**Fix**:
1. Use the password you set during installation
2. If forgotten, you may need to reinstall PostgreSQL

## Connecting from Python

Update `backend/projecthub/settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': 'projecthub',
        'USER': 'postgres',
        'PASSWORD': 'YOUR_PASSWORD_HERE',  # The one you set during installation
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Or use environment variables (recommended):

**Create** `backend/.env`:
```env
DATABASE_NAME=projecthub
DATABASE_USER=postgres
DATABASE_PASSWORD=YOUR_PASSWORD_HERE
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

## Next Steps

After PostgreSQL is installed and database is created:

1. Continue with backend setup:
   ```powershell
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Run migrations:
   ```powershell
   python manage.py migrate_schemas --shared
   python create_tenant.py
   ```

3. Start server:
   ```powershell
   python manage.py runserver
   ```

## Alternative: Using Docker (Advanced)

If you prefer Docker:

```powershell
docker run --name projecthub-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=projecthub -p 5432:5432 -d postgres:14
```

Then use these credentials:
- Host: `localhost`
- Port: `5432`
- Database: `projecthub`
- User: `postgres`
- Password: `password`

## Useful pgAdmin Tips

### Viewing Tables
1. Open pgAdmin
2. Expand: Servers → PostgreSQL 14 → Databases → projecthub → Schemas
3. You'll see:
   - `public` schema (shared tables)
   - `acme`, `globex`, etc. (tenant schemas)

### Running SQL Queries
1. Right-click database → "Query Tool"
2. Type SQL:
   ```sql
   SELECT * FROM public.core_client;
   ```
3. Click ▶️ Execute

### Backup Database
1. Right-click `projecthub` database
2. Select "Backup..."
3. Choose filename and location
4. Click "Backup"

---

**Still having issues?** Check:
- PostgreSQL service is running
- Firewall isn't blocking port 5432
- Password is correct
- Database name is exactly `projecthub` (lowercase)
