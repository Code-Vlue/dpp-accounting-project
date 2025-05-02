# Contributing to DPP Accounting Platform

Thank you for considering contributing to the DPP Accounting Platform! This document outlines the guidelines for contributing to this project.

## Code of Conduct

In the interest of fostering an open and welcoming environment, we expect all participants to adhere to respectful and constructive behavior.

## How Can I Contribute?

### Reporting Bugs

- Use the GitHub issue tracker to report bugs
- Describe the issue in detail, including steps to reproduce
- Include information about your environment (browser, OS, etc.)
- Attach screenshots if applicable

### Suggesting Enhancements

- Use the GitHub issue tracker to suggest enhancements
- Clearly describe the proposed feature, its use case, and benefits
- Consider including mockups or diagrams

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
   ```
   git checkout -b feature/my-new-feature
   ```
3. Implement your changes
4. Run tests, linting, and type checking
   ```
   npm run lint
   npm run type-check
   ```
5. Commit your changes with clear, descriptive messages
   ```
   git commit -m "Add new feature: my feature description"
   ```
6. Push to your branch
   ```
   git push origin feature/my-new-feature
   ```
7. Open a pull request against the `main` branch

## Development Setup

1. Install dependencies
   ```
   npm install
   ```

2. Create a `.env.local` file based on `.env.example`

3. Start the development server
   ```
   npm run dev
   ```

## Style Guidelines

### Code Style

- Follow the project's ESLint and TypeScript configuration
- Use meaningful variable and function names
- Write comments for complex logic

### Git Commit Messages

- Use concise, descriptive commit messages
- Begin with a verb in the imperative tense (e.g., "Add", "Fix", "Update")
- Reference issue numbers where applicable

## Documentation

- Update documentation when making changes to interfaces, APIs, or architecture
- Document new features thoroughly

## Testing

- Add tests for new features
- Ensure existing tests pass before submitting a pull request
- Aim for high test coverage

## Questions?

If you have questions about contributing, please contact the project maintainers.