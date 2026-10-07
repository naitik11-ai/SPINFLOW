# SpinFlow - Smart Hostel Washing Machine Slot & Queue Management

SpinFlow is a high-reliability, real-time washing machine reservation and management system engineered specifically for university and college hostels. It solves common hostel laundry challenges with fair weekly quota distribution, strict identity verification, physical QR sticker verification, and comprehensive administrator analytics.

---

## Key Features

1. **Strict 3-Way Identity Verification**:
   - Every booking verifies student **Name + Room Number + Phone Number** against the pre-loaded 105-student hostel master directory.
   - Any mismatch (e.g. `Harsh` entering Room `102` instead of `101`) is immediately blocked.

2. **Fair Weekly 1-Slot Quota Lock**:
   - 105 students sharing 1 active front-load machine (scalable to multiple units).
   - Each resident can book exactly 1 slot per 7 days.
   - Once a wash is booked or completed, the system locks their quota for 7 days with live unlock countdowns.

3. **12 Fixed Daily Time Slots (06:00 AM – 12:00 AM Midnight)**:
   - Operating 18 hours daily with 1h 30m slots (`06:00-07:30`, `07:30-09:00`, `09:00-10:30`, ..., `22:30-00:00`).
   - 65-minute active wash cycle followed by 25-minute cooldown and collection window.

4. **Hard Slot Boundary & Late Arrival QR Activation**:
   - Students scan the physical QR sticker on the washing machine to start their wash.
   - If a resident arrives 15 minutes late into a slot (e.g. at 06:15 for a 06:00-07:30 slot), the wash timer starts at `01:15:00` and strictly terminates at `07:30:00`, preventing any overlap into the next student's slot.

5. **Secure Admin Portal & Student Usage Logs**:
   - Admin access is restricted to authorized phone numbers (`ADMIN_PHONE_NUMBERS`) + 4-digit Security OTP.
   - Normal students do **not** need OTP login to reserve slots.
   - Admin can view per-student total usage hours/minutes, complete time logs, manual weekly quota resets, and 1-click CSV audit report exports.

---

## Production Deployment Guide

### Option A: 1-Click Deploy to Vercel (Recommended)

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial SpinFlow deployment commit"
   git branch -M main
   git remote add origin https://github.com/your-username/spinflow-hostel.git
   git push -u origin main
   ```
2. Open [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `spinflow-hostel` GitHub repository.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-key`
   - `VITE_ADMIN_PHONE_NUMBERS`: `9876543210,9999999999`
5. Click **Deploy**. Vercel will automatically build and publish your live production URL.

---

### Option B: Deploy to Netlify

1. Drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop), or connect your GitHub repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set environment variables in **Site settings > Environment variables**.

---

### Option C: Database Setup (Supabase PostgreSQL)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab in the Supabase Dashboard.
3. Open `supabase_schema.sql` from this project, copy the entire SQL script, and paste it into the editor.
4. Click **Run**. This will create the `machines`, `bookings`, and `wash_history` tables, indexes, and Realtime publication replication.
5. Go to **Project Settings > API** and copy your **Project URL** and **anon public key** into your `.env` or Vercel Environment Variables.

---

## Local Development & Testing

```bash
# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Run production build
npm run build

# Preview production build locally
npm run preview
```

---

## Default Administrator Credentials

- **Authorized Admin Phone**: `9876543210` or `9999999999`
- **Security OTP**: Auto-generated 4-digit code (also accepts `1234` in demo mode)
