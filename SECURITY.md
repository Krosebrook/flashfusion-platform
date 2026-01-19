# Security Policy

## Supported Versions

The following versions of FlashFusion are currently supported with security updates:

| Version | Supported          |
|---------|--------------------|
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of these methods:

1. **GitHub Private Vulnerability Reporting** (Preferred)
   - Go to the repository's Security tab
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email**
   - Send an email to: security@flashfusion.dev
   - Include "SECURITY" in the subject line

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Full paths of source files related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact assessment of the vulnerability
- Any potential mitigations you've identified

### Response Timeline

| Action | Timeline |
|--------|----------|
| Initial acknowledgment | Within 48 hours |
| Status update | Within 7 days |
| Vulnerability assessment | Within 14 days |
| Fix development | Within 30 days (critical) / 90 days (other) |
| Public disclosure | After fix is released |

### What to Expect

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
2. **Assessment**: We will assess the vulnerability and determine its severity
3. **Updates**: We will keep you informed of our progress
4. **Resolution**: We will develop and test a fix
5. **Credit**: With your permission, we will credit you in our release notes

---

## Security Update Policy

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Exploitable remotely with no authentication | 24-48 hours |
| High | Exploitable with limited prerequisites | 7 days |
| Medium | Requires significant user interaction | 30 days |
| Low | Limited impact or difficult to exploit | 90 days |

### Update Distribution

Security updates are distributed through:

1. GitHub Releases with security advisories
2. npm package updates
3. Email notification to registered maintainers

---

## Known Security Considerations

### Authentication

- All authentication is handled through Supabase Auth
- JWT tokens are used for API authentication
- Session cookies are HTTP-only and secure

### Data Protection

- Row-Level Security (RLS) is enabled on all database tables
- Users can only access their own data
- Service role keys are never exposed to clients

### API Security

- Rate limiting is implemented on all endpoints
- Input validation using Zod schemas
- CORS is configured for allowed origins only

### Infrastructure

- HTTPS is enforced on all connections
- Security headers are set via middleware:
  - Strict-Transport-Security (HSTS)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: SAMEORIGIN
  - Referrer-Policy: strict-origin-when-cross-origin

---

## Security Best Practices for Contributors

### Code Security

1. **Never commit secrets** to the repository
   - Use environment variables
   - Add sensitive files to `.gitignore`

2. **Validate all input**
   - Use Zod schemas for runtime validation
   - Sanitize user input before database operations

3. **Use parameterized queries**
   - Never concatenate user input into SQL
   - Use Supabase's query builder

4. **Handle errors safely**
   - Never expose stack traces to users
   - Log errors server-side only

### Dependency Security

1. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

2. **Review new dependencies**
   - Check for known vulnerabilities
   - Verify package authenticity
   - Prefer well-maintained packages

3. **Use lock files**
   - Always commit `package-lock.json`
   - Use exact versions for critical dependencies

### Environment Security

1. **Separate environments**
   - Use different credentials for dev/staging/production
   - Never use production data in development

2. **Rotate credentials regularly**
   - API keys
   - Database passwords
   - Service accounts

---

## Security Checklist for PRs

Before submitting a PR, ensure:

- [ ] No secrets or credentials in code
- [ ] Input validation on all user inputs
- [ ] Proper error handling without information leakage
- [ ] Authentication required for protected resources
- [ ] Authorization checks for data access
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Dependencies are up to date
- [ ] Security-relevant code has been reviewed

---

## Acknowledgments

We would like to thank the following individuals for responsibly disclosing security issues:

*No acknowledgments yet.*

---

## Contact

For security-related questions that are not vulnerabilities, please contact:

- Email: security@flashfusion.dev
- GitHub Discussions: [Security category](https://github.com/flashfusion/uargo/discussions/categories/security)

---

*This security policy is subject to change. Last updated: December 2025*
