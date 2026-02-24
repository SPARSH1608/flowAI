# flowAI: Fresh Start Deployment Guide

This guide provides a clean, step-by-step sequence to set up your EC2 instance and Vercel frontend from scratch.

---

## 🚀 Part 1: EC2 Backend (Sequential Commands)

Run these commands in order. If a command fails, stop and check the error.

### 1. Initial System Setup
```bash
# 1. Update and install core tools
sudo apt update && sudo apt upgrade -y
sudo apt install -y unzip curl git nginx python3-certbot-nginx

# 2. ADD SWAP SPACE (CRITICAL for t2.micro)
# t2.micro only has 1GB RAM, which is not enough for AI processing.
# This adds 2GB of "emergency" memory.
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verify it's active
free -h
```

# 3. OPEN FIREWALL PORTS
# This adds Google and Cloudflare DNS to the top of your resolver list
sudo sed -i '1i nameserver 8.8.8.8\nnameserver 1.1.1.1' /etc/resolv.conf
# Verify if you can see a response
ping -c 3 google.com

# 3. Install Bun (The Runtime)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# 4. Install PM2
npm install -g pm2
```

### 2. Clone & Build
```bash
# 1. Clone the repository
# Ensure you use exactly the same folder name as your project!
git clone https://github.com/your-username/flowAI-clean.git
cd flowAI-clean

# 2. Install dependencies (at the ROOT)
bun install

# 3. Setup API environment
# IMPORTANT: Put your REAL values in this file!
nano apps/api/.env
```

### 3. Database & Permissions
```bash
cd apps/api

# 1. Add missing Prisma 7 runtime utility
bun add @prisma/client-runtime-utils

# 2. Generate client to the custom output path
bunx prisma generate
bunx prisma db push

# 3. Setup uploads directory & permissions
mkdir -p uploads/images
cd ../..
sudo chmod o+x /home/ubuntu
# Adjust the path below if your folder name is different!
sudo chmod -R 755 /home/ubuntu/flowAI-clean/apps/api/uploads
```

### 4. Start Backend with PM2
```bash
# From the root (flowAI-clean)
pm2 delete flowai-api || true
pm2 start "bun run apps/api/src/app.ts" --name flowai-api
pm2 save
pm2 startup
```

---

## 🌐 Part 2: Nginx Configuration (Streaming & CORS)

### 1. Create Config File
```bash
sudo nano /etc/nginx/sites-available/flowai
```

### 2. Paste this EXACT configuration
*Replace `api-flowai.sparsh.space` with your domain and verify paths.*

```nginx
server {
    listen 80;
    server_name api-flowai.sparsh.space;

    # Backend API
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # STREAMING & TIMEOUT FIXES
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        gzip off;
        chunked_transfer_encoding off;

        # BULLETPROOF CORS (Prevents duplicate or missing headers)
        proxy_hide_header Access-Control-Allow-Origin;
        add_header 'Access-Control-Allow-Origin' '*' always;
    }

    # STATIC IMAGES (CORS allowed)
    location /uploads/ {
        # IMPORTANT: Verify this folder exists!
        alias /home/ubuntu/flowAI-clean/apps/api/uploads/;
        add_header 'Access-Control-Allow-Origin' '*' always;
        expires 7d;
    }
}
```

### 3. Apply Nginx changes
```bash
sudo ln -s /etc/nginx/sites-available/flowai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🎨 Part 3: Vercel Frontend

1. **Import** the project to Vercel.
2. **Root Directory**: `apps/web`
3. **Build Command**: `bun run build`
4. **Env Variables**: 
   - `NEXT_PUBLIC_API_URL`: `https://api-flowai.sparsh.space`
5. **DNS**: Point your main domain to Vercel as instructed in their dashboard.

---

## ✅ Verification
- **Health**: `curl -i https://api-flowai.sparsh.space/health`
- **PM2 Status**: `pm2 status`
- **PM2 Logs**: `pm2 logs flowai-api`
