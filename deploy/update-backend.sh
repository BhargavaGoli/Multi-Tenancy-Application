#!/bin/bash
# Quick deployment script - Run after initial setup
# This updates code and restarts services

echo "Updating ProjectHub Backend..."

cd /home/ubuntu/projecthub
git pull

cd backend
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate_schemas
python manage.py collectstatic --noinput

sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "✅ Backend updated successfully!"
