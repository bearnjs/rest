# Contributing to @bearnjs/rest

We are thrilled that you are considering contributing to the @bearnjs/rest project. Your contributions are invaluable in helping us improve and expand the capabilities of this HTTP framework. Below are some guidelines and processes to ensure that your contributions are effectively integrated into the project.

## Commit Guidelines

When making commits, please adhere to the following guidelines to maintain a clear and consistent project history:

- Use the prefix `feat:` when you are introducing new features. This will automatically trigger a **minor release** of the project, indicating that new functionality has been added.
- Use the prefix `fix:` for commits that resolve bugs. This will trigger a **patch release**, signifying that issues have been addressed and the software is more stable.
- If your changes break backward compatibility, include `BREAKING CHANGE:` in the commit body. This is crucial as it will trigger a **major release**, alerting users to significant changes that may affect their existing implementations.
- For other types of commits, such as `chore:`, `docs:`, and `refactor:`, no release will be triggered. These commits are important for maintenance, documentation, and code quality improvements but do not affect the software's functionality.

## Branch Naming Conventions

To keep our repository organized and to make it easier for everyone to understand the purpose of each branch, please follow these naming conventions:

- For new features, create branches named `feat/<name>`, where `<name>` is a short description of the feature.
- For bug fixes, use `fix/<name>` to clearly indicate the branch's purpose.
- For maintenance tasks, use `chore/<name>`.
- For documentation updates, use `docs/<name>`.
- For code refactoring, use `refactor/<name>`.

## Pull Request Process

Submitting a pull request is a key part of contributing to the project. Please follow these steps to ensure a smooth review process:

- Always use the provided PR template to maintain consistency across submissions. This helps reviewers quickly understand the context and purpose of your changes.
- Clearly link any relevant issues in the pull request description. This provides context and helps track the progress of issues and features.
- Before requesting a review, verify that all tests pass successfully. This ensures that your changes do not introduce new issues and that the codebase remains stable.
- Include a detailed description of the changes made in the pull request. This should cover the motivation behind the changes, the approach taken, and any potential impacts on the project.

By following these guidelines, you help us maintain a high-quality codebase and ensure that your contributions are effectively integrated into the project. Thank you for your efforts and for being a part of the @bearnjs/rest community!
