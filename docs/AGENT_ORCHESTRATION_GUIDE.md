# Agent Orchestration Guide
## Spec-Driven Development with Parallel AI Agents

**Version:** 1.0
**Last Updated:** 2025-11-16

---

## Overview

This project uses a sophisticated **Agent Orchestration System** that works collaboratively with **Spec-Driven Development** to ensure high-quality, efficient implementation.

### Key Features
- **Up to 7 parallel agents** working simultaneously
- **Spec-driven workflow** - no code before specs are approved
- **AI-powered** - Each agent uses Claude 3.5 Sonnet
- **Automatic documentation** - Docs update with code changes
- **Quality assurance** - Built-in code review and testing

---

## Quick Start

### 1. Work with Specs
```bash
# Always start with specs - no implementation before approval!

# Example: Adding a new feature
1. Review existing specs in docs/SPEC_*.md
2. Create new spec if needed
3. Get approval before proceeding
4. Reference spec in all commits
```

### 2. Use Superclaude Commands
```bash
# Interactive commit (auto-references specs)
npm run commit

# Code review (checks spec compliance)
npm run code:review

# Update documentation automatically
npm run docs:update

# Prepare release (changelog + readme)
npm run release:prep
```

### 3. Agent Workflows

**Full Implementation (7 agents in parallel):**
```bash
# The taskmaster orchestrates these phases:

Phase 1: Planning (1 agent)
  └─ taskmaster: Analyze specs, create task breakdown

Phase 2: Validation (1 agent)
  └─ spec-analyst: Validate specs, check for conflicts

Phase 3: Implementation - Group 1 (3 agents in parallel)
  ├─ database-architect: Schema, migrations, indexes
  ├─ api-engineer: Endpoints, validation, auth
  └─ ui-designer: Components, styling, layouts

Phase 4: Implementation - Group 2 (2 agents in parallel)
  ├─ ai-specialist: Embeddings, vector search, chat
  └─ scraper-engineer: Playwright, anti-bot, job queue

Phase 5: Testing & Docs (2 agents in parallel)
  ├─ test-engineer: Unit, integration, E2E tests
  └─ documentation-writer: API docs, README, changelog

Phase 6: Review (1 agent)
  └─ code-reviewer: Code review, security, performance
```

**Quick Feature (5 agents max):**
```bash
# Rapid development for small features
taskmaster → database/api/ui (parallel) → test → review
```

---

## Agent Types

### 1. Taskmaster (Commander)
**Role:** Orchestrator
**Priority:** Highest
**Capabilities:**
- Task decomposition
- Agent assignment
- Progress tracking
- Resource allocation

**When to Use:**
- Starting any new work
- Complex multi-step tasks
- Need to coordinate multiple agents

---

### 2. Spec Analyst (Architect)
**Role:** Analysis
**Priority:** High
**Capabilities:**
- Spec validation
- Requirement analysis
- Gap detection
- Compliance checking

**When to Use:**
- Creating new specs
- Validating existing specs
- Finding spec conflicts
- Requirements analysis

---

### 3. Database Architect (Foundation Expert)
**Role:** Implementation
**Priority:** High
**Capabilities:**
- Schema design
- Migration generation
- Query optimization
- Index strategy

**Context Files:**
- `docs/SPEC_01_DATABASE_SCHEMA.md`
- `shared/schema.ts`
- `db/**/*.ts`

**When to Use:**
- Database schema changes
- Migration creation
- Performance optimization
- Adding new tables/columns

---

### 4. API Engineer (Bridge Builder)
**Role:** Implementation
**Priority:** High
**Capabilities:**
- Endpoint creation
- Validation logic
- Auth implementation
- API documentation

**Context Files:**
- `docs/SPEC_02_API_ENDPOINTS.md`
- `server/routes.ts`
- `server/api/**/*.ts`

**When to Use:**
- Creating new endpoints
- Adding authentication
- Input validation
- API documentation

---

### 5. UI Designer (Experience Crafter)
**Role:** Implementation
**Priority:** High
**Capabilities:**
- Component creation
- Styling implementation
- Responsive design
- Accessibility compliance

**Context Files:**
- `docs/SPEC_03_UI_UX_DESIGN.md`
- `client/src/components/**/*.tsx`
- `client/src/pages/**/*.tsx`

**When to Use:**
- Creating new UI components
- Implementing designs
- Responsive layouts
- Accessibility fixes

---

### 6. AI Specialist (Intelligence Architect)
**Role:** Implementation
**Priority:** Medium
**Capabilities:**
- Embedding generation
- Vector search
- LLM integration
- Prompt engineering

**Context Files:**
- `docs/SPEC_04_AI_CHAT_SYSTEM.md`
- `server/services/ai/**/*.ts`

**When to Use:**
- AI chat features
- Vector search
- Embedding generation
- Prompt optimization

---

### 7. Scraper Engineer (Data Hunter)
**Role:** Implementation
**Priority:** Medium
**Capabilities:**
- Playwright setup
- Anti-bot bypass
- Data extraction
- Scraping orchestration

