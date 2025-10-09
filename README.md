# LabMate360: AI-Powered Smart Clinical Laboratory Software

A modern, responsive frontend application for clinical laboratory management built with React, Tailwind CSS, and Framer Motion.

## 🚀 Features

- **Modern Landing Page**: Clean, healthcare-focused design with hero section, features, and contact information
- **Role-Based Authentication**: Mock login system with role-based redirects (Admin, Staff, User)
- **Responsive Dashboards**: Three distinct dashboard interfaces tailored for different user roles
- **Smooth Animations**: Subtle Framer Motion animations throughout the application
- **Mobile-First Design**: Fully responsive design that works on all devices

## 🏗️ Architecture

### Tech Stack
- **React 19.1.1** - Modern React with hooks and functional components
- **React Router DOM** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Framer Motion** - Production-ready motion library for React
- **Lucide React** - Beautiful, customizable SVG icons

### Project Structure
```
src/
├── components/
│   ├── common/
│   │   └── PlaceholderPage.jsx    # Reusable placeholder component
│   └── dashboard/                 # Dashboard-specific components
├── layouts/
│   └── DashboardLayout.jsx        # Shared dashboard layout
├── pages/
│   ├── LandingPage.jsx            # Landing page with hero section
│   ├── Login.jsx                  # Authentication page
│   ├── AdminDashboard.jsx         # Administrator dashboard
│   ├── StaffDashboard.jsx         # Laboratory staff dashboard
│   └── UserDashboard.jsx          # Patient/user dashboard
├── App.jsx                        # Main app component with routing
└── main.jsx                       # Application entry point
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones (#3b82f6 - #1e3a8a)
- **Secondary**: Gray tones (#f8fafc - #0f172a)
- **Healthcare Theme**: Clean, professional design with medical blue accents

### Typography
- **Font**: Inter (Google Fonts)
- **Hierarchy**: Clear typography scale for optimal readability

## 🔐 User Roles & Access

### Administrator (`/admin/dashboard`)
- Dashboard Overview
- Manage Tests & Packages
- Manage Labs
- Manage Users & Staff
- View Bookings
- Reports & Analytics
- Settings

### Laboratory Staff (`/staff/dashboard`)
- Assigned Bookings
- Upload Reports
- Prescription Handling
- Patient Communication

### Patient/User (`/user/dashboard`)
- Book Tests
- Upload Prescription
- My Bookings
- Download Reports
- Nearby Labs
- Support

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd labmate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Demo Credentials

The application includes mock authentication with the following demo credentials:

- **Administrator**: `admin@labmate360.com` / `password123`
- **Staff**: `staff@labmate360.com` / `password123`
- **User**: `user@labmate360.com` / `password123`

## 🎯 Key Features

### Landing Page
- Responsive hero section with call-to-action
- Feature showcase with animated cards
- About section with statistics
- Professional footer with contact information

### Login System
- Clean, accessible login form
- Role-based authentication logic
- Form validation and error handling
- Loading states and animations

### Dashboard System
- Collapsible sidebar navigation
- Responsive mobile-friendly design
- User profile menu with logout functionality
- Consistent layout across all dashboards

### Animations
- Fade-in animations for page loads
- Hover effects on interactive elements
- Smooth transitions between states
- Loading animations for better UX

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality
- ESLint configuration for React best practices
- Consistent code formatting
- Component-based architecture
- Reusable component patterns

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full sidebar navigation and multi-column layouts
- **Tablet**: Collapsible sidebar with touch-friendly interactions
- **Mobile**: Hamburger menu and single-column layouts

## 🔮 Future Enhancements

This is a frontend-only implementation. Future backend integration will include:
- Real authentication and authorization
- Database connectivity
- API integration
- Real-time notifications
- File upload functionality
- Payment processing

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**LabMate360** - Revolutionizing clinical laboratory management with AI-powered technology.