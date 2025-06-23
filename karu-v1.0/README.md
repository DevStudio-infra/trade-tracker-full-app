# Kitchen Management App - MVP

A comprehensive restaurant and kitchen management system built with Next.js, Express.js, tRPC, and Clerk authentication.

## 🚀 Features Implemented

### 1. Oracle for Kitchen and Dining Room

- **AI-powered kitchen assistant** using Gemini LLM
- Interactive chat interface for asking questions about:
  - Ingredient substitutions
  - Dietary information (gluten-free, vegan, etc.)
  - Cooking techniques
  - Menu item details
- Context-aware responses based on your menu and recipe data

### 2. Digital Recipe Book

- **Full CRUD operations** for recipes
- Import recipes from files (PDF, DOCX, CSV, images)
- Search and filter functionality
- Public/private recipe management
- Recipe difficulty levels and timing
- Admin vs. staff permissions (view-only for staff)

### 3. Time-Off and Shift Schedule Management

- **AI-suggested scheduling** based on staff availability
- Create and manage shifts for different positions
- Time-off request management with approval workflow
- Visual schedule calendar
- Staff position tracking (Chef, Server, Kitchen Assistant, etc.)

### 4. Menu & Dish Suggestions

- **AI-powered menu suggestions** using your recipe database
- Generate custom menus based on prompts
- Shopping list generation from suggested menus
- Prep list creation for kitchen tasks
- Context-aware suggestions using your ingredients and recipes

### 5. Order Calculation with Production Lists

- **Event order management** with guest count tracking
- Automatic shopping list generation from recipes
- Production schedule creation with time estimates
- Task assignment and priority management
- Cost calculation for events

## 🛠 Tech Stack

### Frontend

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Clerk** for authentication
- **tRPC** for type-safe API calls
- **React Query** for data fetching

### Backend

- **Express.js** with TypeScript
- **tRPC** for API layer
- **Drizzle ORM** with PostgreSQL
- **Clerk** for authentication
- **Google Gemini AI** for Oracle functionality
- **Multer** for file uploads
- **Sharp** for image processing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Clerk account for authentication
- Google AI API key for Gemini

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd kitchen-management-app
npm run install:all
```

2. **Set up environment variables:**

**Backend** (`backend/.env`):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/kitchen_management"
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
NODE_ENV=development
PORT=3001
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

**Frontend** (`frontend/.env.local`):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. **Set up the database:**

```bash
cd backend
npm run db:generate
npm run db:push
```

4. **Start the application:**

```bash
# From the root directory
npm run dev
```

This will start both the backend (port 3001) and frontend (port 3000) simultaneously.

## 📱 Usage

### Getting Started

1. Visit `http://localhost:3000`
2. Sign up/sign in with Clerk
3. Create your organization (multi-tenant support)
4. Start adding recipes to your digital recipe book
5. Use Oracle to ask questions about your menu items
6. Create staff schedules and manage time-off requests
7. Generate AI-powered menu suggestions
8. Manage orders and generate production lists

### Key Workflows

**Recipe Management:**

1. Go to "Recipe Book" → Add Recipe
2. Fill in recipe details or import from files
3. Set recipe as public/private
4. Search and filter your recipe collection

**Oracle Kitchen Assistant:**

1. Go to "Kitchen Oracle"
2. Start a new conversation
3. Ask questions about ingredients, substitutions, dietary info
4. Get AI-powered responses based on your menu context

**Schedule Management:**

1. Go to "Shift Schedule"
2. Create shifts for different staff positions
3. Manage time-off requests
4. View schedule calendar

**Order Management:**

1. Go to "Orders & Production Lists"
2. Create new orders for events
3. Add recipes to orders
4. Generate shopping and production lists automatically

## 🏗 Architecture

### Multi-Tenant Structure

- **Organization-based tenancy** using Clerk
- All data scoped to organization ID
- Admin/staff role-based permissions
- Secure data isolation between organizations

### API Structure

- **Type-safe APIs** with tRPC
- Real-time validation with Zod schemas
- Comprehensive error handling
- Authentication middleware for all protected routes

### Database Schema

- **PostgreSQL** with Drizzle ORM
- Multi-tenant architecture with organizationId
- Full recipe management with ingredients and instructions
- Schedule management with staff positions
- Chat history and AI conversation storage
- Order and production list management

## 🎨 Design System

- **Modern Brutalism** design style
- **Color Scheme:** White, black, gray with burnt orange accent
- **Light/Dark Mode** toggle support
- **Responsive Design** for mobile and desktop
- **Accessibility** compliant components

## 🔧 Development

### Available Scripts

```bash
# Start both frontend and backend
npm run dev

# Start individual services
npm run dev:frontend
npm run dev:backend

# Build for production
npm run build

# Install all dependencies
npm run install:all
```

### Project Structure

```
├── backend/                 # Express.js backend
│   ├── db/                 # Database schema and config
│   ├── services/           # Business logic services
│   ├── repositories/       # Data access layer
│   ├── trpc/              # tRPC router and procedures
│   └── uploads/           # File upload directory
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # Reusable UI components
│   │   ├── features/     # Feature-specific components
│   │   └── providers/    # Context providers
└── package.json          # Root package with concurrently
```

## 📋 MVP Status

### ✅ Completed Features

- [x] Oracle kitchen assistant with AI chat
- [x] Digital recipe book with CRUD operations
- [x] Shift schedule management
- [x] Menu suggestions with AI generation
- [x] Order management with production lists
- [x] Multi-tenant authentication with Clerk
- [x] Responsive UI with theme support
- [x] File upload for recipes
- [x] Search and filtering capabilities

### 🚧 Future Enhancements

- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Advanced reporting and analytics
- [ ] Inventory management integration
- [ ] Third-party POS system integration
- [ ] Advanced AI scheduling optimization
- [ ] Recipe cost calculation
- [ ] Staff performance tracking

## 🤝 Contributing

This is an MVP implementation. For production use, consider:

- Adding comprehensive error boundaries
- Implementing proper logging and monitoring
- Adding unit and integration tests
- Setting up CI/CD pipelines
- Implementing proper caching strategies
- Adding rate limiting and security measures

## 📄 License

MIT License - see LICENSE file for details.
