# UI/UX Design Specification v1.0
## Luxury Classic Car Marketplace - Rolls-Royce Theme

**Version:** 1.0
**Last Updated:** 2025-11-16
**Status:** DRAFT - Awaiting Approval

---

## 1. Design Philosophy

### Brand Identity
**Inspiration:** Rolls-Royce Motor Cars + McKinney Hot Rods

**Core Principles:**
1. **Minimalist Luxury** - Less is more, expansive whitespace
2. **Automotive Heritage** - Bold typography, vintage aesthetics
3. **Precision Engineering** - Clean lines, perfect alignment
4. **Tactile Elegance** - Subtle animations, smooth interactions
5. **Timeless Sophistication** - Never trendy, always elegant

---

## 2. Color System

### Primary Palette
```css
:root {
  /* Rolls-Royce Signature */
  --rr-purple: #6B2C91;         /* Primary brand color */
  --rr-purple-dark: #4A1E63;    /* Hover states */
  --rr-purple-light: #9B6FC2;   /* Accents */

  /* Chrome & Silver */
  --rr-silver: #C0C0C0;         /* Metallic accents */
  --rr-chrome: #E8E8E8;         /* Borders, dividers */
  --rr-platinum: #F5F5F5;       /* Subtle backgrounds */

  /* Blacks & Greys */
  --rr-black: #1A1A1A;          /* Primary text */
  --rr-charcoal: #2D2D2D;       /* Secondary backgrounds */
  --rr-grey-dark: #4A4A4A;      /* Secondary text */
  --rr-grey-mid: #6B6B6B;       /* Tertiary text */
  --rr-grey-light: #D1D1D1;     /* Disabled states */

  /* Pure White */
  --rr-white: #FEFEFE;          /* Backgrounds, cards */

  /* McKinney Hot Rod Accents */
  --hot-rod-red: #C41E3A;       /* CTAs, alerts */
  --chrome-gold: #D4AF37;       /* Premium badges */
  --garage-grey: #4A4A4A;       /* Industrial accents */
}
```

### Secondary Palette (Status Colors)
```css
:root {
  /* Status Colors */
  --success-green: #2D6A3E;
  --warning-amber: #D4A74F;
  --error-red: #C41E3A;
  --info-blue: #2E5B7E;

  /* Investment Grades */
  --grade-a-plus: #2D6A3E;      /* Dark green */
  --grade-a: #5C9E6F;           /* Green */
  --grade-a-minus: #8FB99F;     /* Light green */
  --grade-b-plus: #D4A74F;      /* Gold */
  --grade-b: #B8956A;           /* Bronze */
}
```

### Gradients
```css
:root {
  /* Background Gradients */
  --luxury-gradient: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%);
  --card-gradient: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  --chrome-gradient: linear-gradient(90deg, #C0C0C0 0%, #E8E8E8 50%, #C0C0C0 100%);

  /* Hover Gradients */
  --purple-gradient: linear-gradient(135deg, #6B2C91 0%, #9B6FC2 100%);
  --gold-gradient: linear-gradient(135deg, #D4AF37 0%, #F4D477 100%);
}
```

---

## 3. Typography

### Font Families
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&display=swap');

