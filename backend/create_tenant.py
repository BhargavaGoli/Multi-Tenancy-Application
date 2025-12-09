import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "projecthub.settings")
django.setup()

from core.models import Client, Domain

def create_public_tenant():
    try:
        if Client.objects.filter(schema_name='public').exists():
            print("Public tenant already exists.")
            return

        # Create the public tenant
        tenant = Client(schema_name='public', name='Public Tenant')
        tenant.save()

        # Add the domain for the public tenant
        domain = Domain()
        domain.domain = 'localhost' # or your local domain
        domain.tenant = tenant
        domain.is_primary = True
        domain.save()
        
        print("Public tenant and domain created successfully.")

    except Exception as e:
        print(f"Error creating public tenant: {e}")

if __name__ == "__main__":
    create_public_tenant()
