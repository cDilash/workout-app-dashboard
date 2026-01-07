# Git Workflow & Reminders

## Post-Update Checklist
After every major update, feature implementation, or architectural change, ensure the following steps are completed:

1. **Verify Build**: Run `npm run build` or the equivalent build command to ensure no regressions.
2. **Lint & Type Check**: Run `npm run lint` and `tsc` to maintain code quality.
3. **Update Documentation**: If the update changed how the app works or added a new feature, update `GEMINI.md` or `CLAUDE.md`.
4. **Commit Changes**: Use descriptive commit messages (e.g., `feat: add strength progression chart`, `fix: parser logic for volume calculations`).
5. **Push to GitHub**: 
   ```bash
   git push origin main
   ```

## Major Milestones
Pushing after these milestones is highly recommended:
- Completing a new visualization widget.
- Updating the data parser for a new mobile app export version.
- Integrating a new UI component library or major refactor.
- Successful implementation of a new page/route.