:root {
  /* Headings: Luxury serif for elegance */
  --font-heading: 'Cormorant Garamond', 'Playfair Display', serif;

  /* Body: Clean sans-serif for readability */
  --font-body: 'Inter', 'Roboto', -apple-system, sans-serif;

  /* Display: Bold statements, large numbers */
  --font-display: 'Oswald', 'Bebas Neue', sans-serif;
}
```

### Type Scale
```css
:root {
  /* Display (Hero sections) */
  --text-display-xl: 72px;  /* Hero headlines */
  --text-display-lg: 60px;  /* Page titles */
  --text-display-md: 48px;  /* Section headers */

  /* Headings */
  --text-h1: 40px;
  --text-h2: 32px;
  --text-h3: 24px;
  --text-h4: 20px;
  --text-h5: 18px;
  --text-h6: 16px;

  /* Body */
  --text-body-lg: 18px;     /* Large paragraphs */
  --text-body: 16px;        /* Standard */
  --text-body-sm: 14px;     /* Captions */
  --text-body-xs: 12px;     /* Labels */

  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.8;

  /* Font Weights */
  --weight-light: 300;
  --weight-normal: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

### Typography Classes
```css
.display-xl {
  font-family: var(--font-heading);
  font-size: var(--text-display-xl);
  font-weight: var(--weight-light);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

.heading-luxury {
  font-family: var(--font-heading);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.01em;
}

.body-elegant {
  font-family: var(--font-body);
  font-size: var(--text-body-lg);
  line-height: var(--leading-relaxed);
  letter-spacing: 0.005em;
}
```

---

## 4. Component Library

### 4.1 Buttons

**Primary Button (Rolls-Royce Purple)**
```tsx
<button className="btn-primary">
  Explore Collection
</button>
```

**CSS:**
```css
.btn-primary {
  background: var(--rr-purple);
  color: var(--rr-white);
  padding: 14px 32px;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 500;
  border: none;
  border-radius: 0;  /* Sharp edges for sophistication */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;  /* Chrome shine effect */
}

.btn-primary:hover {
  background: var(--rr-purple-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(107, 44, 145, 0.3);
}
```

**Secondary Button (Ghost)**
```css
.btn-secondary {
  background: transparent;
  color: var(--rr-purple);
  padding: 14px 32px;
  border: 2px solid var(--rr-purple);
  border-radius: 0;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: var(--rr-purple);
  color: var(--rr-white);
}
```

**CTA Button (Hot Rod Red)**
```css
.btn-cta {
  background: var(--hot-rod-red);
  color: var(--rr-white);
  padding: 16px 40px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  box-shadow: 0 4px 14px rgba(196, 30, 58, 0.4);
}

.btn-cta:hover {
  background: #A01729;
  box-shadow: 0 6px 20px rgba(196, 30, 58, 0.6);
}
```

---

### 4.2 Cards

**Glass Card (Luxury Listings)**
```tsx
<div className="glass-card">
  <img src="..." className="card-image" />
  <div className="card-content">
    <h3 className="card-title">1967 Ford Mustang</h3>
    <p className="card-price">$45,000</p>
    <div className="card-badge">Investment Grade A</div>
  </div>
</div>
```

**CSS:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--rr-purple);
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.card-image {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  filter: grayscale(10%);  /* Slight desaturation for elegance */
  transition: filter 0.3s;
}

.glass-card:hover .card-image {
  filter: grayscale(0%);
}

.card-title {
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 600;
  color: var(--rr-white);
  margin: 16px 0 8px;
}

.card-price {
  font-family: var(--font-display);
  font-size: 32px;
  color: var(--chrome-gold);
  letter-spacing: 0.02em;
}

