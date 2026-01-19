# Contributing to FlashFusion

Thank you for your interest in contributing to FlashFusion! This document provides guidelines and instructions for contributing.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Testing Requirements](#testing-requirements)

---

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm or pnpm
- Git
- A GitHub account

### First-Time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/uargo.git
   cd uargo
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/flashfusion/uargo.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```

---

## Development Setup

### Environment Configuration

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Configure required variables (see [README.md](README.md#configuration) for details)

### Running Locally

```bash
# Start development server
npm run dev

# Run audit scripts
npm run audit

# Run tests
npm test
```

### Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix linting issues |
| `npm run type-check` | Run TypeScript type checking |

---

## How to Contribute

### Types of Contributions

We welcome the following types of contributions:

- **Bug Fixes**: Fix issues reported in GitHub Issues
- **Features**: Implement new functionality (discuss first in an issue)
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Refactoring**: Improve code quality without changing behavior

### Contribution Workflow

1. **Check existing issues** to avoid duplicate work
2. **Create or claim an issue** for the work you want to do
3. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** following our coding standards
5. **Write or update tests** as needed
6. **Commit your changes** using conventional commit messages
7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request** against the `main` branch

---

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode (`strict: true` in tsconfig.json)
- Avoid `any` types; use `unknown` if type is truly unknown
- Define explicit return types for functions
- Use interfaces for object shapes, types for unions/primitives

```typescript
// Good
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

function getUser(id: string): Promise<User | null> {
  // implementation
}

// Avoid
function getUser(id: any): any {
  // implementation
}
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Include trailing commas in multi-line arrays/objects
- Maximum line length: 100 characters
- Use meaningful variable and function names

### File Organization

- One component/module per file
- Use barrel exports (`index.ts`) for directories
- Group related files in feature directories
- Keep files under 300 lines when possible

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `health-check.ts` |
| Components | PascalCase | `HealthStatus.tsx` |
| Functions | camelCase | `checkHealth()` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Interfaces | PascalCase with `I` prefix (optional) | `User` or `IUser` |
| Types | PascalCase | `HealthStatus` |

### Documentation

- Add JSDoc comments to public functions and interfaces
- Include `@param`, `@returns`, and `@example` where appropriate
- Write comments for complex logic, not obvious code

```typescript
/**
 * Tests a URL for availability and measures response time.
 *
 * @param url - The URL to test
 * @returns Health check result including status and response time
 * @throws {ValidationError} If URL is malformed
 *
 * @example
 * ```typescript
 * const result = await testUrl('https://example.com');
 * console.log(result.status); // 'alive' | 'dead' | 'slow'
 * ```
 */
async function testUrl(url: string): Promise<HealthCheckResult> {
  // implementation
}
```

---

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Changes that don't affect code meaning (formatting) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `build` | Changes to build system or dependencies |
| `ci` | Changes to CI configuration |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Reverts a previous commit |

### Examples

```bash
# Feature
feat(audit): add parallel URL testing for improved performance

# Bug fix
fix(health-check): handle timeout errors gracefully

# Documentation
docs(readme): add configuration section

# Breaking change
feat(api)!: change response format for health endpoint

BREAKING CHANGE: The health endpoint now returns a different JSON structure.
```

### Scope

Common scopes for this project:

- `audit` - Audit engine changes
- `analyze` - Analysis engine changes
- `export` - Export functionality
- `api` - API routes
- `auth` - Authentication
- `db` - Database/Supabase
- `ui` - User interface
- `deps` - Dependencies

---

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**:
   ```bash
   npm test
   ```

2. **Run linting**:
   ```bash
   npm run lint
   ```

3. **Run type checking**:
   ```bash
   npm run type-check
   ```

4. **Update documentation** if needed

5. **Rebase on latest main**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

### PR Requirements

- Clear, descriptive title following commit convention
- Description explaining what and why
- Link to related issue(s)
- Screenshots for UI changes
- Test coverage for new code
- No merge conflicts

### PR Template

When you open a PR, please use this template:

```markdown
## Description
Brief description of the changes.

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested these changes.

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have added tests for my changes
- [ ] All new and existing tests pass
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. Automated checks must pass (CI, linting, tests)
2. At least one maintainer approval required
3. All review comments must be addressed
4. Squash and merge is preferred for clean history

---

## Issue Reporting Guidelines

### Before Creating an Issue

- Search existing issues to avoid duplicates
- Check the documentation for answers
- Ensure you're using the latest version

### Bug Reports

Include:
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, etc.)
- Error messages and stack traces
- Screenshots if applicable

### Feature Requests

Include:
- Clear, descriptive title
- Problem statement (what problem does this solve?)
- Proposed solution
- Alternative solutions considered
- Additional context

---

## Testing Requirements

### Test Coverage

- Minimum 80% coverage for new code
- All new features must include tests
- Bug fixes should include regression tests

### Types of Tests

| Type | Location | Purpose |
|------|----------|---------|
| Unit | `__tests__/*.test.ts` | Test individual functions |
| Integration | `__tests__/integration/` | Test component interactions |
| E2E | `e2e/` | Test full user flows |

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { determineStatus } from '../audit';

describe('determineStatus', () => {
  it('should return alive for responses under 3 seconds', () => {
    const result = determineStatus(200, 2500, true);
    expect(result).toBe('alive');
  });

  it('should return slow for responses between 3-10 seconds', () => {
    const result = determineStatus(200, 5000, true);
    expect(result).toBe('slow');
  });

  it('should return dead for non-200 status codes', () => {
    const result = determineStatus(500, 100, true);
    expect(result).toBe('dead');
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- audit.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

---

## Questions?

If you have questions about contributing, please:

1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/flashfusion/uargo/issues)
3. Open a [new discussion](https://github.com/flashfusion/uargo/discussions)

---

Thank you for contributing to FlashFusion!
