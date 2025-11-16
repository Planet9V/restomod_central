# RestoMod Central

A comprehensive platform for classic car enthusiasts, connecting buyers, sellers, and restorers in the vintage automotive community.

---

## ⚖️ Constitutional Requirement: Spec-Driven Development

**This project operates under a specification-first development constitution.**

Before writing any code, you must write a specification. All features, enhancements, and significant changes require an approved spec.

### Quick Start for Developers

```bash
# 1. Create a new specification
npm run spec:create

# 2. Fill out the spec using specs/TEMPLATE-spec.md as a guide

# 3. Get it reviewed and approved

# 4. Implement according to the spec

# 5. Build (automatically validates specs)
npm run build
```

### Essential Reading

- **📜 Constitution:** [.claude/CONSTITUTION.md](./.claude/CONSTITUTION.md) - The foundational requirements
- **📘 Developer Guide:** [.claude/SPEC-DRIVEN-DEVELOPMENT-GUIDE.md](./.claude/SPEC-DRIVEN-DEVELOPMENT-GUIDE.md) - How to apply spec-driven development
- **⚡ Quick Reference:** [.claude/QUICK-REFERENCE.md](./.claude/QUICK-REFERENCE.md) - Commands and conventions

**The Golden Rule:** *Write the spec first, then write the code. Always.*

---

## Technology Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management

### Backend
- **Express** - Node.js web framework
- **TypeScript** - Type-safe backend code
- **Drizzle ORM** - Type-safe database queries
- **Better SQLite3** - Embedded database (dev)
- **PostgreSQL** - Production database

### MCP Servers (Model Context Protocol)
- **Context7** - Up-to-date API documentation for LLMs
- **Spec-Driven Development** - Enforces specification-first workflow
- **Playwright** - Browser automation for testing and scraping
- **Crawl4AI** - Web scraping capabilities

Configuration: [.mcp.json](./.mcp.json)

---

## Project Structure

```
restomod_central/
├── .claude/                          # Constitutional framework
│   ├── CONSTITUTION.md               # The law of the land
│   ├── SPEC-DRIVEN-DEVELOPMENT-GUIDE.md
│   ├── QUICK-REFERENCE.md
│   └── README.md
├── client/                           # Frontend React application
│   └── src/
│       ├── components/               # React components
│       ├── pages/                    # Page components
│       └── lib/                      # Utilities and helpers
├── server/                           # Backend Express application
│   ├── index.ts                      # Server entry point
│   ├── routes/                       # API routes
│   └── services/                     # Business logic
├── db/                               # Database configuration
│   ├── schema.ts                     # Drizzle schema definitions
│   └── migrations/                   # Database migrations
├── specs/                            # Feature specifications (REQUIRED)
│   ├── TEMPLATE-spec.md              # Specification template
│   └── [YYYY-MM-DD]-*-spec.md        # Individual specifications
├── scripts/                          # Utility scripts
│   └── validate-specs.ts             # Specification validation
├── docs/                             # Additional documentation
├── .mcp.json                         # MCP server configuration
└── package.json                      # Dependencies and scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

### Development

```bash
# Start development server
npm run dev

# In another terminal, validate specifications
npm run spec:check

# Run tests
npm test

# Type check
npm run check
```

### Building for Production

```bash
# Build (includes spec validation + type checking)
npm run build

# Start production server
npm start
```

---

## Development Workflow

### 1. Before You Code

**Create a specification:**
```bash
npm run spec:create
```

Fill out all required sections:
- Overview
- Requirements (Functional + Non-functional)
- Technical Design
- Implementation Plan
- Testing Strategy
- Security Considerations
- Performance Implications

### 2. Get Spec Reviewed

Share your spec with:
- Technical lead (architecture)
- Product owner (requirements)
- Security team (if applicable)

Update status: `**Status:** Under Review`

### 3. Implement

Once approved (`**Status:** Approved`), implement according to the spec's implementation plan.

### 4. Test

Follow the testing strategy defined in your spec:
- Unit tests
- Integration tests
- Manual testing procedures

### 5. Submit PR

Reference your spec in the PR description:
```markdown
Implements: `specs/2025-11-16-feature-name-spec.md`
```

### 6. Deploy

After merge, update spec status: `**Status:** Implemented`

---

## Available Scripts

### Core Development
- `npm run dev` - Start development server
- `npm run build` - Build for production (includes validation)
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run check` - TypeScript type checking

### Specification Management
- `npm run spec:create` - Create new specification from template
- `npm run spec:check` - Validate all specifications

### Database
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

### Data Import
- `npm run import:events` - Import car show/event data
- `npm run import:cars` - Import vehicle listings

---

## Key Features

### For Buyers
- Browse classic car listings
- Advanced search and filtering
- Save favorite vehicles
- Connect with sellers
- Discover car shows and events

### For Sellers
- List vehicles for sale
- Manage listings
- Track inquiries
- Reach engaged buyers

### For Enthusiasts
- Event calendar (car shows, auctions, meets)
- Classic car resources and guides
- Community engagement
- Restoration tips and tricks

---

## Security

Security is a constitutional requirement. Every specification must include:
- Authentication/authorization considerations
- Data protection measures
- Input validation strategies
- Security testing procedures

Found a vulnerability? Please report responsibly.

---

## Contributing

### Before Contributing

1. **Read the Constitution:** [.claude/CONSTITUTION.md](./.claude/CONSTITUTION.md)
2. **Review the Developer Guide:** [.claude/SPEC-DRIVEN-DEVELOPMENT-GUIDE.md](./.claude/SPEC-DRIVEN-DEVELOPMENT-GUIDE.md)
3. **Understand the Workflow:** Spec-first, always

### Contribution Process

1. Fork the repository
2. Create a specification for your contribution
3. Get the spec reviewed
4. Implement according to the approved spec
5. Write tests per the testing strategy
6. Submit a pull request referencing the spec
7. Pass code review
8. Celebrate! 🎉

### Pull Request Requirements

- [ ] References an approved specification
- [ ] All tests pass
- [ ] Type checking passes
- [ ] Specification validation passes
- [ ] Security considerations addressed
- [ ] Documentation updated

---

## License

MIT

---

## Support

- **Documentation:** See `/docs` and `/.claude` directories
- **Issues:** Submit via GitHub Issues
- **Specifications:** See `/specs` directory

---

## Acknowledgments

Built with modern web technologies and a commitment to specification-driven development for maintainability, security, and quality.

---

**Remember:** Write the spec first, then write the code. Always.
