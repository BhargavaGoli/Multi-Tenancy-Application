# AWS Deployment Guide - Separate Frontend & Backend Instances

This is a **comprehensive, beginner-friendly guide** to deploying the ProjectHub SaaS platform on AWS using a **multi-instance architecture**. 

We will separate the application into two logically distinct servers:
1.  **Backend Server**: Runs Django, Gunicorn, and an internal Nginx. It connects to the database.
2.  **Frontend Server**: Runs the React application and a public Nginx gateway. It handles all user traffic and proxies API requests to the Backend.

**Why this architecture?**
- **Security**: The backend database and logical processing are hidden behind the frontend gateway.
- **Scalability**: You can resize the Frontend or Backend servers independently.
- **Cleanliness**: Separation of concerns makes it easier to debug issues.

---

## Table of Contents

1.  [Prerequisites & Preparation](#0-prerequisites--preparation)
2.  [Step 1: Network & Security Groups Setup](#step-1-network--security-groups-setup)
3.  [Step 2: Create RDS Database](#step-2-create-rds-database)
4.  [Step 3: Launch Backend EC2 Instance](#step-3-launch-backend-ec2-instance)
5.  [Step 4: Launch Frontend EC2 Instance](#step-4-launch-frontend-ec2-instance)
6.  [Step 5: Configure Backend Server](#step-5-configure-backend-server)
7.  [Step 6: Configure Frontend Server](#step-6-configure-frontend-server)
8.  [Step 7: Connect Domain & Setup SSL](#step-7-connect-domain--setup-ssl)
9.  [Step 8: Final Verification](#step-8-final-verification)

---

## 0. Prerequisites & Preparation

Before you begin, ensure you have:

*   ✅ **AWS Account**: You should be able to log in to the console.
*   ✅ **Domain Name**: Purchased from a registrar (GoDaddy, Namecheap, Route53, etc.).
*   ✅ **SSH Client**: Terminal on Mac/Linux or PowerShell/PuTTY on Windows.
*   ✅ **Git Repository**: Your code should be pushed to GitHub/GitLab.

**Important**: 
- **Region**: Do everything in the **SAME AWS Region** (e.g., `us-east-1` N. Virginia). If you switch regions, your instances won't see each other.
- **Cost**: This setup uses Free Tier eligible resources if available (t2.micro/t3.micro), but RDS may incur small costs.

---

## Step 1: Network & Security Groups Setup

Security Groups act as a virtual firewall. We need to define who can talk to whom carefully.

### 1.1 Navigate to Security Groups
1.  Log in to the **AWS Console**.
2.  Search for **"EC2"** and open the service.
3.  On the left sidebar, scroll down to **Network & Security** -> Click **Security Groups**.

### 1.2 Create Frontend Security Group
This group controls traffic to your public-facing web server.

1.  Click **Create security group**.
2.  **Name**: `projecthub-frontend-sg`
3.  **Description**: Allow HTTP/HTTPS access from anywhere.
4.  **VPC**: Leave as default.
5.  **Inbound rules** (Click "Add rule"):
    *   **Rule 1 (Web)**: Type: `HTTP`, Source: `Anywhere-IPv4` (0.0.0.0/0).
    *   **Rule 2 (Secure Web)**: Type: `HTTPS`, Source: `Anywhere-IPv4` (0.0.0.0/0).
    *   **Rule 3 (SSH)**: Type: `SSH`, Source: `My IP` (So only *you* can log in).
6.  Click **Create security group**.

### 1.3 Create Backend Security Group
This group controls traffic to your internal API server. It should be locked down.

1.  Click **Create security group**.
2.  **Name**: `projecthub-backend-sg`
3.  **Description**: Allow traffic only from Frontend and Admin SSH.
4.  **Inbound rules**:
    *   **Rule 1 (SSH)**: Type: `SSH`, Source: `My IP` (For your maintenance).
    *   **Rule 2 (Internal API)**: Type: `Custom TCP`, Port Range: `8000`, Source: **Custom** -> Start typing `projecthub-frontend-sg` and select the group you just created.
        *   *This means ONLY the frontend server can talk to port 8000.*
    *   **Rule 3 (Internal HTTP - Optional)**: Type: `HTTP`, Source: **Custom** -> `projecthub-frontend-sg`.
5.  Click **Create security group**.

### 1.4 Create Database Security Group
This group controls traffic to your database.

1.  Click **Create security group**.
2.  **Name**: `projecthub-db-sg`
3.  **Description**: Allow traffic only from Backend.
4.  **Inbound rules**:
    *   **Rule 1**: Type: `PostgreSQL`, Source: **Custom** -> `projecthub-backend-sg`.
        *   *This means ONLY the backend server can talk to the database.*
5.  Click **Create security group**.

---

## Step 2: Create RDS Database

1.  Search for **"RDS"** in AWS Console.
2.  Click **Create database**.
3.  **Choose a database creation method**: Standard create.
4.  **Engine options**: PostgreSQL.
5.  **Engine Version**: PostgreSQL 14.x or later.
6.  **Templates**: Select **Free tier** (if testing) or **Production**.
7.  **Settings**:
    *   **DB instance identifier**: `projecthub-db`
    *   **Master username**: `postgres`
    *   **Master password**: GenerousStrongPassword123! (Write this down!).
8.  **Instance configuration**: `db.t3.micro` or `db.t4g.micro`.
9.  **Storage**: 20 GB General Purpose SSD (gp2/gp3).
10. **Connectivity**:
    *   **VPC**: Default.
    *   **Public access**: **No** (Very Import for security).
    *   **VPC security group**: Select **existing**, choose `projecthub-db-sg`. **Remove** the "default" one if selected.
11. **Additional configuration** (Expand this):
    *   **Initial database name**: `projecthub`
12. Click **Create database**.
13. ⏳ **Wait** (5-10 mins). When status is "Available", click the DB name.
14. 📋 **Copy the Endpoint** (e.g., `projecthub-db.czw5...us-east-1.rds.amazonaws.com`).

---

## Step 3: Launch Backend EC2 Instance

1.  Go to **EC2** Dashboard -> **Launch instance**.
2.  **Name**: `projecthub-backend`
3.  **OS Images**: Ubuntu Server 22.04 LTS (HVM).
4.  **Instance Type**: `t3.micro` (Free tier eligible).
5.  **Key pair**:
    *   Click "Create new key pair".
    *   Name: `projecthub-key`.
    *   Type: `.pem`.
    *   **Download** and save it securely (e.g., to `Use\YourUser\.ssh\` or Desktop). **You cannot download it again.**
6.  **Network settings**:
    *   **Auto-assign Public IP**: Enable.
    *   **Firewall (Security groups)**: Select existing security group -> `projecthub-backend-sg`.
7.  **Configure storage**: 20 GiB gp3 is standard.
8.  Click **Launch instance**.
9.  Go to Instance List. Select `projecthub-backend`.
10. 📋 **Copy Private IP** (e.g., `172.31.10.5`) - Needed for Frontend config.
11. 📋 **Copy Public IP** (e.g., `34.xxx.xxx.xxx`) - Needed for SSH.

---

## Step 4: Launch Frontend EC2 Instance

1.  Go to **EC2** Dashboard -> **Launch instance**.
2.  **Name**: `projecthub-frontend`
3.  **OS Images**: Ubuntu Server 22.04 LTS (HVM).
4.  **Instance Type**: `t3.micro`.
5.  **Key pair**: Select existing key pair -> `projecthub-key`.
6.  **Network settings**:
    *   **Auto-assign Public IP**: Enable.
    *   **Firewall (Security groups)**: Select existing security group -> `projecthub-frontend-sg`.
7.  **Configure storage**: 20 GiB.
8.  Click **Launch instance**.
9.  Go to Instance List. Select `projecthub-frontend`.
10. 📋 **Copy Public IP** (e.g., `54.xxx.xxx.xxx`) - Needed for SSH and DNS.

---

## Step 5: Configure Backend Server

We will now set up the Django Backend.

### 5.1 Connect via SSH
Open your terminal/PowerShell.

```powershell
# Windows
ssh -i path\to\projecthub-key.pem ubuntu@BACKEND_PUBLIC_IP

# Mac/Linux (ensure permissons)
chmod 400 path/to/projecthub-key.pem
ssh -i path/to/projecthub-key.pem ubuntu@BACKEND_PUBLIC_IP
```

### 5.2 Install System Dependencies
```bash
sudo apt update && sudo apt upgrade -y
# Install Python, PostgreSQL tools, Nginx, and Git
sudo apt install -y python3-pip python3-venv python3-dev libpq-dev postgresql-client nginx git
```

### 5.3 Clone Repository & Setup Virtual Environment
```bash
cd /home/ubuntu
git clone https://github.com/yourusername/projecthub.git
cd projecthub/backend

# Create Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install Python requirements
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

### 5.4 Environment Variables (.env)
Create the `.env` file for Django.

```bash
nano .env
```
Paste this content (Right-click to paste in some terminals):
```env
# SECURITY: Change this in production
SECRET_KEY=django-insecure-change-me-please
DEBUG=False

# Allowed Hosts: Localhost + Private IPs + Domain
# IMPORTANT: Add the PRIVATE IP of the Frontend instance here later if needed, or allow all internal IPs
ALLOWED_HOSTS=localhost,127.0.0.1,.yourdomain.com,172.31.*.*

# Database Config (Use the RDS Endpoint you copied)
DATABASE_NAME=projecthub
DATABASE_USER=postgres
DATABASE_PASSWORD=GenerousStrongPassword123!
DATABASE_HOST=projecthub-db.xxxx.us-east-1.rds.amazonaws.com
DATABASE_PORT=5432
```
Save: `Ctrl+O`, `Enter`, `Ctrl+X`.

### 5.5 Database Initialization
```bash
# Check if settings are correct
python manage.py check

# Run Migrations (Create tables in RDS)
python manage.py migrate_schemas --shared

# Collect Static Files (CSS/JS for Admin)
python manage.py collectstatic --noinput
```

### 5.6 Configure Backend Nginx
This Nginx runs *locally* on the backend to handle static files and pass dynamic requests to Gunicorn.

1.  Create config file:
    ```bash
    sudo nano /etc/nginx/sites-available/backend
    ```
2.  Paste content:
    ```nginx
    server {
        listen 8000;
        server_name _;

        # Static files (Served directly by Nginx for speed)
        location /static/ {
            alias /home/ubuntu/projecthub/backend/staticfiles/;
        }

        # Media files (User uploads)
        location /media/ {
            alias /home/ubuntu/projecthub/backend/media/;
        }

        # Pass everything else to Gunicorn
        location / {
            proxy_pass http://127.0.0.1:8001;
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```
3.  Enable and Restart:
    ```bash
    sudo ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    ```

### 5.7 Setup Gunicorn Service
We want Django to run automatically in the background.

1.  Create service file:
    ```bash
    sudo nano /etc/systemd/system/gunicorn.service
    ```
2.  Paste content:
    ```ini
    [Unit]
    Description=Gunicorn daemon
    After=network.target

    [Service]
    User=ubuntu
    Group=www-data
    WorkingDirectory=/home/ubuntu/projecthub/backend
    ExecStart=/home/ubuntu/projecthub/backend/venv/bin/gunicorn \
            --workers 3 \
            --bind 127.0.0.1:8001 \
            projecthub.wsgi:application

    [Install]
    WantedBy=multi-user.target
    ```
3.  Start Service:
    ```bash
    sudo systemctl start gunicorn
    sudo systemctl enable gunicorn
    sudo systemctl status gunicorn # Should show "active (running)"
    ```

---

## Step 6: Configure Frontend Server

Now we set up the Public Gateway.

### 6.1 Connect via SSH
Open a **NEW** terminal window.
```bash
ssh -i path/to/projecthub-key.pem ubuntu@FRONTEND_PUBLIC_IP
```

### 6.2 Install Node & Nginx
```bash
sudo apt update
sudo apt install -y nginx git

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 6.3 Build React App
```bash
cd /home/ubuntu
git clone https://github.com/yourusername/projecthub.git
cd projecthub/frontend

# Install dependencies
npm install

# Build for production
# Note: If your API calls use relative paths (e.g., /api/...), no ENV setup is needed here.
npm run build
```

### 6.4 Configure Frontend Nginx (Gateway)
This is the most critical part. This Nginx routes traffic.

1.  Create config:
    ```bash
    sudo nano /etc/nginx/sites-available/projecthub
    ```
2.  Paste content (**Update `BACKEND_PRIVATE_IP` with the IP copied in Step 3, e.g., 172.31.20.5**):
    ```nginx
    upstream backend_server {
        # The Backend Security Group allows this connection
        server BACKEND_PRIVATE_IP:8000;
    }

    server {
        listen 80;
        server_name yourdomain.com *.yourdomain.com; # Wildcard for tenants

        # Serve React Build
        root /home/ubuntu/projecthub/frontend/dist;
        index index.html;

        # --- Proxy Routes ---

        # 1. API Requests -> Backend
        location /api/ {
            proxy_pass http://backend_server;
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # 2. Django Admin -> Backend
        location /admin/ {
            proxy_pass http://backend_server;
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # 3. Static/Media Files -> Backend
        # (Needed so Admin panel looks correct)
        location /static/ {
            proxy_pass http://backend_server;
            proxy_set_header Host $http_host;
        }
        location /media/ {
            proxy_pass http://backend_server;
            proxy_set_header Host $http_host;
        }

        # --- React Router ---
        # Any other URL serves index.html so React can handle routing
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```
3.  Enable and Restart:
    ```bash
    sudo ln -s /etc/nginx/sites-available/projecthub /etc/nginx/sites-enabled/
    sudo rm /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
    ```

---

## Step 7: Connect Domain & Setup SSL

### 7.1 Update DNS Records
Go to your domain registrar (e.g., GoDaddy, Cloudflare).

1.  **A Record**:
    *   **Name**: `@` (or blank)
    *   **Value**: `FRONTEND_PUBLIC_IP` (e.g., 54.12.34.56)
2.  **A Record** (Wildcard):
    *   **Name**: `*`
    *   **Value**: `FRONTEND_PUBLIC_IP`

*Wait 5-10 minutes for DNS to propagate.*

### 7.2 Install SSL (HTTPS)
We run Certbot on the **Frontend Server**.

```bash
# On Frontend SSH session
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d *.yourdomain.com
```
Follow the prompts (enter email, agree to terms). Certbot will automatically update your Nginx config to force HTTPS.

---

## Step 8: Final Verification & Tenant Creation

Your infrastructure is ready. Now lets creates the first tenant.

1.  **Switch to Backend SSH**.
2.  Run the tenant creation command (if you have a script) or via Shell:
    ```bash
    cd /home/ubuntu/projecthub/backend
    source venv/bin/activate
    python manage.py shell
    ```
    ```python
    from customers.models import Client, Domain # Adjust import based on your app
    
    # Create Public Tenant
    tenant = Client(schema_name='public', name='Public Tenant')
    tenant.save()
    dom = Domain(domain='yourdomain.com', tenant=tenant, is_primary=True)
    dom.save()

    # Create a Test Tenant
    t2 = Client(schema_name='demo', name='Demo Tenant')
    t2.save()
    d2 = Domain(domain='demo.yourdomain.com', tenant=t2, is_primary=True)
    d2.save()
    ```

### Testing Checklist
1.  Visit `https://yourdomain.com` -> Should see React Landing Page.
2.  Visit `https://yourdomain.com/admin` -> Should see Django Admin login.
3.  Visit `https://demo.yourdomain.com` -> Should see React App (Tenant context).

**🎉 Congratulations! You have deployed a professional Multi-Tenant SaaS on AWS!**
