# AWS Deployment Files

This directory contains configuration files and scripts for deploying ProjectHub to AWS.

## Directory Structure

```
deploy/
├── nginx/
│   ├── backend.conf          # Nginx config for Backend instance
│   └── frontend.conf         # Nginx config for Frontend instance
├── gunicorn.service          # Systemd service for Gunicorn
├── setup-backend.sh          # Automated backend setup script
├── setup-frontend.sh         # Automated frontend setup script
├── update-backend.sh         # Quick backend update script
└── update-frontend.sh        # Quick frontend update script
```

## Quick Start

### Backend Instance Setup

1. SSH into your backend EC2 instance
2. Run the setup script:
   ```bash
   cd /home/ubuntu/Multi-Tenancy-Application
   chmod +x deploy/setup-backend.sh
   ./deploy/setup-backend.sh
   ```
3. Edit the `.env` file with your credentials:
   ```bash
   nano /home/ubuntu/Multi-Tenancy-Application/backend/.env
   ```
4. Run migrations and start services:
   ```bash
   cd /home/ubuntu/Multi-Tenancy-Application/backend
   source venv/bin/activate
   python manage.py migrate_schemas --shared
   python manage.py collectstatic --noinput
   sudo systemctl start gunicorn
   sudo systemctl enable gunicorn
   sudo systemctl restart nginx
   ```

### Frontend Instance Setup

1. SSH into your frontend EC2 instance
2. Run the setup script:
   ```bash
   cd /home/ubuntu/Multi-Tenancy-Application
   chmod +x deploy/setup-frontend.sh
   ./deploy/setup-frontend.sh
   ```
   (You'll be prompted for the Backend Private IP)

3. Install SSL certificate:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d sunnysb21.site -d *.sunnysb21.site -d api.sunnysb21.site
   ```

## Updating Deployed Code

### Update Backend
```bash
cd /home/ubuntu/Multi-Tenancy-Application
chmod +x deploy/update-backend.sh
./deploy/update-backend.sh
```

### Update Frontend
```bash
cd /home/ubuntu/Multi-Tenancy-Application
chmod +x deploy/update-frontend.sh
./deploy/update-frontend.sh
```

## Manual Configuration

If you prefer manual setup, refer to `docs/DEPLOY_AWS.md` for detailed step-by-step instructions.
