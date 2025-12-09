import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "projecthub.settings")
django.setup()

from django.db import connection

# Create tables in public schema
with connection.cursor() as cursor:
    # Set schema to public
    cursor.execute("SET search_path TO public;")
    
    # Create projects_project table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects_project (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # Create projects_task table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects_task (
            id SERIAL PRIMARY KEY,
            project_id INTEGER NOT NULL REFERENCES projects_project(id) ON DELETE CASCADE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            completed BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    print("✅ Created tables in public schema:")
    print("  - projects_project")
    print("  - projects_task")