.card-badge {
  display: inline-block;
  background: var(--grade-a);
  color: var(--rr-white);
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

### 4.3 Hero Section

**Homepage Hero**
```tsx
<section className="hero-luxury">
  <div className="hero-background">
    <img src="rolls-royce-phantom.jpg" className="hero-image" />
    <div className="hero-overlay"></div>
  </div>

  <div className="hero-content">
    <h1 className="hero-title">
      The Art of
      <span className="hero-accent">Classic Automotive Excellence</span>
    </h1>
    <p className="hero-subtitle">
      Curated collection of investment-grade classic cars and restomods
    </p>
    <div className="hero-actions">
      <button className="btn-primary">Explore Collection</button>
      <button className="btn-secondary">AI Vehicle Finder</button>
    </div>
  </div>
</section>
```

**CSS:**
```css
.hero-luxury {
  position: relative;
  height: 100vh;
  min-height: 600px;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  width: 100%;
  height: 100%;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(20%);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    rgba(26, 26, 26, 0.8) 0%,
    rgba(107, 44, 145, 0.3) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 10;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;
}

.hero-title {
  font-family: var(--font-heading);
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 300;
  color: var(--rr-white);
  line-height: 1.2;
  margin-bottom: 24px;
  animation: fadeInUp 1s ease-out;
}

.hero-accent {
  display: block;
  font-weight: 600;
  background: linear-gradient(90deg, var(--rr-purple), var(--chrome-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-family: var(--font-body);
  font-size: 20px;
  color: var(--rr-chrome);
  max-width: 600px;
  margin-bottom: 40px;
  animation: fadeInUp 1s ease-out 0.3s both;
}

.hero-actions {
  display: flex;
  gap: 20px;
  animation: fadeInUp 1s ease-out 0.6s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

### 4.4 Navigation

**Luxury Navigation Bar**
```tsx
<nav className="nav-luxury">
  <div className="nav-container">
    <a href="/" className="nav-logo">
      <img src="logo.svg" alt="Logo" />
      <span className="nav-logo-text">RESTOMOD</span>
    </a>

    <ul className="nav-menu">
      <li><a href="/cars" className="nav-link">Vehicles</a></li>
      <li><a href="/events" className="nav-link">Events</a></li>
      <li><a href="/configurator" className="nav-link">Configurator</a></li>
      <li><a href="/insights" className="nav-link">Market Insights</a></li>
    </ul>

    <div className="nav-actions">
      <button className="nav-ai-chat">
        <span className="ai-icon">✨</span>
        AI Assistant
      </button>
      <a href="/profile" className="nav-profile">
        <Avatar />
      </a>
    </div>
  </div>
</nav>
```

**CSS:**
```css
.nav-luxury {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.nav-logo-text {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  color: var(--rr-white);
  letter-spacing: 0.1em;
}

.nav-menu {
  display: flex;
  gap: 40px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 500;
  color: var(--rr-chrome);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  transition: color 0.3s;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--rr-purple);
  transition: width 0.3s;
}

.nav-link:hover {
  color: var(--rr-white);
}

.nav-link:hover::after {
  width: 100%;
}

.nav-ai-chat {
  background: var(--rr-purple);
  color: var(--rr-white);
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.nav-ai-chat:hover {
  background: var(--rr-purple-light);
  transform: scale(1.05);
}
```

---

### 4.5 AI Chat Widget

**Floating Chat Button**
```tsx
<div className="ai-chat-widget">
  <button className="ai-chat-button" onClick={openChat}>
    <span className="ai-icon">🤖</span>
    <span className="ai-pulse"></span>
  </button>

  {isOpen && (
    <div className="ai-chat-window">
      <div className="ai-chat-header">
        <h3>K.I.T.T. AI Assistant</h3>
        <button onClick={closeChat}>×</button>
      </div>

      <div className="ai-chat-messages">
        {messages.map(msg => (
          <div className={`ai-message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="ai-chat-input">
        <input
          type="text"
          placeholder="Ask about cars, events, pricing..."
        />
        <button>Send</button>
      </div>
    </div>
  )}
</div>
```

**CSS:**
```css
.ai-chat-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
}

.ai-chat-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--rr-purple), var(--rr-purple-light));
  border: none;
  box-shadow: 0 4px 20px rgba(107, 44, 145, 0.4);
  cursor: pointer;
  position: relative;
  transition: transform 0.3s;
}

.ai-chat-button:hover {
  transform: scale(1.1);
}

.ai-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid var(--rr-purple);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.ai-chat-window {
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 400px;
  height: 600px;
  background: var(--rr-white);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

.ai-chat-header {
  background: var(--rr-purple);
  color: var(--rr-white);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #F9F9F9;
}

.ai-message {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
  animation: fadeIn 0.3s;
}

.ai-message.user {
  background: var(--rr-purple);
  color: var(--rr-white);
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.ai-message.assistant {
  background: var(--rr-white);
  color: var(--rr-black);
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.ai-chat-input {
  display: flex;
  padding: 16px;
  border-top: 1px solid #E0E0E0;
  background: var(--rr-white);
}

.ai-chat-input input {
  flex: 1;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 20px;
  font-size: 14px;
}

.ai-chat-input button {
  margin-left: 8px;
  padding: 12px 24px;
  background: var(--rr-purple);
  color: var(--rr-white);
  border: none;
  border-radius: 20px;
  cursor: pointer;
}
```

---

### 4.6 Event Map

**Interactive Map Component**
```tsx
<div className="event-map-container">
  <div className="event-map">
    <MapboxGL
      markers={events}
      onMarkerClick={handleMarkerClick}
    />
  </div>

  {selectedEvent && (
    <div className="event-sidebar">
      <EventCard event={selectedEvent} />
    </div>
  )}
</div>
```

**CSS:**
```css
.event-map-container {
  display: flex;
  height: calc(100vh - 80px);
}

.event-map {
  flex: 1;
  position: relative;
}

.event-sidebar {
  width: 400px;
  background: var(--rr-white);
  border-left: 1px solid var(--rr-chrome);
  overflow-y: auto;
  padding: 24px;
}

.map-marker {
  width: 40px;
  height: 40px;
  background: var(--rr-purple);
  border: 3px solid var(--rr-white);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  cursor: pointer;
  transition: all 0.3s;
}

.map-marker:hover {
  transform: rotate(-45deg) scale(1.2);
  background: var(--hot-rod-red);
}

.map-marker.featured {
  background: var(--chrome-gold);
  width: 50px;
  height: 50px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: rotate(-45deg) translateY(0); }
  50% { transform: rotate(-45deg) translateY(-10px); }
}
```

---

## 5. Page Layouts

### 5.1 Homepage Layout
```
┌─────────────────────────────────────┐
│         Navigation Bar              │
├─────────────────────────────────────┤
│                                     │
│       Hero Section (Full Height)   │
│       - Cinematic background       │
│       - Headline + CTA             │
│                                     │
├─────────────────────────────────────┤
│   Featured Vehicles Carousel       │
│   (3-4 cards visible, auto-scroll)│
├─────────────────────────────────────┤
│   Investment Insights Section      │
│   - Market trends chart            │
│   - Top performers grid            │
├─────────────────────────────────────┤
│   Upcoming Events (Map + List)     │
│   - Interactive mini-map           │
│   - Next 6 events                  │
├─────────────────────────────────────┤
│   Testimonials (Elegant carousel)  │
├─────────────────────────────────────┤
│   Footer                           │
└─────────────────────────────────────┘
```

### 5.2 Car Listings Layout
```
┌─────────────────────────────────────┐
│         Navigation Bar              │
├──────────┬──────────────────────────┤
│          │                          │
│ Filters  │   Search Bar + Sort     │
│ Sidebar  │                          │
│          ├──────────────────────────┤
│ - Make   │                          │
│ - Model  │   Masonry Grid of Cars  │
│ - Year   │   (3 columns)           │
│ - Price  │                          │
│ - Grade  │   [Car] [Car] [Car]     │
│ - Location│  [Car] [Car] [Car]     │
│          │   [Car] [Car] [Car]     │
│          │                          │
│          │   Pagination            │
└──────────┴──────────────────────────┘
```

### 5.3 Car Detail Layout
```
┌─────────────────────────────────────┐
│         Navigation Bar              │
├─────────────────────────────────────┤
│                                     │
│   Hero Image Gallery                │
│   (Full width, 60vh)                │
│                                     │
├──────────────────┬──────────────────┤
│                  │                  │
│ Details Column   │  Sidebar         │
│                  │                  │
│ - Title          │  - Price         │
│ - Description    │  - Investment    │
│ - Specs Table    │  - Bookmark Btn  │
│ - Features       │  - Contact Btn   │
│ - Modifications  │  - Share Btn     │
│                  │                  │
│                  │  Similar Cars    │
│                  │  (3 cards)       │
│                  │                  │
├──────────────────┴──────────────────┤
│  Price Trend Chart (full width)    │
├─────────────────────────────────────┤
│  Upcoming Events with this Car     │
│  (Horizontal scroll)               │
└─────────────────────────────────────┘
```

### 5.4 Events Map Layout
```
┌─────────────────────────────────────┐
│         Navigation Bar              │
├──────────────────────┬──────────────┤
│                      │              │
│                      │  Filters     │
│   Interactive Map    │              │
│   (Clustered markers)│  - Date Range│
│                      │  - Type      │
│                      │  - Category  │
│                      │  - Distance  │
│                      │              │
│                      ├──────────────┤
│                      │              │
│                      │ Event Details│
│                      │ (when clicked│
│                      │              │
└──────────────────────┴──────────────┘
```

### 5.5 Admin Dashboard Layout
```
┌─────────────────────────────────────┐
│    Admin Navigation + User Menu     │
├──────┬──────────────────────────────┤
│      │                              │
│ Sidebar│  Dashboard Content        │
│      │                              │
│ - Overview│  ┌───────┬───────┬────┐│
│ - Users   │  │ Total │ Active│New ││
│ - Cars    │  │ Cars  │Events │User││
│ - Events  │  └───────┴───────┴────┘│
│ - Scrapers│                         │
│ - Settings│  Price Trend Charts    │
│ - Analytics│                        │
│      │  Popular Searches Table    │
│      │                              │
│      │  Recent Activity Log       │
│      │                              │
└──────┴──────────────────────────────┘
```

---

## 6. Responsive Breakpoints

```css
/* Mobile First Approach */
:root {
  --breakpoint-sm: 640px;   /* Mobile landscape */
  --breakpoint-md: 768px;   /* Tablets */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Large desktop */
  --breakpoint-2xl: 1536px; /* Extra large */
}

/* Mobile (< 640px) */
- Single column layouts
- Stacked navigation (hamburger menu)
- Card width: 100%
- Font size: 90% of desktop

/* Tablet (640px - 1024px) */
- 2 column grids
- Compact filters
- Card width: 50%

/* Desktop (> 1024px) */
- 3-4 column grids
- Full sidebar filters
- Card width: 33%
```

---

## 7. Animation Guidelines

### Timing Functions
```css
:root {
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Animation Speeds
```css
:root {
  --speed-fast: 150ms;
  --speed-normal: 300ms;
  --speed-slow: 500ms;
  --speed-slower: 1000ms;
}
```

### Common Animations
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

---

## 8. Accessibility

### WCAG 2.1 AA Compliance
- **Color Contrast:** 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation:** All interactive elements accessible via Tab
- **Screen Readers:** ARIA labels on all icons and images
- **Focus States:** Visible focus indicators on all elements

### Focus Styles
```css
*:focus-visible {
  outline: 2px solid var(--rr-purple);
  outline-offset: 2px;
}

.btn-primary:focus-visible {
  outline: 2px solid var(--chrome-gold);
  outline-offset: 4px;
}
```

---

## 9. Loading States

### Skeleton Screens
```tsx
<div className="skeleton-card">
  <div className="skeleton-image"></div>
  <div className="skeleton-title"></div>
  <div className="skeleton-text"></div>
  <div className="skeleton-text"></div>
</div>
```

**CSS:**
```css
.skeleton-card {
  background: rgba(255, 255, 255, 0.03);
  padding: 20px;
  border-radius: 8px;
}

.skeleton-image,
.skeleton-title,
.skeleton-text {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-image {
  width: 100%;
  height: 200px;
  margin-bottom: 16px;
}

.skeleton-title {
  width: 70%;
  height: 24px;
  margin-bottom: 12px;
}

.skeleton-text {
  width: 100%;
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-text:last-child {
  width: 80%;
}
```

---

## 10. Approval Checklist

- [ ] Review color palette (Rolls-Royce + McKinney theme)
- [ ] Approve typography choices
- [ ] Verify component designs
- [ ] Confirm responsive breakpoints
- [ ] Validate accessibility standards
- [ ] Review animation guidelines
- [ ] Approve page layouts
- [ ] Confirm AI chat widget design

---

**Status:** READY FOR REVIEW
**Next Step:** Create design mockups and prototypes
**Implementation Time:** 3-4 weeks (with design iteration)