**Context Files:**
- `docs/SPEC_05_SCRAPING_SYSTEM.md`
- `server/services/scraping/**/*.ts`

**When to Use:**
- Setting up scrapers
- Anti-bot strategies
- Data collection
- Scraping schedules

---

### 8. Test Engineer (Quality Guardian)
**Role:** Quality Assurance
**Priority:** Medium
**Capabilities:**
- Unit test creation
- Integration testing
- E2E testing
- Coverage analysis

**When to Use:**
- Writing tests
- Test coverage analysis
- E2E test setup
- Performance testing

---

### 9. Documentation Writer (Knowledge Keeper)
**Role:** Documentation
**Priority:** Low
**Capabilities:**
- API docs generation
- Code documentation
- README updates
- Changelog generation

**When to Use:**
- Auto after commits
- Manual when needed
- Release prep
- API docs update

---

### 10. Code Reviewer (Quality Sentinel)
**Role:** Quality Assurance
**Priority:** Low
**Capabilities:**
- Code review
- Best practices checking
- Security analysis
- Performance optimization

**When to Use:**
- Before merging
- After implementation
- Security audits
- Performance checks

---

## Workflows

### Full Implementation Workflow

**Trigger:** Large features spanning multiple specs

**Agents Used:** All 10 (7 max concurrent)

**Phases:**
1. **Planning** (1 agent):
   - Taskmaster analyzes all specs
   - Creates detailed task breakdown
   - Assigns agents to tasks
   - Creates dependency graph

2. **Validation** (1 agent):
   - Spec analyst validates completeness
   - Checks for conflicts
   - Generates implementation checklist

3. **Implementation - Group 1** (3 agents parallel):
   - Database architect: Schema + migrations
   - API engineer: Endpoints + auth
   - UI designer: Components + layouts

4. **Implementation - Group 2** (2 agents parallel):
   - AI specialist: Chat + embeddings
   - Scraper engineer: Playwright + queue

5. **Testing & Docs** (2 agents parallel):
   - Test engineer: All test types
   - Documentation writer: All docs

6. **Review** (1 agent):
   - Code reviewer: Final check
   - Spec compliance verification
   - Security + performance audit

**Expected Duration:** 2-4 weeks for complete implementation

---

### Quick Feature Workflow

**Trigger:** Small features, single spec changes

**Agents Used:** 5 max

**Phases:**
1. **Planning**: Taskmaster analyzes + creates plan
2. **Implementation** (parallel): Relevant agents (database/api/ui)
3. **Testing**: Test engineer
4. **Review**: Code reviewer

**Expected Duration:** 1-3 days

---

### Spec Creation Workflow

**Trigger:** Need new specification before implementation

**Agents Used:** 6-7

**Phases:**
1. **Planning**: Taskmaster analyzes requirements
2. **Analysis**: Spec analyst researches best practices
3. **Spec Writing** (parallel):
   - Database architect: DB section
   - API engineer: API section
   - UI designer: UI/UX section
4. **Finalization**: Documentation writer compiles
5. **Review**: Code reviewer checks feasibility

**Expected Duration:** 1-2 days for comprehensive spec

---

### Bug Fix Workflow

**Trigger:** Bug reports, issues

**Agents Used:** 4

**Phases:**
1. **Investigation** (parallel):
   - Taskmaster: Analyzes bug
   - Code reviewer: Reviews related code
   - Test engineer: Creates reproduction
2. **Fix**: Appropriate agent (api/ui)
3. **Review**: Code reviewer verifies

**Expected Duration:** Hours to 1 day

---

## Parallel Processing

### How It Works

**Max Concurrent Agents:** 7

**Parallelization Strategy:**
1. **Dependency Analysis**: Taskmaster identifies independent tasks
2. **Grouping**: Tasks grouped by dependencies
3. **Assignment**: Up to 7 agents work simultaneously
4. **Coordination**: Event-driven communication
5. **Completion**: Wait for all in group before next

**Example:**
```
Phase 3: Implementation Group 1 (Parallel)
┌─────────────────────┬─────────────────────┬─────────────────────┐
│ Database Architect  │   API Engineer      │    UI Designer      │
│                     │                     │                     │
│ - Create schema     │ - Auth endpoints    │ - Luxury theme      │
│ - Migrations        │ - Car endpoints     │ - Glass cards       │
│ - Indexes           │ - Event endpoints   │ - Navigation        │
│ - pgvector          │ - SSE streaming     │ - Chat widget       │
└─────────────────────┴─────────────────────┴─────────────────────┘
           ↓                    ↓                    ↓
        All complete → Move to Phase 4
```

---

## Spec-Driven Development Integration

### Rules

**RULE 1:** No code before specs are approved
**RULE 2:** All commits must reference specs
**RULE 3:** All features must have tests
**RULE 4:** Docs auto-update with code changes

### Workflow Integration

