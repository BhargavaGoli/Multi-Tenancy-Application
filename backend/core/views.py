from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from .serializers import TenantSignupSerializer

@extend_schema(
    request=TenantSignupSerializer,
    responses={
        201: {
            'type': 'object',
            'properties': {
                'success': {'type': 'boolean'},
                'message': {'type': 'string'},
                'data': {
                    'type': 'object',
                    'properties': {
                        'subdomain': {'type': 'string'},
                        'company_name': {'type': 'string'},
                        'workspace_url': {'type': 'string'},
                        'admin_email': {'type': 'string'},
                        'admin_name': {'type': 'string'},
                    }
                }
            }
        },
        400: {
            'type': 'object',
            'properties': {
                'success': {'type': 'boolean'},
                'message': {'type': 'string'},
                'errors': {'type': 'object'}
            }
        }
    },
    description='Create a new tenant workspace. This endpoint allows users to sign up and create their own isolated workspace.',
    tags=['Tenant Management'],
    examples=[
        OpenApiExample(
            'Signup Example',
            value={
                'subdomain': 'acme',
                'company_name': 'Acme Inc.',
                'admin_email': 'admin@acme.com',
                'admin_name': 'John Doe'
            },
            request_only=True,
        ),
    ]
)
@api_view(['POST'])
@permission_classes([AllowAny])  # Public endpoint - no authentication required
def tenant_signup(request):
    """
    Create a new tenant (company workspace)
    
    POST /api/signup/
    {
        "subdomain": "acme",
        "company_name": "Acme Inc.",
        "admin_email": "admin@acme.com",
        "admin_name": "John Doe"
    }
    """
    serializer = TenantSignupSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Create tenant and domain
            result = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Workspace created successfully!',
                'data': {
                    'subdomain': result['subdomain'],
                    'company_name': result['tenant'].name,
                    'workspace_url': f"http://{result['full_domain']}",
                    'admin_email': result['admin_email'],
                    'admin_name': result['admin_name']
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to create workspace',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'success': False,
        'message': 'Validation failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    parameters=[
        OpenApiParameter(
            name='subdomain',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description='Subdomain to check for availability',
            required=True,
            examples=[
                OpenApiExample('Example Subdomain', value='acme'),
            ]
        ),
    ],
    responses={
        200: {
            'type': 'object',
            'properties': {
                'available': {'type': 'boolean'},
                'subdomain': {'type': 'string'},
                'message': {'type': 'string'}
            }
        }
    },
    description='Check if a subdomain is available for registration',
    tags=['Tenant Management']
)
@api_view(['GET'])
@permission_classes([AllowAny])
def check_subdomain(request):
    """
    Check if a subdomain is available
    
    GET /api/check-subdomain/?subdomain=acme
    """
    from .models import Client
    import re
    
    subdomain = request.query_params.get('subdomain', '').lower().strip()
    
    if not subdomain:
        return Response({
            'available': False,
            'message': 'Subdomain is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate format
    if not re.match(r'^[a-z][a-z0-9-]*$', subdomain):
        return Response({
            'available': False,
            'message': 'Invalid subdomain format'
        })
    
    # Check if exists
    exists = Client.objects.filter(schema_name=subdomain).exists()
    
    # Reserved subdomains
    reserved = ['www', 'api', 'admin', 'mail', 'ftp', 'localhost', 'public', 'test', 'demo']
    is_reserved = subdomain in reserved
    
    available = not exists and not is_reserved
    
    return Response({
        'available': available,
        'subdomain': subdomain,
        'message': 'Available' if available else 'Already taken' if exists else 'Reserved'
    })
