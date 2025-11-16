# Spec-Driven Development Guide

A practical guide to developing features in the RestoMod Central platform using the specification-first approach.

---

## Why Spec-First?

Traditional development often looks like this:
1. Get a vague idea
2. Start coding
3. Realize the idea was incomplete
4. Refactor extensively
5. Repeat

**Spec-driven development** inverts this:
1. Write complete specification
2. Review and refine the spec
3. Implement according to spec
4. Validate against spec
5. Ship with confidence

### Benefits

- **Clarity**: Everyone knows exactly what's being built
- **Efficiency**: Less rework, faster reviews
- **Quality**: Security, performance, and testing planned upfront
- **Maintainability**: Clear documentation for future developers
- **Accountability**: Traceability from requirements to implementation

---

## The Workflow

### Step 1: Create a Specification

```bash
# Quick way to create a new spec
npm run spec:create

# Or manually
cp specs/TEMPLATE-spec.md specs/$(date +%Y-%m-%d)-feature-name-spec.md
```

**Naming Convention:**
```
specs/[YYYY-MM-DD]-[feature-name]-spec.md
```

**Examples:**
- `specs/2025-11-16-user-profile-enhancement-spec.md`
- `specs/2025-11-16-payment-gateway-integration-spec.md`
- `specs/2025-11-16-search-performance-optimization-spec.md`

### Step 2: Fill Out the Specification

Use the template as your guide. Every section serves a purpose:

#### Overview
**Why it matters:** Sets context and success criteria

```markdown
## Overview

### Problem Statement
Users can't filter search results by price range, leading to frustration
when browsing high-value classic cars.

### Solution Summary
Add a dual-slider price range filter to the vehicle search interface
with real-time results updating.

### Success Criteria
- [ ] Users can set min/max price bounds
- [ ] Results update in < 500ms
- [ ] Filter state persists across sessions
- [ ] Mobile-responsive implementation
```

#### Requirements
**Why it matters:** Defines WHAT needs to be built

```markdown
## Requirements

### Functional Requirements

**FR-1: Price Range Selection**
- **Description:** Users must be able to select a minimum and maximum price
- **Priority:** High
- **Dependencies:** Existing search infrastructure

**FR-2: Real-time Filtering**
- **Description:** Results must update as the user adjusts the sliders
- **Priority:** High
- **Dependencies:** FR-1

### Non-Functional Requirements

**NFR-1: Performance**
- Filter updates must complete in < 500ms (p95)
- No blocking of UI during filtering

**NFR-2: Security**
- Input validation on price bounds
- Prevent SQL injection via parameterized queries
```

#### Technical Design
**Why it matters:** Defines HOW it will be built

```markdown
## Technical Design

### Component Structure
```
client/src/
  components/
    SearchFilters/
      PriceRangeFilter.tsx       # Main component
      usePriceFilter.ts          # Business logic hook
      PriceSlider.tsx            # Reusable slider component
      types.ts                   # TypeScript interfaces
```

### API Changes
**Endpoint:** `GET /api/vehicles/search`
- **New Query Params:**
  - `minPrice`: number (optional)
  - `maxPrice`: number (optional)

### Database Query
```sql
SELECT * FROM vehicles
WHERE price BETWEEN $1 AND $2
  AND <other filters>
ORDER BY created_at DESC
LIMIT 50;
```
```

#### Testing Strategy
**Why it matters:** Ensures quality and prevents regressions

```markdown
## Testing Strategy

### Unit Tests
- PriceRangeFilter renders correctly
- usePriceFilter handles edge cases (0, negative, very large numbers)
- Slider component responds to user input

### Integration Tests
- End-to-end search with price filter
- Filter combined with other search criteria
- State persistence across page navigation

### Manual Testing
- [ ] Test on desktop (Chrome, Firefox, Safari)
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Test with screen reader
- [ ] Test with keyboard-only navigation
```

#### Security Considerations
**Why it matters:** Protects users and the platform

