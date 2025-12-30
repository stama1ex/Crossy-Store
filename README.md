<div align="center">
  <img src="https://res.cloudinary.com/dcxsimayu/image/upload/v1754770763/logo_jkievt.png" alt="Crossy Logo" width="80" />
  <h1>Crossy - Modern Sneaker E-Commerce Platform</h1>
  <p>
    <strong>A production-ready, full-stack e-commerce application built with Next.js 15, TypeScript, and PostgreSQL</strong>
  </p>
  <p>
    <a href="https://crossy-store.vercel.app/" target="_blank"><strong>🚀 View Live Demo »</strong></a>
  </p>
  <p>
    <a href="#-key-features">Features</a> ·
    <a href="#-tech-stack">Tech Stack</a> ·
    <a href="#-getting-started">Getting Started</a> ·
    <a href="#-architecture">Architecture</a> ·
    <a href="#-performance">Performance</a>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-15.4-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-6.13-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-Latest-316192?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  </p>
</div>

---

## 📖 Overview

**Crossy** is a modern, production-ready e-commerce platform showcasing best practices in full-stack web development. Built for sneaker enthusiasts, it demonstrates enterprise-level features including advanced authentication, real-time state management, optimistic UI updates, comprehensive caching strategies, and a seamless checkout experience.

This project serves as a comprehensive example of building scalable web applications with the latest technologies, featuring server-side rendering for optimal performance and SEO, progressive enhancement for accessibility, and a mobile-first responsive design.

<div align="center">
  <h3>📸 Application Preview</h3>
  <a href="https://crossy-store.vercel.app/" target="_blank">
    <img src="https://res.cloudinary.com/dcxsimayu/image/upload/v1754771712/eb5c4669-b25e-44e3-8846-529f9a078925.png" alt="Homepage Preview" width="100%" />
  </a>
  <br/><br/>
  <a href="https://crossy-store.vercel.app/" target="_blank">
    <img src="https://res.cloudinary.com/dcxsimayu/image/upload/v1754771790/fec61448-043a-465a-905e-cda05af3f2c7.png" alt="Product Page Preview" width="100%" />
  </a>
</div>

## ✨ Key Features

### 🛒 E-Commerce Core Features

- **Dynamic Product Catalog**
  - Sneakers organized by brand with detailed product pages
  - High-quality images with lazy loading and optimization
  - Detailed product descriptions and specifications
- **Advanced Filtering & Search**

  - Real-time product filtering by color, gender, and price range
  - URL-synced filter state for shareable links
  - Debounced live search with instant database queries
  - Sort by price, popularity, and newest arrivals

- **Shopping Cart System**

  - Persistent cart with Zustand state management
  - Add, remove, and update item quantities
  - Size selection and validation
  - Cart synchronization across browser tabs
  - Real-time price calculations

- **Wishlist (Favorites)**

  - Add products to favorites with one click
  - Optimistic UI updates for instant feedback
  - Cross-tab synchronization
  - Persistent storage with smart caching

- **Secure Checkout Flow**

  - Multi-step checkout process
  - Order validation and error handling
  - Order confirmation and history tracking

- **Product Reviews & Comments**
  - Users can leave, edit, and delete comments
  - Real-time comment updates
  - Authenticated comment system

### 🔐 Authentication & User Management

- **Multi-Provider Authentication**

  - Email/password with secure bcrypt hashing
  - Google OAuth integration
  - GitHub OAuth integration
  - Session management with NextAuth.js

- **Email Verification System**

  - Secure registration with email verification
  - Verification code generation and validation
  - Resend verification email functionality
  - Automatic cleanup of expired codes

- **User Profile Management**

  - Update username, full name, and password
  - Custom avatar upload to Cloudinary
  - Avatar image optimization and transformation
  - Profile privacy and security settings

- **Protected Routes**
  - Server-side route protection with middleware
  - Client-side auth guards
  - Automatic redirects for unauthorized access

### ⚡ Performance & Technical Excellence

- **Server-Side Rendering (SSR)**

  - SSR for homepage and product pages
  - Optimal Time to First Byte (TTFB)
  - SEO-friendly metadata generation
  - JSON-LD structured data for rich search results

- **Advanced Caching Strategy**

  - Next.js `unstable_cache` for data fetching
  - Tag-based cache revalidation
  - On-demand revalidation for real-time updates
  - LocalStorage caching with TTL

- **Optimistic UI Updates**

  - Instant feedback for user interactions
  - Rollback on error scenarios
  - Seamless synchronization with server state

- **Modern UI/UX**
  - Fully responsive mobile-first design
  - Dark/Light theme with system preference detection
  - Smooth animations with Framer Motion
  - Accessible components with ARIA labels
  - Loading states and skeleton screens

## 🛠️ Tech Stack

### Frontend

- **Framework:** Next.js 15.4 with App Router
- **Language:** TypeScript 5.0
- **UI Library:** React 19.1
- **Styling:** Tailwind CSS 4.1, shadcn/ui, daisyUI
- **State Management:** Zustand with persist middleware
- **Animations:** Framer Motion
- **Theme:** next-themes with dark/light mode

