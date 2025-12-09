from rest_framework import serializers
from .models import Client, Domain
import re

class TenantSignupSerializer(serializers.Serializer):
    subdomain = serializers.CharField(
        max_length=63,
        help_text="Unique subdomain for your workspace (e.g., 'acme')"
    )
    company_name = serializers.CharField(
        max_length=100,
        help_text="Your company or organization name"
    )
    admin_email = serializers.EmailField(
        help_text="Admin email address"
    )
    admin_name = serializers.CharField(
        max_length=100,
        help_text="Admin full name"
    )
    
    def validate_subdomain(self, value):
        """
        Validate subdomain format and uniqueness
        """
        # Convert to lowercase
        value = value.lower().strip()
        
        # Check format (alphanumeric and hyphens only, must start with letter)
        if not re.match(r'^[a-z][a-z0-9-]*$', value):
            raise serializers.ValidationError(
                "Subdomain must start with a letter and contain only lowercase letters, numbers, and hyphens"
            )
        
        # Check length
        if len(value) < 3:
            raise serializers.ValidationError("Subdomain must be at least 3 characters long")
        
        # Reserved subdomains
        reserved = ['www', 'api', 'admin', 'mail', 'ftp', 'localhost', 'public', 'test', 'demo']
        if value in reserved:
            raise serializers.ValidationError(f"The subdomain '{value}' is reserved")
        
        # Check if already exists
        if Client.objects.filter(schema_name=value).exists():
            raise serializers.ValidationError("This subdomain is already taken")
        
        return value
    
    def create(self, validated_data):
        """
        Create tenant and domain
        """
        subdomain = validated_data['subdomain']
        company_name = validated_data['company_name']
        
        # Create tenant (this auto-creates the PostgreSQL schema)
        tenant = Client(
            schema_name=subdomain,
            name=company_name
        )
        tenant.save()
        
        # Determine domain based on environment
        # In production, use your actual domain
        # For local testing, use localhost
        import os
        base_domain = os.getenv('BASE_DOMAIN', 'localhost:5173')
        full_domain = f"{subdomain}.{base_domain}"
        
        # Create domain mapping
        domain = Domain()
        domain.domain = full_domain
        domain.tenant = tenant
        domain.is_primary = True
        domain.save()
        
        return {
            'tenant': tenant,
            'domain': domain,
            'subdomain': subdomain,
            'full_domain': full_domain,
            'admin_email': validated_data['admin_email'],
            'admin_name': validated_data['admin_name']
        }