```markdown
## Security Considerations

### Input Validation
```typescript
const priceFilterSchema = z.object({
  minPrice: z.number().min(0).max(10000000).optional(),
  maxPrice: z.number().min(0).max(10000000).optional()
}).refine(data => {
  if (data.minPrice && data.maxPrice) {
    return data.minPrice <= data.maxPrice;
  }
  return true;
}, "minPrice must be less than maxPrice");
```

### Security Testing
- [ ] Verify SQL parameterization (no injection)
- [ ] Test boundary values (0, negative, MAX_INT)
- [ ] Verify no sensitive data in query logs
```

### Step 3: Get Specification Reviewed

Update the status in your spec:
```markdown
**Status:** Under Review
```

Share the spec with:
- Technical lead (architecture review)
- Product owner (requirements validation)
- Security team (if handling sensitive data)

### Step 4: Implement According to Spec

Once approved, update the status:
```markdown
**Status:** Approved
```

Now implement following the spec's implementation plan:

```markdown
## Implementation Plan

### Phase 1: Backend API Support
**Files to Create:**
- None

**Files to Modify:**
- `server/routes/vehicles.ts` - Add price filter params
- `db/queries/vehicles.ts` - Update search query

**Tasks:**
1. [ ] Add price parameters to search endpoint
2. [ ] Update SQL query with price bounds
3. [ ] Add input validation
4. [ ] Write unit tests

### Phase 2: Frontend Components
**Files to Create:**
- `client/src/components/SearchFilters/PriceRangeFilter.tsx`
- `client/src/components/SearchFilters/usePriceFilter.ts`

**Files to Modify:**
- `client/src/pages/SearchPage.tsx` - Integrate new filter

**Tasks:**
1. [ ] Build PriceRangeFilter component
2. [ ] Implement usePriceFilter hook
3. [ ] Integrate with search page
4. [ ] Write component tests
5. [ ] Style for mobile responsiveness
```

### Step 5: Validate Against Spec

As you implement, continuously check:
- ✅ All acceptance criteria met?
- ✅ All security considerations addressed?
- ✅ All tests written and passing?
- ✅ Performance benchmarks met?

### Step 6: Update Implementation Log

Track your progress in the spec:

```markdown
## Implementation Log

**2025-11-16:** Backend API support complete, tests passing
**2025-11-17:** Frontend components built, mobile responsive
**2025-11-18:** Integration testing complete, ready for review
```

### Step 7: Submit Pull Request

Your PR description should reference the spec:

```markdown
## Summary
Implements price range filtering as specified in
`specs/2025-11-16-price-range-filter-spec.md`

## Specification
All requirements from the specification have been implemented:
- [x] FR-1: Price range selection
- [x] FR-2: Real-time filtering
- [x] NFR-1: Performance (p95 < 500ms)
- [x] NFR-2: Security (input validation, parameterized queries)

## Testing
- Unit tests: 15 new tests, all passing
- Integration tests: 5 scenarios covered
- Manual testing: Completed on desktop and mobile

## Security Review
- Input validation implemented
- SQL injection prevention verified
- No sensitive data exposure

Closes #[issue-number]
```

### Step 8: Code Review

Reviewers validate:
1. Implementation matches specification
2. All acceptance criteria met
3. Tests are comprehensive
4. Security considerations addressed
5. Performance benchmarks achieved

### Step 9: Deploy

Once merged, update the spec status:
```markdown
**Status:** Implemented
```

---

## Common Scenarios

### Scenario: Bug Fix

Even bug fixes should have specs! Use a simplified template:

```markdown
# [Bug Name] Fix Specification

**Date:** 2025-11-16
**Status:** Approved

## Bug Description
Search crashes when user enters special characters in the query field.

## Root Cause
Input is not sanitized before being passed to the search API.

## Solution
Add input sanitization using DOMPurify before API call.

## Testing
- [ ] Test with <script> tags
- [ ] Test with SQL injection strings
- [ ] Test with Unicode characters
- [ ] Regression test suite passes

## Security Implications
This fix addresses a potential XSS vulnerability.
```

### Scenario: Refactoring