### Backend

- **Runtime:** Node.js with Next.js API Routes
- **ORM:** Prisma 6.13
- **Database:** PostgreSQL
- **Authentication:** NextAuth.js 4.24 with JWT
- **Email:** Nodemailer with Gmail SMTP
- **Image Storage:** Cloudinary

### Development Tools

- **Package Manager:** npm
- **Linting:** ESLint with Next.js config
- **Type Checking:** TypeScript strict mode
- **Version Control:** Git

### Deployment & Infrastructure

- **Hosting:** Vercel
- **Database Hosting:** PostgreSQL (Vercel Postgres / Neon / Supabase)
- **CDN:** Cloudinary for images
- **CI/CD:** Vercel automatic deployments

| Category          | Technologies                                                                                                                                                                                                                                                                                                                                   |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**     | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)                                                                                                                                 |
| **Backend**       | ![NextAuth.js](https://img.shields.io/badge/NextAuth.js-000?style=for-the-badge&logo=nextauth.js&logoColor=fff) ![Nodemailer](https://img.shields.io/badge/Nodemailer-2A7D2E?style=for-the-badge&logo=nodemailer&logoColor=white)                                                                                                              |
| **Database/ORM**  | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)                                                                                                                        |
| **Styling**       | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white) ![daisyUI](https://img.shields.io/badge/daisyUI-199652?style=for-the-badge&logo=daisyui&logoColor=white) |
| **State Mgmt**    | ![Zustand](https://img.shields.io/badge/Zustand-3B3B3B?style=for-the-badge)                                                                                                                                                                                                                                                                    |
| **Image Hosting** | ![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)                                                                                                                                                                                                                              |
| **Deployment**    | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)                                                                                                                                                                                                                                          |
| **Language**      | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)                                                                                                                                                                                                                              |

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or later ([Download](https://nodejs.org/))
- **npm** 10.x or later (comes with Node.js)
- **PostgreSQL** database instance (local or cloud-hosted)
- **Git** for version control

You'll also need accounts for:

- [Cloudinary](https://cloudinary.com/) - For image storage
- [Google Cloud Console](https://console.cloud.google.com/) - For Google OAuth (optional)
- [GitHub Developer Settings](https://github.com/settings/developers) - For GitHub OAuth (optional)

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/stama1ex/Crossy-Store.git
cd Crossy-Store
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Database Configuration
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
POSTGRES_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_hex_32

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email SMTP (Gmail example)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

<details>
<summary>📝 <strong>How to get credentials</strong></summary>

**Database (PostgreSQL):**

- Local: [PostgreSQL Installation Guide](https://www.postgresql.org/download/)
- Cloud: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) | [Neon](https://neon.tech/) | [Supabase](https://supabase.com/)

**NextAuth Secret:**

```bash
openssl rand -hex 32
```

**Google OAuth:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**GitHub OAuth:**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

**Gmail SMTP:**

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

**Cloudinary:**

1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Get credentials from Dashboard

</details>

#### 4. Initialize Database

Push the Prisma schema to your database:

```bash
npx prisma db push
```

Or use migrations for production:

```bash
npx prisma migrate dev --name init
```

#### 5. Seed the Database

Populate the database with initial data (brands and products):

```bash
npm run prisma:seed
```

#### 6. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 🎯 Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:push  # Push schema to database
npm run prisma:studio # Open Prisma Studio (DB GUI)
npm run prisma:seed  # Seed database with initial data
```

## 📂 Project Structure

The project follows Next.js 15 App Router conventions with a modular, scalable architecture:

```plaintext
📦 crossy/
├── 📂 app/                      # Next.js App Router
│   ├── 📂 (home)/               # Homepage route group
│   │   ├── layout.tsx           # Home-specific layout
│   │   └── page.tsx             # Landing page (SSR)
│   ├── 📂 (other)/              # Other pages route group
│   │   ├── layout.tsx           # Shared layout for authenticated pages
│   │   ├── 📂 cart/             # Shopping cart
│   │   ├── 📂 checkout/         # Checkout flow
│   │   ├── 📂 favorites/        # User's wishlist
│   │   ├── 📂 login/            # Authentication pages
│   │   ├── 📂 register/
│   │   ├── 📂 shoe/[id]/        # Dynamic product pages (SSR)
│   │   ├── 📂 user/[username]/  # User profiles
│   │   └── 📂 orders/           # Order history
│   ├── 📂 api/                  # API Routes
│   │   ├── 📂 auth/             # NextAuth handlers
│   │   ├── 📂 cart/             # Cart operations
│   │   ├── 📂 favorites/        # Favorites CRUD
│   │   ├── 📂 orders/           # Order management
│   │   ├── 📂 shoes/            # Product queries
│   │   ├── 📂 user/             # User profile updates
│   │   └── 📂 verify/           # Email verification
│   ├── 📂 actions/              # Server Actions
│   │   └── comments.ts          # Comment operations
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── not-found.tsx            # 404 page
│
├── 📂 components/               # React components
│   ├── 📂 auth/                 # Authentication components
│   │   ├── auth-guard.tsx       # Route protection HOC
│   │   ├── login-form.tsx
│   │   └── register-form.tsx
│   ├── 📂 providers/            # Context providers
│   │   ├── favorites-provider.tsx
│   │   └── providers.tsx        # Root providers wrapper
│   ├── 📂 shared/               # Shared business components
│   │   ├── add-to-cart-button.tsx
│   │   ├── cart-button.tsx
│   │   ├── favorite-button.tsx
│   │   ├── filters.tsx
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── shoe-card.tsx
│   │   └── 📂 checkout/
│   └── 📂 ui/                   # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ...
│
├── 📂 lib/                      # Utility libraries
│   ├── auth.ts                  # NextAuth configuration
│   ├── cloudinary.ts            # Cloudinary setup
│   ├── utils.ts                 # Helper functions
│   └── 📂 auth/
│       └── auth-utils.ts        # Auth helpers (hashing, etc.)
│
├── 📂 prisma/                   # Database layer
│   ├── schema.prisma            # Database schema
│   ├── seed.ts                  # Seed data script
│   ├── prisma-client.ts         # Prisma client instance
│   └── shoe-models.config.ts    # Product configuration
│
├── 📂 store/                    # Zustand state management
│   ├── favorites.ts             # Favorites store
│   ├── cart.ts                  # Cart store
│   └── filters.ts               # Filter state
│
├── 📂 services/                 # API client layer
│   ├── api-client.ts            # Base API client
│   ├── instance.ts              # Axios instance
│   └── shoes.ts                 # Product API calls
│
├── 📂 hooks/                    # Custom React hooks
│   ├── use-favorites-loader.ts
│   └── use-session.ts
│
├── 📂 public/                   # Static assets
│   ├── 📂 brand-logos/
│   └── 📂 brand-pics/
│
├── .env.example                 # Environment variables template
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
└── package.json                 # Dependencies
```

### Key Architecture Decisions

**Route Groups:** Using `(home)` and `(other)` route groups for logical separation without affecting URL structure.

**Colocation:** Components, hooks, and utilities are organized by feature, making the codebase easier to navigate.

**API Layer:** Separation between API routes (`/api`), server actions (`/actions`), and client services (`/services`).

**State Management:** Zustand for client state, with persistence and optimistic updates where needed.

**Database:** Prisma ORM with PostgreSQL for type-safe database queries and migrations.

## 🏗️ Architecture Highlights

### Data Flow

1. **Client → Services:** React components call service functions
2. **Services → API Routes:** Axios instance makes HTTP requests
3. **API Routes → Prisma:** Server-side database queries
4. **Prisma → PostgreSQL:** Type-safe SQL operations

### Caching Strategy

- **Server-Side:** Next.js `unstable_cache` with tag-based revalidation
- **Client-Side:** LocalStorage with TTL for favorites and cart
- **CDN:** Cloudinary for optimized image delivery

### Authentication Flow

1. User submits credentials via form
2. NextAuth validates against database (or OAuth provider)
3. JWT token generated and stored in secure HTTP-only cookie
4. Token validated on protected routes via middleware
5. Session available via `useSession` hook client-side

## ⚡ Performance

### Metrics

- **Lighthouse Score:** 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s

### Optimizations Applied

- ✅ Server-Side Rendering for critical pages
- ✅ Image optimization with Next.js Image component
- ✅ Code splitting and lazy loading
- ✅ Debounced search and filtering
- ✅ Optimistic UI updates
- ✅ Request deduplication
- ✅ Database query optimization with Prisma
- ✅ CDN-based image delivery (Cloudinary)
- ✅ Compression and minification in production

## 🎨 Design System

- **Component Library:** shadcn/ui + daisyUI for consistent UI primitives
- **Typography:** System fonts with fallbacks for optimal performance
- **Color Palette:** CSS variables for theme switching
- **Spacing:** Tailwind's utility-first approach
- **Animations:** Framer Motion for smooth transitions

## 🔒 Security

- ✅ Bcrypt password hashing
- ✅ JWT-based authentication with HTTP-only cookies
- ✅ CSRF protection via NextAuth
- ✅ SQL injection prevention via Prisma
- ✅ XSS protection through React's built-in escaping
- ✅ Environment variables for sensitive data
- ✅ Secure file upload validation
- ✅ Rate limiting considerations

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables
4. Deploy!

Vercel automatically:

- Builds your Next.js app
- Sets up CDN and edge caching
- Configures automatic HTTPS
- Provides preview deployments for PRs

### Database Migration

```bash
# Production migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Stanislav** - [GitHub](https://github.com/stama1ex)

---

<div align="center">
  <p>⭐ Star this repository if you find it helpful!</p>
  <p>
    <a href="https://crossy-store.vercel.app/" target="_blank">View Live Demo</a> · 
    <a href="https://github.com/stama1ex/Crossy-Store/issues">Report Bug</a> · 
    <a href="https://github.com/stama1ex/Crossy-Store/issues">Request Feature</a>
  </p>
</div>
