import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "projecthub.settings")
django.setup()

from core.models import Client, Domain

def add_dev_domains():
    """
    Add development domain mappings for 127.0.0.1 and localhost with port
    """
    try:
        # Get the public tenant
        public_tenant = Client.objects.get(schema_name='public')
        
        # Domain variations to add for local development
        dev_domains = [
            '127.0.0.1:8000',
            'localhost:8000',
            '127.0.0.1',
        ]
        
        for domain_name in dev_domains:
            # Check if already exists
            if not Domain.objects.filter(domain=domain_name).exists():
                domain = Domain()
                domain.domain = domain_name
                domain.tenant = public_tenant
                domain.is_primary = False
                domain.save()
                print(f"✅ Added domain: {domain_name}")
            else:
                print(f"ℹ️  Domain already exists: {domain_name}")
        
        print("\n🎉 All development domains configured!")
        print("You can now access backend at:")
        print("  - http://127.0.0.1:8000/api/docs/")
        print("  - http://localhost:8000/api/docs/")
        
    except Client.DoesNotExist:
        print("❌ Error: Public tenant not found. Run create_tenant.py first.")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    add_dev_domains()
