import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "projecthub.settings")
django.setup()

from core.models import Client, Domain

def list_tenants():
    print(f"\n{'Tenant Name':<20} | {'Schema Name':<15} | {'Domains'}")
    print("-" * 80)

    for client in Client.objects.all():
        domains = Domain.objects.filter(tenant=client).values_list('domain', flat=True)
        domain_str = ", ".join(domains)
        print(f"{client.name:<20} | {client.schema_name:<15} | {domain_str}")
    print("-" * 80)
    print(f"Total Tenants: {Client.objects.count()}\n")

if __name__ == "__main__":
    list_tenants()
