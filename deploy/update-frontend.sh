#!/bin/bash
# Quick deployment script for frontend updates

echo "Updating ProjectHub Frontend..."

cd /home/ubuntu/Multi-Tenancy-Application
git pull

cd frontend
npm install
npm run build

sudo systemctl restart nginx

echo "✅ Frontend updated successfully!"