```
1. Create/Update Spec
   ↓
2. Get Approval (docs/SPEC_STATUS.json)
   ↓
3. Reference Spec in Commit
   ├─ npm run commit (interactive)
   ├─ Format: [SPEC-01] feat(database): Add vector columns
   └─ Auto-links to spec in commit message
   ↓
4. Implementation
   ├─ Agents check spec compliance
   ├─ Code reviewer verifies against spec
   └─ Tests verify spec requirements
   ↓
5. Auto-Documentation
   ├─ npm run docs:update (auto in post-commit hook)
   ├─ Updates API docs
   ├─ Updates README
   └─ Syncs with specs
   ↓
6. Release Prep
   ├─ npm run release:prep
   ├─ Generates changelog (grouped by spec)
   └─ Updates README with new features
```

---

## Commit Format

### Template
```
[SPEC-{{spec_id}}] {{type}}({{scope}}): {{message}}

{{body}}

Implements: docs/SPEC_{{spec_id}}_{{name}}.md
Related Specs: SPEC-{{other_id}}
```

### Example
```
[SPEC-01] feat(database): Add vector columns for AI search

- Added embedding column (vector 1536) to cars_for_sale
- Added embedding column to car_show_events
- Created vector similarity search indexes
- Added trigger for automatic embedding updates

Implements: docs/SPEC_01_DATABASE_SCHEMA.md
Related Specs: SPEC-04 (AI Chat System)
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Build tasks, etc.
- `spec`: Spec updates

### Scopes
- `database`: Database changes
- `api`: API endpoints
- `ui`: UI components
- `ai-chat`: AI chat system
- `scraping`: Scraping system
- `admin`: Admin features
- `auth`: Authentication

---

## Advanced Features

### Internet Search Integration

**Agents with Web Access:**
- Spec Analyst (research best practices)
- AI Specialist (latest AI techniques)
- Scraper Engineer (anti-bot strategies)

**Search Engines:**
- Brave Search API
- Perplexity AI
- WebSearch Tool

**Use Cases:**
- Research libraries/frameworks
- Find documentation
- Discover best practices
- Solve technical problems
- Stay current with trends

### Custom Hooks

**Pre-Commit:**
```bash
# Runs automatically before each commit
- Type checking (npm run check)
- Unit tests (npm run test)
- Spec validation (custom script)
```

**Post-Commit:**
```bash
# Runs automatically after each commit
- Documentation update (npm run docs:update)
```

**Pre-Push:**
```bash
# Runs before pushing to remote
- Full test suite
- Build check
- Spec compliance check
```

### Shared Components & Extensions

**Philosophy:** Use existing, well-tested components

**Preferred:**
- ShadCN UI components (not custom)
- Radix UI primitives
- TanStack Query (data fetching)
- Drizzle ORM (database)
- Playwright (testing)

**Avoid:**
- Custom implementations of solved problems
- Reinventing wheels
- Not using available libraries

---

## Monitoring & Logs

### Agent Activity Logs
```bash
# View agent activity
cat logs/agents/agent-activity.json

# Monitor in real-time
tail -f logs/agents/agent-activity.json
```

### Metrics Tracked
- Task completion time
- Agent utilization
- Parallel efficiency
- Error rate
- Spec compliance rate

---

## Troubleshooting

### Issue: Agent Conflicts
**Symptom:** Two agents trying to modify same file
**Solution:** Taskmaster automatically queues dependent tasks

### Issue: Spec Not Found
**Symptom:** Commit rejected for missing spec reference
**Solution:** Add spec reference or use `--no-verify` (not recommended)

### Issue: Slow Parallel Execution
**Symptom:** Agents waiting unnecessarily
**Solution:** Check dependency graph, optimize task grouping

---

## Best Practices

### 1. Always Start with Specs
- Write spec first
- Get approval
- Then implement

### 2. Use Parallel Agents
- Let taskmaster handle orchestration
- Trust the system
- Don't micromanage

### 3. Commit Frequently
- Small, focused commits
- Always reference specs
- Let auto-docs run

### 4. Leverage Agent Expertise
- Use right agent for right job
- Trust their capabilities
- Review their work

### 5. Monitor Progress
- Check agent logs
- Review completion metrics
- Adjust as needed

---

## Configuration Files

### `.superclaude.config.json`
Main superclaude configuration
- Commit templates
- Changelog format
- Review checklist
- Spec-driven settings

### `.agents.config.json`
Agent orchestration configuration
- Agent definitions
- Workflows
- Parallel processing
- Personas

### `docs/SPEC_STATUS.json`
Spec approval tracking (auto-generated)
- Approval status
- Implementation status
- Test coverage
- Documentation status

---

## Future Enhancements

### Planned Features
- [ ] Visual workflow dashboard
- [ ] Real-time agent coordination viewer
- [ ] Automated performance benchmarks
- [ ] AI-powered code suggestions
- [ ] Predictive task estimation
- [ ] Automatic dependency resolution
- [ ] Cross-project learnings

---

## Support

For questions or issues:
1. Check agent logs: `logs/agents/`
2. Review spec status: `docs/SPEC_STATUS.json`
3. Run diagnostics: `npm run code:review`
4. Create GitHub issue

---

**The agent orchestration system is your co-pilot for spec-driven development. Trust the process, and it will deliver high-quality code faster than ever before.** 🚀
