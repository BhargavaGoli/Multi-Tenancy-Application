#!/bin/bash
# Frontend Server Setup Script for AWS EC2
# Run this script on the Frontend instance after SSH connection

set -e  # Exit on error

echo "=========================================="
echo "ProjectHub Frontend Server Setup"
echo "=========================================="

# Update system
echo "Step 1: Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install dependencies
echo "Step 2: Installing Nginx and Git..."
sudo apt install -y nginx git

# Install Node.js 18
echo "Step 3: Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clone repository
echo "Step 4: Cloning repository..."
cd /home/ubuntu
if [ ! -d "projecthub" ]; then
    read -p "Enter your GitHub repository URL: " REPO_URL
    git clone $REPO_URL projecthub
fi

# Build React app
echo "Step 5: Building React application..."
cd /home/ubuntu/projecthub/frontend
npm install
npm run build

# Setup Nginx
echo "Step 6: Configuring Nginx..."
read -p "Enter Backend Private IP (e.g., 172.31.10.5): " BACKEND_IP
sudo cp /home/ubuntu/projecthub/deploy/nginx/frontend.conf /etc/nginx/sites-available/projecthub
sudo sed -i "s/BACKEND_PRIVATE_IP/$BACKEND_IP/g" /etc/nginx/sites-available/projecthub
sudo ln -sf /etc/nginx/sites-available/projecthub /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ""
echo "=========================================="
echo "✅ Frontend setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Point your domain DNS to this server's public IP"
echo "2. Install SSL certificate:"
echo "   sudo apt install -y certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d sunnysb21.site -d *.sunnysb21.site"
echo ""
