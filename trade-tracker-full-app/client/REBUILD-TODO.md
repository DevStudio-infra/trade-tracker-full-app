# Trade Tracker Rebuild TODO List

## Core Features to Rebuild

### 1. Trading Chart Analysis Page (`/dashboard/capture`)

- [x] Screen capture component (Copilot)
  - [x] Window selection functionality
  - [x] Screenshot capture and preview
  - [x] Error handling and toast notifications
- [x] Analysis form
  - [x] Text input field for analysis prompt
  - [x] Analysis trigger button
  - [x] Loading states
- [x] Analysis display
  - [x] Markdown rendering of AI response
  - [x] Proper styling and formatting
- [x] Integration with Gemini AI
  - [x] Image and text processing
  - [x] API route for analysis
  - [x] Error handling

### 2. Credits System

- [x] Credits management pages
  - [x] Credit balance display
  - [x] Purchase credits interface
  - [x] Credit history table
- [x] Credit pricing
  - [x] Base price: 0.22€ per credit
  - [x] Minimum purchase: 6€ (~27 credits)
  - [x] Maximum purchase: 1000€ (~4545 credits)
  - [x] 40% discount for subscribers
- [x] Credit transaction handling
  - [x] Purchase flow
  - [x] Usage tracking
  - [x] Transaction history

### 3. Billing and Subscription

- [x] Subscription plans
  - [x] Free tier (6 credits/month)
  - [x] Pro tier (100 credits/month)
- [x] Billing page
  - [x] Current plan display
  - [x] Upgrade/downgrade options
  - [x] Payment history
- [x] Stripe integration
  - [x] Payment processing
  - [x] Webhook handling
  - [x] Subscription management

### 4. Contact Page

- [x] Contact form
  - [x] Name, email, message fields
  - [x] Form validation
  - [x] Email submission
- [x] Contact information display
  - [x] Support email
  - [x] Social media links
- [x] Success/error notifications

### 5. Pricing Page

- [x] Plan comparison
  - [x] Feature comparison table
  - [x] Pricing details
  - [x] Subscription benefits
- [x] Pricing cards
  - [x] Monthly/yearly toggle
  - [x] Subscription discount display
  - [x] Call-to-action buttons
- [x] FAQ section

## Current Priorities

### 1. Analysis Enhancement (Highest Priority)

- [ ] Add support for multiple timeframes
- [ ] Implement chart pattern recognition
- [ ] Add market context analysis
- [ ] Improve risk assessment calculations

### 2. User Experience Improvements

- [x] Add analysis history view
- [x] Implement session management
- [ ] Add export functionality
- [ ] Improve error messages and feedback

### 3. Performance Optimization

- [ ] Implement caching for analysis results
- [ ] Optimize image processing
- [ ] Add loading skeletons
- [ ] Improve response times

## Components to Rebuild

### UI Components

- [x] Markdown renderer
  - [x] Custom styling for different elements
  - [x] Code block formatting
  - [x] List styling
- [ ] Screen capture tool
  - [ ] Window selection UI
  - [ ] Preview component
- [x] Credit purchase slider
  - [x] Amount selection
  - [x] Credit calculation
  - [x] Price display
- [x] Transaction history table
  - [x] Status indicators
  - [x] Date formatting
  - [x] Type icons

### Layout Components

- [x] Dashboard layout
  - [x] Sidebar navigation
  - [x] Header
  - [x] Content area
- [x] Marketing layout
  - [x] Navigation bar
  - [x] Footer
  - [x] Page containers

## API Routes to Implement

### Analysis

- [x] `/api/analyze`
  - [x] Image processing
  - [x] Gemini AI integration
  - [x] Credit deduction

### Credits

- [x] `/api/credits/purchase`
  - [x] Stripe integration
  - [x] Credit allocation
- [x] `/api/credits/history`
  - [x] Transaction listing
  - [x] Filtering options

### Billing

- [x] `/api/billing/subscribe`
  - [x] Plan management
  - [x] Payment processing
