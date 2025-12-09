import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    """
    Create the projecthub database if it doesn't exist.
    Update the credentials below with your PostgreSQL settings.
    """
    try:
        # Connect to the default 'postgres' database
        con = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password='123',  # ⚠️ CHANGE THIS to your PostgreSQL password
            host='localhost',
            port='5432'
        )
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        
        # Check if database exists
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'projecthub'")
        exists = cur.fetchone()
        
        if not exists:
            cur.execute('CREATE DATABASE projecthub')
            print("✅ Database 'projecthub' created successfully.")
        else:
            print("ℹ️  Database 'projecthub' already exists.")
            
        cur.close()
        con.close()
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure PostgreSQL is running")
        print("2. Update the password in this script (line 13)")
        print("3. Verify PostgreSQL is listening on localhost:5432")

if __name__ == "__main__":
    create_database()
