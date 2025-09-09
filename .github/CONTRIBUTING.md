# Contributing to @alti-js/nestjs-elasticsearch

Thank you for your interest in contributing! This document outlines the process for contributing to this project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/nestjs-elasticsearch.git
   cd nestjs-elasticsearch
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Tests**
   ```bash
   npm test
   npm run test:cov  # with coverage
   ```

4. **Build the Project**
   ```bash
   npm run build
   ```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code, protected branch
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Critical fixes for production

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write tests for new functionality
   - Ensure existing tests pass
   - Follow the coding standards (ESLint will check this)

3. **Test Your Changes**
   ```bash
   npm run lint      # Check code style
   npm test          # Run unit tests
   npm run test:e2e  # Run e2e tests
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

   **Commit Message Format:**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Update documentation if needed
   - Add tests for new functionality
   - Follow the existing code style

2. **PR Requirements**
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes
   - Updated documentation

3. **Review Process**
   - All PRs require at least one review
   - CI checks must pass
   - No merge conflicts

## Release Process

### Automatic Releases (Recommended)

Releases are automatically triggered when code is merged to `main`:

1. **Merge to Main**
   - PRs are merged to `main` after review
   - CI automatically runs tests and builds
   - If version in `package.json` changed, package is published

2. **Manual Version Bump**
   ```bash
   # Before merging to main, update version:
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

### Manual Releases

Use the GitHub Actions workflow for manual releases:

1. Go to Actions → Release
2. Click "Run workflow"
3. Select version type (patch/minor/major/prerelease)
4. The workflow will:
   - Run tests
   - Bump version
   - Create git tag
   - Publish to npm
   - Create GitHub release

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use proper typing, avoid `any`

### Testing
- Write unit tests for all new functionality
- Maintain test coverage above 80%
- Use descriptive test names
- Mock external dependencies

### Documentation
- Update README for new features
- Add JSDoc comments for public APIs
- Include examples in documentation

## Security

### Reporting Vulnerabilities
- **DO NOT** create public issues for security vulnerabilities
- Email security concerns to: [security-email]
- Include detailed reproduction steps

### Dependencies
- Keep dependencies updated
- Run `npm audit` regularly
- Use `npm ci` in production environments

## Getting Help

- **Issues**: Create GitHub issues for bugs/features
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the README and inline docs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
