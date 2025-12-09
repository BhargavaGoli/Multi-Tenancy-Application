#!/bin/bash
# Backend Server Setup Script for AWS EC2
# Run this script on the Backend instance after SSH connection

set -e  # Exit on error

echo "=========================================="
echo "ProjectHub Backend Server Setup"
echo "=========================================="

# Update system
echo "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install dependencies
echo "Step 2: Installing dependencies..."
sudo apt install -y python3-pip python3-venv python3-dev libpq-dev postgresql-client nginx git

# Clone repository (update with your repo URL)
echo "Step 3: Cloning repository..."
cd /home/ubuntu
if [ ! -d "projecthub" ]; then
    read -p "Enter your GitHub repository URL: " REPO_URL
    git clone $REPO_URL projecthub
fi

# Setup Python virtual environment
echo "Step 4: Setting up Python virtual environment..."
cd /home/ubuntu/projecthub/backend
python3 -m venv venv
source venv/bin/activate

# Install Python packages
echo "Step 5: Installing Python packages..."
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Create .env file
echo "Step 6: Creating .env file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  IMPORTANT: Edit .env file with your actual credentials!"
    echo "Run: nano .env"
fi

# Create log directory for Gunicorn
echo "Step 7: Creating log directories..."
sudo mkdir -p /var/log/gunicorn
sudo chown ubuntu:www-data /var/log/gunicorn

# Setup Nginx
echo "Step 8: Configuring Nginx..."
sudo cp /home/ubuntu/projecthub/deploy/nginx/backend.conf /etc/nginx/sites-available/backend
sudo ln -sf /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t

# Setup Gunicorn service
echo "Step 9: Setting up Gunicorn service..."
sudo cp /home/ubuntu/projecthub/deploy/gunicorn.service /etc/systemd/system/
sudo systemctl daemon-reload

echo ""
echo "=========================================="
echo "✅ Backend setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano /home/ubuntu/projecthub/backend/.env"
echo "2. Run migrations: python manage.py migrate_schemas --shared"
echo "3. Collect static files: python manage.py collectstatic --noinput"
echo "4. Start services:"
echo "   sudo systemctl start gunicorn"
echo "   sudo systemctl enable gunicorn"
echo "   sudo systemctl restart nginx"
echo ""
