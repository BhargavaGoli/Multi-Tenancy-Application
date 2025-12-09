from django.core.management.base import BaseCommand
from core.models import Client, Domain

class Command(BaseCommand):
    help = 'Creates a new tenant with domain'

    def add_arguments(self, parser):
        parser.add_argument('schema_name', type=str, help='Unique schema name (e.g., acme)')
        parser.add_argument('name', type=str, help='Tenant display name (e.g., "Acme Inc.")')
        parser.add_argument('domain', type=str, help='Domain name (e.g., acme.projecthub.com)')

    def handle(self, *args, **options):
        schema_name = options['schema_name']
        name = options['name']
        domain_name = options['domain']

        # Validate schema name
        if not schema_name.islower() or ' ' in schema_name:
            self.stdout.write(self.style.ERROR('Schema name must be lowercase with no spaces'))
            return

        # Check if tenant already exists
        if Client.objects.filter(schema_name=schema_name).exists():
            self.stdout.write(self.style.ERROR(f'Tenant with schema "{schema_name}" already exists'))
            return

        # Create tenant
        self.stdout.write(f'Creating tenant: {name}...')
        tenant = Client(schema_name=schema_name, name=name)
        tenant.save()
        self.stdout.write(self.style.SUCCESS(f'✅ Tenant created with schema: {schema_name}'))

        # Create domain
        self.stdout.write(f'Mapping domain: {domain_name}...')
        domain = Domain()
        domain.domain = domain_name
        domain.tenant = tenant
        domain.is_primary = True
        domain.save()
        self.stdout.write(self.style.SUCCESS(f'✅ Domain mapped: {domain_name}'))

        self.stdout.write(self.style.SUCCESS(f'\n🎉 Tenant "{name}" is ready!'))
        self.stdout.write(f'   Access at: https://{domain_name}')
