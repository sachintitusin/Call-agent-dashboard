# CallInsight Dashboard

CallInsight is a modern analytics dashboard for monitoring call conversations, outcomes, and friction points.  
The project is designed with a strong emphasis on **UX clarity**, **data storytelling**, and **clean frontend architecture**.

This repository demonstrates how conversation data can be transformed into actionable insights through thoughtful visualization and interaction design.

---

## ✨ Features

### 📊 Conversation Analytics
- **Hourly conversion chart** to identify high‑performing call windows
- **Conversation outcome mix** (successful, escalated, failed, dropped)
- **Drop‑off funnel** showing where conversations lose momentum
- Subtle phase bands to highlight high‑friction stages (e.g. verification)

### 📁 Data Upload Flow
- Upload call event data via **JSON** (dummy data available inside /data folder)
- Email‑based dataset ownership
- Overwrite protection with explicit user confirmation
- Automatic dashboard refresh after successful upload

### 🧠 UX‑Driven Design
- Collapsible sidebar with smooth hover expansion
- Clean card‑based layout with consistent spacing
- Readable, contextual tooltips across charts
- Action‑oriented insights instead of raw metrics

---

## 🛠 Tech Stack

### Frontend
- **React + TypeScript**
- **Vite**
- **Tailwind CSS**
- **Recharts** (data visualization)

### Backend / Data
- **Supabase (PostgreSQL)**
- Supabase **RPC functions** for aggregated analytics
- **Vercel Serverless Functions** for secure API access

---

## 📂 Project Structure

```
src/
  api/              # API helpers (chart data, uploads, checks)
  components/
    charts/         # Recharts-based visualizations
    layout/         # Sidebar, Topbar
    modals/         # Upload modal
  utils/            # Data adapters, validators
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

In production, this should point to your deployed Vercel backend.

### 3. Run locally
```bash
npm run dev
```

---

## 📈 Data Expectations

### Upload format (JSON)

Each upload should contain an array of call events. Example:

```json
[
  {
    "timestamp": "2024-01-12T10:15:00Z",
    "status": "successful",
    "stage": "resolution"
  },
  {
    "timestamp": "2024-01-12T10:18:00Z",
    "status": "failed",
    "stage": "verification"
  }
]
```

The backend validates and aggregates this data before storing it.

---

## 🔒 Architecture & Design Decisions

- **No global state (Redux / Context)**  
  Dashboard refreshes are driven via local state and callbacks for clarity and simplicity.

- **Strict TypeScript where it matters**  
  Business logic and data boundaries are strongly typed.  
  UI‑library callbacks use pragmatic typing when necessary.

- **Layout owns spacing**  
  Chart components are content‑only.  
  Layout components control padding, structure, and visual rhythm.

---

## 🌱 Future Enhancements

- Time‑based comparisons (day‑over‑day, week‑over‑week)
- Agent‑level performance views
- Saved insights and alerts
- Accessibility audit (ARIA roles and keyboard navigation)

---
