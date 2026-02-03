# Contributing to Sincronizado

Thank you for your interest in contributing to Sincronizado! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Git 2.30+
- Bun (for running the CLI from source)
- PowerShell 7+ (Windows) or Bash (macOS/Linux)

Optional:

- Node.js 18+ (for running the Mintlify docs dev server)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Microck/sincronizado.git
cd sincronizado

# Install dependencies
bun install

# Run the CLI from source
bun run dev -- --help
```

### Docs (Mintlify)

Docs content lives in `docs/`.

If you want to preview docs locally, install/run the Mintlify CLI:

```bash
npx mintlify dev
```

If that doesn't detect the project automatically, run it from the docs folder:

```bash
cd docs
npx mintlify dev
```

## How to Contribute

### Reporting Issues

- Use GitHub Issues to report bugs or request features
- Provide clear reproduction steps for bugs
- Include environment details (OS, Node version, etc.)

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests and linting: `npm run lint && npm run format:check`
5. Commit with clear messages following conventional commits
6. Push to your fork and open a Pull Request

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

Examples:
```
feat: add macOS launcher script
fix: resolve sync timeout issue
docs: update quick-start guide
```

## Code Standards

### General

- Follow existing code style and patterns
- Keep functions small and focused
- Use meaningful variable and function names
- Add comments for complex logic only

### Shell Scripts (Bash)

- Use `#!/bin/bash` shebang
- Quote all variables: `"$variable"`
- Use `shellcheck` to validate scripts
- Add error handling with `set -euo pipefail`

### PowerShell Scripts

- Use `Set-StrictMode -Version Latest`
- Include comment-based help
- Validate parameters with `[Parameter()]` attributes
- Use `Write-Verbose` for detailed output

### Documentation

- Write in clear, concise English
- Use Markdown for all documentation
- Include code examples where helpful
- Keep line length under 100 characters

## Testing

- Add tests for new features
- Ensure existing tests pass
- Test on both Windows and macOS when applicable
- Validate scripts with `shellcheck` or PSScriptAnalyzer

Run tests:

```bash
bun test
```

## Questions?

- Open an issue for questions
- Join the OpenCode Discord community

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
