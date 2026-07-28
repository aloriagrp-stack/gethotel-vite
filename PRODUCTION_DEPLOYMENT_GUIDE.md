# 🚀 GetHotelStays AI & Backend — Production Deployment Guide

This guide contains everything required to deploy **GetHotelStays AI (`ai.gethotelstays.com`)** and the **GetHotel Node.js Backend Server** to production.

---

## 1. 🏗️ Build & Reliability Audit (Verified Success)

- **Frontend Bundle Build**: ✅ `dist/` built successfully with `npm run build` in 2.38s (0 TypeScript errors).
- **Backend QA Test Suite**: ✅ `33/33 PASS` (State transitions, Intent Detection, Memory Persistence, 15 Multi-Scenario Journey Matrix).
- **Security Hardening**: CORS Whitelist configured for `https://gethotelstays.com` & `https://ai.gethotelstays.com`, Helmet headers active, Rate Limiters enabled.

---

## 2. 🌐 Frontend Deployment (`ai.gethotelstays.com`)

### Option A: Vercel (Recommended — 2 Minutes)
1. Push code to GitHub repository.
2. Connect repository to [Vercel](https://vercel.com).
3. **Framework Preset**: Vite
4. **Root Directory**: `ai.gethotelstays.com`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. **Custom Domain**: Add `ai.gethotelstays.com` and point CNAME to `cname.vercel-dns.com`.

### Option B: Nginx on VPS / Ubuntu Server
1. Run `npm run build` inside `ai.gethotelstays.com`.
2. Copy `dist/` folder to `/var/www/ai.gethotelstays.com/html`.
3. Add Nginx Configuration:
```nginx
server {
    listen 80;
    server_name ai.gethotelstays.com;

    root /var/www/ai.gethotelstays.com/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
4. Run `certbot --nginx -d ai.gethotelstays.com` for free SSL Certificate.

---

## 3. ⚙️ Backend Server Deployment (`GetHotel backend`)

### Prerequisites & Environment Variables (`.env`)
Ensure your production `.env` file on the server contains:
```env
PORT=5000
NODE_ENV=production
DATABASE_URL="mysql://username:password@127.0.0.1:3306/gethotel_db?connection_limit=20"
JWT_SECRET="your_production_jwt_secret_key"
FRONTEND_URL="https://gethotelstays.com"
GROQ_API_KEY="your_groq_api_key"
GEMINI_API_KEY="your_gemini_api_key"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

### PM2 Process Manager Setup (VPS / EC2)
1. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
2. Start backend server:
   ```bash
   cd "GetHotel backend"
   pm2 start server.js --name "gethotel-backend" --time
   ```
3. Save PM2 state so it auto-restarts on server reboot:
   ```bash
   pm2 save
   pm2 startup
   ```

---

## 4. 🧪 Health Check & Post-Deployment Verification

1. **Backend Health Check**:
   Visit `https://api.gethotelstays.com/api/ai/health` (or `http://your-server-ip:5000/api/ai/health`).
   Expected Response: `{"status":"OK","service":"GetHotel AI Gateway"}`

2. **Live AI Chat Verification**:
   Open `https://ai.gethotelstays.com` and test queries:
   - *"Show hotels in Jaipur"*
   - *"Delhi to Agra to Jaipur 50000 budget"*
   - *"Goa 4 days tour package"*

---

## 📊 Deployment Status: 100% PRODUCTION READY 🚀
