# DNS Configuration for sunnysb21.site

To properly configure your domain for the multi-tenant SaaS platform, add these DNS records at your domain registrar:

## Required DNS Records

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| A | @ | `FRONTEND_PUBLIC_IP` | Main site (sunnysb21.site) |
| A | * | `FRONTEND_PUBLIC_IP` | All tenant subdomains (*.sunnysb21.site) |
| A | api | `FRONTEND_PUBLIC_IP` | API/Swagger docs (api.sunnysb21.site) |

## Example Configuration

Replace `FRONTEND_PUBLIC_IP` with your actual Frontend EC2 instance public IP (e.g., `54.123.45.67`)

### GoDaddy / Namecheap Format:
```
Type: A
Name: @
Value: 54.123.45.67
TTL: 600

Type: A
Name: *
Value: 54.123.45.67
TTL: 600

Type: A
Name: api
Value: 54.123.45.67
TTL: 600
```

### Cloudflare Format:
```
Type: A
Name: sunnysb21.site
IPv4 address: 54.123.45.67
Proxy status: DNS only (gray cloud)

Type: A
Name: *
IPv4 address: 54.123.45.67
Proxy status: DNS only (gray cloud)

Type: A
Name: api
IPv4 address: 54.123.45.67
Proxy status: DNS only (gray cloud)
```

## Verification

After adding DNS records, wait 5-10 minutes and verify:

```bash
# Check main domain
nslookup sunnysb21.site

# Check wildcard (tenant subdomain)
nslookup demo.sunnysb21.site

# Check API subdomain
nslookup api.sunnysb21.site
```

All should return your Frontend server's public IP.

## SSL Certificate

After DNS propagation, run this on your Frontend server:

```bash
sudo certbot --nginx -d sunnysb21.site -d *.sunnysb21.site -d api.sunnysb21.site
```

This will secure:
- `https://sunnysb21.site` - Main site
- `https://*.sunnysb21.site` - All tenant subdomains
- `https://api.sunnysb21.site` - API documentation

## Access Points

After deployment:
- **Main Site**: https://sunnysb21.site
- **API Docs (Swagger)**: https://api.sunnysb21.site/api/docs/
- **Django Admin**: https://sunnysb21.site/admin/
- **Tenant Example**: https://demo.sunnysb21.site
