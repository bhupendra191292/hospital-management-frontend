# 🏥 Hospital Management System - Frontend

A modern, responsive React-based frontend for the Hospital Management System built with Vite, TypeScript, and modern web technologies.

## 🚀 Features

- **Multi-role Dashboard**: Admin, Super Admin, Doctor, Nurse, Receptionist, Patient
- **Patient Management**: Registration, profiles, medical records
- **Doctor Management**: Doctor profiles, schedules, approvals
- **Appointment System**: Booking, scheduling, management
- **Real-time Notifications**: Toast notifications and bell alerts
- **Responsive Design**: Mobile-first approach with modern UI
- **Role-based Access Control**: Secure permission system
- **Analytics & Reports**: Comprehensive reporting dashboard
- **Billing Management**: Payment tracking and invoicing

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **CSS3** - Modern styling with custom properties
- **Axios** - HTTP client for API communication
- **Vitest** - Testing framework
- **ESLint** - Code linting and formatting

## 📦 Installation

```bash
# Clone the repository
git clone <your-frontend-repo-url>
cd hospital-management-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=Hospital Management System
VITE_APP_VERSION=1.0.0
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── __tests__/      # Component tests
│   ├── forms/          # Form components
│   └── ...
├── NewFlow/            # Main application modules
│   ├── components/     # Feature components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── services/       # API services
│   └── utils/          # Utility functions
├── pages/              # Page components
├── services/           # API services
├── store/              # State management
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔐 Authentication & Roles

The system supports multiple user roles:

- **Super Admin** 👑 - Full system access
- **Admin** 👨‍💼 - Hospital management
- **Doctor** 👨‍⚕️ - Medical staff
- **Nurse** 👩‍⚕️ - Nursing staff
- **Receptionist** 👩‍💼 - Front desk
- **Patient** 👤 - Patient portal
- **Lab Tech** 🧪 - Laboratory staff
- **Pharmacist** 💊 - Pharmacy staff

## 🎨 UI Components

- **Modal System**: Reusable modal components
- **Form Components**: Validated form inputs
- **Dashboard Cards**: Information display cards
- **Navigation**: Sidebar and header navigation
- **Loading States**: Professional loading animations
- **Notifications**: Toast and bell notifications

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive tablet layouts
- **Desktop**: Full desktop experience
- **Touch Friendly**: Touch-optimized interactions

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build the project
npm run build

# Deploy dist/ folder to Netlify
```

### Docker
```bash
# Build Docker image
docker build -t hospital-frontend .

# Run container
docker run -p 3000:3000 hospital-frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@hospitalmanagement.com or create an issue in the repository.

## 🔗 Related

- [Backend Repository](https://github.com/yourusername/hospital-management-backend)
- [API Documentation](https://api-docs.hospitalmanagement.com)
- [Live Demo](https://demo.hospitalmanagement.com)

---

**Built with ❤️ for better healthcare management**