```markdown
# [Component Name] Refactoring Specification

**Date:** 2025-11-16
**Status:** Approved

## Motivation
The SearchPage component has grown to 800 lines and is difficult to maintain.

## Refactoring Plan
Split into smaller, focused components:
- SearchPage.tsx (orchestration)
- SearchFilters.tsx (filter UI)
- SearchResults.tsx (results display)
- SearchPagination.tsx (pagination controls)

## Non-Goals
No functional changes, purely structural improvement.

## Validation
- [ ] All existing tests still pass
- [ ] No visual changes
- [ ] No performance regression
```

### Scenario: Experimentation / Prototype

For explorations or prototypes, use a lighter "Experiment Spec":

```markdown
# [Experiment Name] Specification

**Type:** Experiment / Prototype
**Date:** 2025-11-16
**Status:** Draft

## Hypothesis
Adding AI-powered vehicle recommendations will increase user engagement.

## Experiment Plan
1. Build prototype using GPT-4 API
2. A/B test with 10% of users
3. Measure engagement metrics

## Success Metrics
- 20% increase in time on site
- 15% increase in saved vehicles
- Positive user feedback (> 4.0/5.0)

## Timeline
2-week prototype, 2-week testing period

## Decision Criteria
If success metrics met → Full implementation spec
If not met → Archive and document learnings
```

---

## Tools and Commands

### Create a New Spec
```bash
npm run spec:create
```

### Validate All Specs
```bash
npm run spec:check
```

### Build (Includes Spec Validation)
```bash
npm run build
```

### Check TypeScript Compilation
```bash
npm run check
```

### Run Tests
```bash
npm test
```

---

## Best Practices

### 1. Start Small, Iterate
Don't try to spec a massive feature all at once. Break it into phases:
- Phase 1: Core functionality
- Phase 2: Enhanced UX
- Phase 3: Advanced features

### 2. Get Early Feedback
Share your spec draft early. Better to revise the spec than the code.

### 3. Be Specific
Vague: "The page should load quickly"
Specific: "Initial page load < 1s (p95), API response < 200ms (p95)"

### 4. Think Security First
Every spec should have a "Security Considerations" section, even for seemingly innocuous features.

### 5. Plan for Failure
Include rollback procedures and error handling strategies.

### 6. Document Decisions
Use the spec to explain WHY you made specific technical choices. Future developers (including yourself) will thank you.

### 7. Keep Specs Updated
If implementation diverges from the spec (with good reason), update the spec to match reality.

---

## FAQ

**Q: Do I really need a spec for a one-line change?**
A: For trivial changes (typo fixes, minor CSS tweaks), a GitHub issue description might suffice. Use judgment. When in doubt, write a brief spec.

**Q: What if requirements change mid-implementation?**
A: Update the spec! Version it if needed. The spec should always reflect current reality.

**Q: Can I start coding while the spec is "Under Review"?**
A: Technically yes, but you risk wasted effort if the spec needs significant changes. Better to get approval first.

**Q: What if I don't know all the details upfront?**
A: Mark sections as "TBD" and include them in "Open Questions." Research and fill in details before implementation.

**Q: How detailed should testing sections be?**
A: Detailed enough that someone else could implement the tests. Include expected inputs, outputs, and edge cases.

---

## MCP Integration

### Context7 Usage

When writing specs that involve external libraries:

```markdown
Use Context7 to fetch current documentation for:
- React Hook Form (latest API)
- Zod (current validation patterns)
- Drizzle ORM (up-to-date query syntax)
```

This prevents outdated or hallucinated API usage in your specs.

### Spec-Driven Development Server

The MCP server validates:
- Specification completeness
- Required sections present
- Status declarations valid
- Cross-references intact

---

## Getting Help

- **Constitution:** See `.claude/CONSTITUTION.md` for the official requirements
- **Template:** Use `specs/TEMPLATE-spec.md` as your starting point
- **Examples:** Look at implemented specs in `specs/` for reference
- **Questions:** Open a discussion or ask in team channels

---

*"A spec is not bureaucracy—it's a conversation with your future self about what you're actually trying to build."*