- [x] `/api/webhooks/stripe`
  - [x] Payment confirmation
  - [x] Subscription updates

## Database Schema Updates

- [x] User credits table
- [x] Transaction history
- [x] Subscription details
- [x] Analysis history

## Testing

- [ ] Credit system tests
- [ ] Payment processing tests
- [ ] Analysis functionality tests
- [ ] Component unit tests

## Documentation

- [x] API documentation
- [x] Component documentation
- [x] Setup instructions
- [x] Environment variables list

## Design System

### Color Palette

- Primary Colors:
  - Blue: `bg-blue-500` (Brand color, used for primary actions and highlights)
  - Background: `bg-background` (System theme aware)
  - Muted: `bg-muted` (Secondary backgrounds)
  - Foreground: `text-foreground` (Primary text)
  - Muted Foreground: `text-muted-foreground` (Secondary text)

### Typography

- Font Families:
  - Primary: "Inter" (Body text)
  - Urban: "Urban" (Headings and brand text)
- Font Sizes:
  - Headings:
    - h1: `text-3xl md:text-4xl lg:text-[40px]`
    - h2: `text-2xl font-bold`
    - h3: `text-xl font-bold`
  - Body: `text-sm` or `text-base`
  - Small text: `text-xs`

### Component Styling

- Cards:
  - Primary: `rounded-lg border bg-card p-6 shadow-sm`
  - Gradient: `from-blue-50 to-blue-100 bg-gradient-to-br dark:from-blue-900/10 dark:to-blue-900/20`
- Buttons:
  - Primary: `bg-blue-500 hover:bg-blue-600 text-white`
  - Secondary: `bg-secondary hover:bg-secondary/80`
  - Ghost: `hover:bg-muted`
  - Rounded variants: `rounded-full` or `rounded-lg`
- Forms:
  - Inputs: `rounded-md border bg-background px-3 py-2`
  - Labels: `text-sm font-medium text-foreground`
  - Error messages: `text-sm text-red-600`

### Layout Spacing

- Container max widths:
  - Default: `max-w-6xl`
  - Narrow: `max-w-4xl`
- Spacing:
  - Section gaps: `space-y-6` or `space-y-8`
  - Component padding: `p-4` or `p-6`
  - Grid gaps: `gap-4` or `gap-6`

### UI Elements

- Icons:
  - Size: `size-4` (small) or `size-5` (medium)
  - Colors: Inherit from text color or specific brand colors
- Shadows:
  - Cards: `shadow-sm`
  - Dropdowns: `shadow-md`
- Borders:
  - Default: `border border-border`
  - Focus: `ring-2 ring-ring ring-offset-2`

### Interactive States

- Hover effects:
  - Links: `hover:text-foreground/80`
  - Buttons: `hover:bg-primary/90`
  - Cards: `hover:bg-muted/50`
- Active/Selected:
  - Navigation: `bg-muted`
  - Buttons: `active:scale-95`
- Disabled:
  - Opacity: `opacity-50`
  - Cursor: `cursor-not-allowed`

### Responsive Design

- Breakpoints:
  - Mobile first approach
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
- Layout changes:
  - Stack to grid: `grid md:grid-cols-2`
  - Hide/show: `hidden md:block`
  - Font sizes: `text-sm md:text-base`

### Animation

- Transitions:
  - Default: `transition-all duration-200`
  - Smooth hover: `transition-colors duration-200`
- Loading states:
  - Spinner: `animate-spin`
  - Pulse: `animate-pulse`
  - Fade: `animate-in fade-in`

### Dark Mode Support

- Background adaptation:
  - Light: `bg-white dark:bg-slate-950`
  - Card: `bg-card dark:bg-card-dark`
- Text adaptation:
  - Primary: `text-slate-900 dark:text-slate-50`
  - Secondary: `text-slate-500 dark:text-slate-400`
- Border adaptation:
  - Default: `border-slate-200 dark:border-slate-800`
