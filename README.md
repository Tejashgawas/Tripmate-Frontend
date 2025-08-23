# 🌐 TripMate Frontend

TripMate is a **smart group trip planning platform** built to simplify the chaos of traveling with friends.  
This repository contains the **frontend** built with **Next.js** and **Tailwind CSS**, designed for a smooth, responsive, and mobile-friendly user experience.  


## 🌍 Live Demo
LIVE LINK : https://tripmate-v1.vercel.app/
- have a look at the features and please provide feedback in the platfrom after login as general
- (Best viewed on web browser for full UI experience)

## 📚 Learnings

- Building the frontend taught me:
- Leveraging Next.js for optimized, production-ready React apps
- Designing clean, scalable UI with Tailwind CSS
- Handling cross-domain auth headers between frontend and backend
- Integrating Google OAuth smoothly with Next.js frontend & FastAPI backend
- Using AI tools to accelerate frontend development while focusing deeply on backend architecture
---

## 🚀 Features
- **User Authentication**
  - Register & login with Email/Password
  - Google OAuth login integration  

- **Trip Management**
  - Create, view, and manage group trips  
  - Invite friends via trip code or email  

- **Smart Checklist**
  - Auto-generated checklist items  
  - Collaborative updates across the group
    
- **Smart Expense Management**
  - complete expense list
  - All owes and owed moneys are tracked
  - trip specific expenses have their own dashboard
  - each users balance they spend for the trip

- **Smart Itineraries**
  - Custom trip itineraries  
  - Future AI-driven itinerary suggestions  

- **Service Browsing**
  - Explore recommended providers (hotels, venues, transport)  
  - Group voting on preferred options  

---

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/)  
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)  
- **State Management**: React hooks & context  
- **Auth**: Google OAuth + JWT token handling (via backend)  
- **Backend Integration**: REST APIs built with FastAPI  
- **Deployment**: Vercel  

---

### Prerequisites
- Node.js 18+
- Backend running or use this live url https://tripmate-39hm.onrender.com/docs

### Setup
```bash
# Clone repo
git clone https://github.com/Tejashgawas/Tripmate-Frontend.git
cd tripmate-frontend
```

# Install dependencies
```
pnpm install
pnpm build
```
# Run development server
```
pnpm run dev
```

## 📈 Roadmap
-  Notifications (in-app & email)
 - Calendar sync for trips
 - AI-powered trio recommendations
 - Provider advance dashboards for analytics
 - PWA support for app-like mobile experience


## 👨‍💻 Author
Built with ❤️ by Tejas Gawas

# LinkedIn : www.linkedin.com/in/tejash-gawas

## 📜 License

MIT License

