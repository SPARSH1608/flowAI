# Quick Deploy

## Prerequisites
- Docker & Docker Compose
- Environment file (`.env`)

## Deployment Steps
1. **Clone & Setup**:
   ```bash
   git clone <repo-url>
   cd ai-ads
   cp .env.docker.example .env
   ```

2. **Configure**:
   Edit `.env` and set `NEXT_PUBLIC_API_URL` to your server's public IP/Domain.

3. **Launch**:
   ```bash
   docker compose up -d --build
   ```

## Services
- **Frontend**: Port 3000
- **Backend**: Port 3002
- **Database**: Port 5432 (Internal)
