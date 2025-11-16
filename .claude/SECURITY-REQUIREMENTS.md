# Security Requirements - Constitutional Mandate

**Status:** REQUIRED FOR ALL DEVELOPMENT
**Enforcement:** Build process will fail if violated
**Last Updated:** 2025-11-16

---

## 🚨 Critical Security Rules

### Rule 1: NEVER Commit Secrets to Git

**FORBIDDEN:**
- ❌ API keys in code files
- ❌ Passwords in configuration files
- ❌ Tokens in environment files that are committed
- ❌ Database credentials in source code
- ❌ Private keys in any committed file

**ALLOWED:**
- ✅ Environment variable references: `process.env.API_KEY`
- ✅ Template files: `.env.example` with placeholder values
- ✅ Documentation referencing where to get keys
- ✅ Encrypted secrets in secure vaults (if using)

### Rule 2: Use Environment Variables

**Required Setup:**

```bash
# .env (NEVER commit - already in .gitignore)
OPENAI_API_KEY=sk-proj-...
PERPLEXITY_API_KEY=pplx-...
# ... all other keys
```

**Access Pattern:**

```typescript
// ✅ CORRECT
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// ❌ WRONG
const apiKey = "sk-proj-hardcoded-key-here";
```

### Rule 3: Key Rotation Policy

**Requirements:**
- 🔄 Rotate all API keys every 90 days
- 🔄 Rotate immediately if:
  - Key is exposed (shared in chat, email, etc.)
  - Team member with access leaves
  - Suspicious activity detected
  - Service reports potential compromise

**Documentation:**
- Track rotation dates in secure password manager
- Document which services use which keys
- Maintain emergency revocation procedures

### Rule 4: Least Privilege Access

**API Key Scoping:**
- Create separate keys for dev/staging/production
- Use read-only keys when write access not needed
- Scope keys to minimum required permissions
- Use short-lived tokens when possible

**Example:**
```typescript
// Production: Full access key
// Staging: Limited scope key
// Development: Test mode key or separate account
```

### Rule 5: Secret Scanning

**Automated Protection:**

```bash
# Add pre-commit hook to scan for secrets
npm install --save-dev @secretlint/secretlint-rule-preset-recommend

# .secretlintrc.json
{
  "rules": [
    {
      "id": "@secretlint/secretlint-rule-preset-recommend"
    }
  ]
}
```

**Manual Checks:**
```bash
# Before committing, always check:
git diff --cached | grep -E "(api[_-]?key|secret|token|password)"
```

### Rule 6: Production Secrets Management

**For Production Deployment:**

**Option 1: Cloud Provider Secrets (Recommended)**
- AWS Secrets Manager
- Google Cloud Secret Manager
- Azure Key Vault
- Replit Secrets (for Replit deployment)

**Option 2: Environment Variables**
- Railway/Render/Vercel: Use dashboard to set env vars
- Never hardcode in deployment configs

**Example (Railway):**
```bash
# Set via Railway dashboard or CLI
railway variables set OPENAI_API_KEY=sk-proj-...
```

### Rule 7: Emergency Response

**If a Secret is Exposed:**

1. **Immediate (< 5 minutes):**
   - Revoke the exposed key/token
   - Generate new key/token
   - Update production environment variables

2. **Short-term (< 1 hour):**
   - Audit logs for unauthorized usage
   - Check for unexpected charges
   - Review access logs for suspicious activity

3. **Long-term (< 24 hours):**
   - Post-mortem: How did exposure happen?
   - Update processes to prevent recurrence
   - Document incident and resolution

4. **Git History Cleanup (if committed):**
```bash
# Remove secret from all git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file/with/secret" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: Coordinate with team)
git push origin --force --all
git push origin --force --tags
```

---

## 🔐 Service-Specific Security Requirements

### OpenAI API
- ✅ Set usage limits in OpenAI dashboard
- ✅ Monitor usage daily
- ✅ Use organization-scoped keys (not personal)
- ✅ Enable request logging for audit

### Perplexity AI
- ✅ Set rate limits
- ✅ Monitor credit usage
- ✅ Use project-specific keys

### GitHub Tokens
- ✅ Use fine-grained personal access tokens (not classic)
- ✅ Scope to specific repositories
- ✅ Set expiration dates (max 1 year)
- ✅ Use deploy keys for CI/CD (read-only when possible)

### Firecrawl API
- ✅ Set monthly credit limits
- ✅ Monitor scraping job costs
- ✅ Use separate keys for dev/prod

### Database Credentials
- ✅ Never use root/admin user for application
- ✅ Create application-specific database user
- ✅ Grant minimum required permissions
- ✅ Use connection pooling with limits
- ✅ Enable SSL/TLS for connections

---

## 📋 Security Checklist for Every Spec

When writing specifications, include this security section:

### Template Security Section

