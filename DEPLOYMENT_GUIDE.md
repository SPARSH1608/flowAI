# flowAI Deployment Guide

This guide provides step-by-step instructions to deploy the **flowAI** backend on AWS EC2 and the frontend on Vercel.

---

## 🚀 Part 1: Backend Deployment (AWS EC2)

### 1. SSH into your EC2 Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### 2. Update System & Install Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y unzip curl git nginx
```

### 3. Install Bun (Runtime)
```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### 4. Install PM2
We'll use PM2 to keep the backend running and restart it on crashes.
```bash
npm install -g pm2
```

### 5. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/flowAI-clean.git
cd flowAI-clean
bun install
```

### 6. Setup Environment Variables
Create a `.env` file in `apps/api/`:
```bash
nano apps/api/.env
```
Paste your configuration (ensure the DATABASE_URL is correct):
```env

```

### 7. Run Database Migrations & Generate Client
```bash
cd apps/api
bunx prisma generate
bunx prisma db push
```

### 8. Start Backend with PM2
```bash
pm2 start "bun run src/app.ts" --name flowai-api
pm2 save
pm2 startup
```

---

## 🌐 Part 2: Nginx Reverse Proxy & SSL

### 1. Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/flowai
```
Paste this configuration (replace `api.yourdomain.com` with your dynamic domain):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3002; # Or your api port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Enable Configuration
```bash
sudo ln -s /etc/nginx/sites-available/flowai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Enable HTTPS (Certbot)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```
---
sudo certbot --nginx -d api-flowai.sparsh.space
## 🎨 Part 3: Frontend Deployment (Vercel)

1. **GitHub Push**: Ensure your latest code is pushed to your GitHub repository.
2. **Vercel Import**: Go to [vercel.com](https://vercel.com) and import your repository.
3. **Configure Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `bun run build`
4. **Environment Variables**:
   - Add `NEXT_PUBLIC_API_URL` with value `https://api.yourdomain.com`
5. **Deploy**: Click "Deploy".

---

## 🔗 Part 4: Connecting the Domain

### 1. Backend (API Subdomain)
- Go to your Domain Registrar (GoDaddy, Namecheap, etc.).
- Add an **A Record**:
  - Name: `api`
  - Value: `your-ec2-public-ip`

### 2. Frontend (Main Domain)
- In Vercel, go to **Settings > Domains**.
- Add `yourdomain.com`.
- Follow the instructions to add the **A Record** or **CNAME** provided by Vercel.

---

## 🛠 Troubleshooting & Verification

Before running Certbot (SSL), ensure the backend is working correctly on your EC2 instance.

### 1. Verify Backend is Running
Check if the Bun process is serving the API. If you see "Cannot find module", run `bunx prisma generate` first:
```bash
cd apps/api
bunx prisma generate
curl http://localhost:3002/health
# Expected: {"status":"ok"}
```

### 2. Verify Nginx is Proxying
Check if Nginx (port 80) is correctly forwarding requests to the backend:
```bash
curl http://localhost/health
# Expected: {"status":"ok"}
```

### 3. DNS Verification (NXDOMAIN Error)
The Certbot error `NXDOMAIN` means your domain `api-flowai.sparsh.space` isn't pointing to your EC2 IP yet.
- Go to your DNS provider (e.g., Cloudflare, Namecheap, or AWS Route53).
- Create an **A Record**:
  - **Name/Host**: `api-flowai`
  - **Value/Points To**: `[YOUR_EC2_PUBLIC_IP]`
- Wait 5-10 minutes for propagation, then try:
  ```bash
  nslookup api-flowai.sparsh.space
  ```
  It should return your EC2 IP. Once this works, you can re-run the Certbot command.

### 4. Firewall / Security Groups
If you can't access `http://your-ec2-ip` from your browser:
- Ensure **Port 80 (HTTP)** and **Port 443 (HTTPS)** are open in your EC2 Security Group's **Inbound Rules**.
