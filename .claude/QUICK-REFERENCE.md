# Spec-Driven Development - Quick Reference

Essential commands and reminders for daily development.

---

## Quick Commands

```bash
# Create a new specification
npm run spec:create

# Validate all specifications
npm run spec:check

# Build (includes spec validation + type checking)
npm run build

# Type checking only
npm run check

# Run tests
npm test
```

---

## Spec File Naming

```
specs/[YYYY-MM-DD]-[feature-name]-spec.md
```

**Examples:**
- `specs/2025-11-16-user-authentication-spec.md`
- `specs/2025-11-16-vehicle-search-spec.md`

---

## Spec Status Lifecycle

```
Draft → Under Review → Approved → Implemented
```

Update status in your spec file:
```markdown
**Status:** Draft | Under Review | Approved | Implemented
```

---

## Required Spec Sections

Every spec MUST include:

- [ ] Overview
- [ ] Requirements (Functional + Non-functional)
- [ ] Technical Design
- [ ] Implementation Plan
- [ ] Testing Strategy
- [ ] Security Considerations
- [ ] Performance Implications

---

## The Golden Rule

**Write the spec first, then write the code. Always.**

---

## Constitutional Documents

- **Constitution:** `.claude/CONSTITUTION.md` - The law of the land
- **Developer Guide:** `.claude/SPEC-DRIVEN-DEVELOPMENT-GUIDE.md` - How to apply it
- **Template:** `specs/TEMPLATE-spec.md` - Your starting point
- **This Reference:** Quick lookup for commands and conventions

---

## Typical Workflow

1. **Create spec** → `npm run spec:create`
2. **Fill out spec** → Use template as guide
3. **Set status** → `**Status:** Under Review`
4. **Get reviewed** → Share with team
5. **Approve spec** → `**Status:** Approved`
6. **Implement** → Follow the implementation plan
7. **Test** → Per testing strategy
8. **PR** → Reference the spec
9. **Merge & Deploy**
10. **Update status** → `**Status:** Implemented`

---

## PR Description Template

```markdown
## Summary
[Brief description of what was implemented]

## Specification
Implements: `specs/YYYY-MM-DD-feature-name-spec.md`

All requirements met:
- [x] Requirement 1
- [x] Requirement 2

## Testing
- Unit tests: [X] new tests
- Integration tests: [X] scenarios
- Manual testing: Completed

## Security Review
[Any security considerations addressed]
```

---

## Emergency Hot-fix Exception

For critical production issues ONLY:

1. Fix the issue immediately
2. Write retroactive spec within 24 hours
3. Document the emergency in the spec
4. Plan spec-driven replacement

See [CONSTITUTION.md](./CONSTITUTION.md) Article VII for details.

---

## MCP Servers Available

- **context7** - Up-to-date API documentation
- **spec-driven** - Specification workflow enforcement
- **playwright** - Browser automation
- **crawl4ai** - Web scraping

Configured in `/.mcp.json`

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Start coding before spec approval
- Skip security considerations
- Write vague requirements
- Ignore performance implications
- Forget to update spec status

✅ **DO:**
- Get spec reviewed early
- Be specific with requirements
- Include acceptance criteria
- Plan for testing upfront
- Keep specs updated

---

## Need Help?

- **Full Guide:** `.claude/SPEC-DRIVEN-DEVELOPMENT-GUIDE.md`
- **Constitution:** `.claude/CONSTITUTION.md`
- **Template:** `specs/TEMPLATE-spec.md`
- **Team:** Ask in project channels

---

*Keep this reference handy! Bookmark it in your editor.*