```markdown
## Security Considerations

### Authentication & Authorization
- [ ] Who can access this feature?
- [ ] What permissions are required?
- [ ] How is authentication verified?

### Data Protection
- [ ] What sensitive data is handled?
- [ ] How is it encrypted (in transit and at rest)?
- [ ] What is the data retention policy?

### Input Validation
```typescript
// Example validation
const schema = z.object({
  field: z.string().min(1).max(255),
  // Always validate, sanitize, escape
});
```

### API Key Usage
- [ ] Which API keys does this feature use?
- [ ] Are rate limits implemented?
- [ ] Are errors logged (without exposing keys)?
- [ ] Is usage monitored?

### Known Vulnerabilities
- [ ] SQL injection: Using parameterized queries?
- [ ] XSS: Sanitizing user input?
- [ ] CSRF: Using CSRF tokens?
- [ ] Authentication bypass: Proper middleware?

### Security Testing
- [ ] Unit tests for validation
- [ ] Integration tests for auth
- [ ] Manual security review
- [ ] Automated security scan
```

---

## 🛠️ Development Workflow Security

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/Planet9V/restomod_central.git

# 2. Copy environment template
cp .env.example .env

# 3. Add your development API keys to .env
nano .env

# 4. NEVER commit .env
git status  # Should NOT show .env as changed

# 5. Use dotenv in development
npm run dev  # Automatically loads .env
```

### Code Review Requirements

**Every PR must verify:**
- [ ] No hardcoded secrets
- [ ] All API calls use environment variables
- [ ] Input validation on all user inputs
- [ ] Error messages don't expose sensitive info
- [ ] Logs don't contain secrets
- [ ] Dependencies are up to date (no known vulnerabilities)

### Pre-Commit Checklist

```bash
# Before every commit:
1. git diff --cached | grep -i "api.key\|secret\|token\|password"
   # Should return NO matches

2. git diff --cached | grep ".env$"
   # Should return NO matches (unless .env.example)

3. npm audit
   # Should show NO high/critical vulnerabilities

4. npm run check
   # TypeScript should compile without errors
```

---

## 🚨 Incident Response Plan

### If API Key is Exposed

**Example Scenario: OpenAI key leaked in git commit**

```bash
# 1. IMMEDIATE: Revoke key (OpenAI dashboard)
# Time: 2 minutes

# 2. Generate new key
# Time: 1 minute

# 3. Update production environment
railway variables set OPENAI_API_KEY=new-key-here
# Time: 2 minutes

# 4. Update local .env
echo "OPENAI_API_KEY=new-key-here" >> .env
# Time: 1 minute

# 5. Remove from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch server/leaked-file.ts" \
  --prune-empty --tag-name-filter cat -- --all
# Time: 5-10 minutes

# 6. Force push (coordinate with team first!)
git push origin --force --all
# Time: 2 minutes

# Total incident response time: ~15-20 minutes
```

### If Database Compromised

```sql
-- 1. IMMEDIATE: Revoke compromised user
REVOKE ALL PRIVILEGES ON DATABASE restomod_central FROM compromised_user;
DROP USER compromised_user;

-- 2. Create new user with minimal privileges
CREATE USER new_app_user WITH PASSWORD 'new-secure-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO new_app_user;

-- 3. Update DATABASE_URL in environment
-- 4. Audit logs for unauthorized queries
-- 5. Check for data exfiltration
```

---

## 📊 Security Monitoring

### Required Monitoring

**Daily:**
- [ ] OpenAI API usage (check for spikes)
- [ ] Error logs (check for auth failures)
- [ ] Database connection logs

**Weekly:**
- [ ] npm audit (dependency vulnerabilities)
- [ ] Review API key usage across all services
- [ ] Check for failed login attempts

**Monthly:**
- [ ] Rotate development API keys
- [ ] Review access logs
- [ ] Security dependency updates

**Quarterly:**
- [ ] Rotate all production API keys
- [ ] Full security audit
- [ ] Review and update security policies

---

## ✅ Compliance Checklist

### Before Every Release

- [ ] All secrets in environment variables (not code)
- [ ] .env is in .gitignore
- [ ] .env.example is up to date (no real secrets)
- [ ] No secrets in git history
- [ ] npm audit shows no high/critical vulnerabilities
- [ ] All database queries use parameterized statements
- [ ] User inputs are validated and sanitized
- [ ] Error messages don't expose system details
- [ ] API rate limiting is enabled
- [ ] Logging excludes sensitive data
- [ ] HTTPS enforced for all connections
- [ ] Security headers configured (CORS, CSP, etc.)

---

## 📚 Resources

### Tools
- **Secretlint**: Automated secret scanning
- **npm audit**: Dependency vulnerability scanning
- **OWASP ZAP**: Security testing
- **git-secrets**: Prevent committing secrets

### Documentation
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **API Security Best Practices**: https://owasp.org/www-project-api-security/
- **Node.js Security Best Practices**: https://nodejs.org/en/docs/guides/security/

### Training
- **OWASP Secure Coding Practices**: Free guide
- **API Security Academy**: Free course
- **Node.js Security**: Official documentation

---

**Remember: Security is not optional. It's a constitutional requirement.**

*Last Updated: 2025-11-16*
*Next Review: 2026-02-16*
