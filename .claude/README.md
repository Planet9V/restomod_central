# RestoMod Central - Claude Code Configuration

This directory contains the constitutional framework and configuration for AI-assisted development in the RestoMod Central project.

## Constitutional Governance

The **[CONSTITUTION.md](./CONSTITUTION.md)** document establishes spec-driven development as the foundational requirement for all work in this project.

### Key Principles

1. **Specification-First Development**: All features must be specified before implementation
2. **MCP Integration**: Context7 and Spec-Driven Development servers are required
3. **Build-Time Enforcement**: Specifications are validated during the build process
4. **Quality Assurance**: Every spec includes testing, security, and performance requirements

## Quick Start

### Creating a New Feature

1. **Copy the Template**
   ```bash
   cp specs/TEMPLATE-spec.md specs/$(date +%Y-%m-%d)-your-feature-spec.md
   ```

2. **Fill Out the Specification**
   - Complete all required sections
   - Get specification reviewed and approved
   - Reference the spec in your PR

3. **Implement the Feature**
   - Follow the implementation plan in your spec
   - Validate against acceptance criteria
   - Ensure all tests pass

4. **Submit for Review**
   - Link to the specification in your PR description
   - Ensure code matches the specification
   - Address review feedback

## MCP Server Configuration

The project uses the following MCP servers (configured in `/.mcp.json`):

### Context7
**Purpose:** Provides up-to-date API documentation to prevent hallucinated or outdated code

**Usage:** When implementing features that use external libraries, Context7 ensures you're using current, accurate APIs.

### Spec-Driven Development
**Purpose:** Enforces specification-first workflow and validates spec completeness

**Usage:** Automatically validates that specifications exist and are complete before allowing builds to proceed.

### Playwright
**Purpose:** Browser automation for web scraping classic car listings

**Usage:** Used for automated testing and data collection from external sources.

### Crawl4AI
**Purpose:** Self-hosted web scraping (free Firecrawl alternative)

**Usage:** Alternative web scraping solution for data collection.

## Specification Directory

All specifications live in `/specs/` and follow this naming convention:

```
specs/[YYYY-MM-DD]-[feature-name]-spec.md
```

### Specification Status Lifecycle

1. **Draft** - Initial specification being written
2. **Under Review** - Specification submitted for team review
3. **Approved** - Specification approved, ready for implementation
4. **Implemented** - Feature implemented and deployed

## Build Integration

The build process enforces spec-driven development:

```bash
npm run build        # Includes spec validation
npm run spec:check   # Manually check spec compliance
```

### Build Validation Steps

1. Verify specifications exist for active features
2. Check specification approval status
3. Validate TypeScript compilation
4. Run all tests
5. Verify code coverage

## Constitutional Compliance

Every developer working on this project agrees to:

- Write specifications before writing code
- Follow the prescribed development workflow
- Maintain specification-to-implementation traceability
- Uphold security, performance, and quality standards

## Emergency Procedures

For critical production issues, emergency hot-fixes may bypass the full specification process, but:

- A retroactive spec MUST be written within 24 hours
- The emergency fix must be documented
- A proper spec-driven replacement must be planned

See [CONSTITUTION.md](./CONSTITUTION.md) Article VII for details.

## Resources

- **Constitution:** [CONSTITUTION.md](./CONSTITUTION.md)
- **Spec Template:** [/specs/TEMPLATE-spec.md](../specs/TEMPLATE-spec.md)
- **MCP Configuration:** [/.mcp.json](../.mcp.json)
- **Project Documentation:** [/docs](../docs/)

## Questions or Suggestions?

Constitutional amendments can be proposed through the specification process. See the Constitution's Amendment Process section for details.

---

*"Write the spec first, then write the code. Always."*
