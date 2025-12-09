# Backend Setup

## Prerequisites
- PostgreSQL running locally.
- Python 3.x

## Setup
1.  **Update Database Credentials**:
    Edit `projecthub/settings.py` and update the `DATABASES` configuration with your PostgreSQL user and password.

2.  **Create Database**:
    Ensure a database named `projecthub` exists.
    ```bash
    # If you have psql
    createdb projecthub
    # Or use the provided script (update credentials in script first)
    python ../create_db.py
    ```

3.  **Run Migrations**:
    ```bash
    python manage.py migrate_schemas --shared
    ```

4.  **Create Public Tenant**:
    ```bash
    python create_tenant.py
    ```

5.  **Run Server**:
    ```bash
    python manage.py runserver
    ```
