---
name: "pipeline-06-document"
description: "Documentation — what needs documenting, where docs live, writing style, and verification for the CDA Extension."
domain: "pipeline"
confidence: "high"
source: "manual"
owner: "Iruka (Tech Writer)"
step: 6
pipeline_position: "After UX review, before final verification"
prev_step: "pipeline-05-ux-review"
next_step: "pipeline-07-verify"
---

## Context

Documentation ensures users and contributors understand what changed and how to use it. Iruka owns documentation quality but works from information provided by earlier pipeline steps. Every user-facing change needs documentation — code without docs is incomplete.

**When this step runs:** After UX review approval (Step 5) or UX skip confirmation.

**When to write LESS:** Bug fixes with no behavior change, internal refactors, test-only changes. Even these may need a changelog entry.

**Output:** Updated documentation matching the code changes, ready for final verification.

## Documentation Locations

| Document                    | What it covers                            | Format    |
|----------------------------|-------------------------------------------|-----------|
| `README.md`                | User guide, features, installation        | Markdown  |
| `DEVELOPMENT-PROCESS.md`   | Contributor guide, architecture, workflow  | Markdown  |
| `package.json` descriptions| Setting and command descriptions           | JSON text |
| `CHANGELOG.md`             | Version history (if maintained)           | Markdown  |
| `.squad/` docs             | Team process, decisions, skills           | Markdown  |

## Patterns

### 1. What Needs Documenting

**Always document:**
- [ ] New commands (what they do, how to invoke)
- [ ] New settings (what they control, valid values, defaults)
- [ ] New UI elements (where they appear, what they show)
- [ ] Changed behavior (before vs after)
- [ ] New tools (MCP tools — purpose, inputs, outputs)
- [ ] Breaking changes (migration guide)

**Usually document:**
- [ ] Bug fixes (if user behavior changes)
- [ ] Performance improvements (if user-noticeable)
- [ ] New dependencies

**Rarely document:**
- [ ] Internal refactors (unless architecture changed)
- [ ] Test additions
- [ ] Build/config changes (unless user-facing)

### 2. Writing Style

**Principles:**
- **Clear:** Write for someone who's never seen the codebase
- **Concise:** Say it in fewer words. Trim ruthlessly.
- **Example-heavy:** Show, don't just tell. Code examples > prose.
- **Scannable:** Use headers, lists, tables. Avoid walls of text.
- **Action-oriented:** Start instructions with verbs: "Open...", "Run...", "Click..."

**Voice:**
- Use second person ("you") for instructions
- Use present tense ("The setting controls..." not "The setting will control...")
- Use active voice ("Run `npm test`" not "Tests are run by...")

### 3. Command Documentation Template

```markdown
### Command: `cda.filterSkills`

**Title:** Filter Skills by Category

**How to use:**
1. Open the Command Palette (`Ctrl+Shift+P`)
2. Type "CDA: Filter Skills"
3. Select a category from the dropdown

**What it does:**
Filters the skills list in the sidebar to show only skills matching
the selected category.

**Example:**
Selecting "pipeline" shows only pipeline-related skills.
```

### 4. Setting Documentation Template

For `package.json` description fields:

```json
{
    "cda.pollInterval": {
        "type": "number",
        "default": 60,
        "minimum": 0,
        "maximum": 600,
        "description": "How often (in seconds) to check for WI/PR status updates. Set to 0 to disable polling. Minimum effective value is 10 seconds."
    }
}
```

**Rules for package.json descriptions:**
- One sentence, no period at end (VS Code convention)
- Include default value context if not obvious
- Mention valid range or options
- Keep under 200 characters when possible

For README.md, expand with more detail:

```markdown
| Setting            | Default | Description                                     |
|--------------------|---------|-------------------------------------------------|
| `cda.pollInterval` | `60`    | Seconds between WI/PR status checks. `0` = off. |
```

### 5. README.md Structure

The README should follow this structure:

```markdown
# CDA Extension

> One-line description

## Features
- Feature list with brief descriptions

## Getting Started
1. Installation steps
2. First-run setup
3. Basic usage

## Commands
Table of all commands

## Settings
Table of all settings with defaults

## Sidebar
Description of sidebar tabs and features

## Troubleshooting
Common issues and solutions

## Contributing
Link to DEVELOPMENT-PROCESS.md
```

### 6. DEVELOPMENT-PROCESS.md Updates

When the development process changes (new tools, new workflow steps, architecture changes):

- Update the architecture section
- Update the build/test commands
- Update the contribution workflow
- Keep examples current

### 7. Documentation Checklist

For every documentation update:

- [ ] **Accuracy:** Documentation matches current code behavior
- [ ] **Completeness:** All new features/settings/commands documented
- [ ] **Examples:** Working code/config examples included
- [ ] **Links:** Internal links are valid, external links work
- [ ] **Formatting:** Markdown renders correctly (headers, tables, code blocks)
- [ ] **Searchability:** Key terms users would search for are present
- [ ] **package.json sync:** Setting descriptions in JSON match README table
- [ ] **No stale content:** Old features/settings removed or updated

### 8. Documentation Verification

**Follow your own guide:** After writing documentation, follow the steps yourself:
1. Read the instructions as if you've never seen the project
2. Verify every command works
3. Verify every setting does what the docs say
4. Verify every screenshot matches current UI
5. Check that all links resolve

**Common verification failures:**
- Setting name in docs doesn't match package.json
- Command name in docs doesn't match `contributes.commands`
- Steps reference UI elements that were renamed
- Code examples use old API or wrong imports

## Anti-Patterns

1. **Writing docs last.** Documentation should be written WITH the feature, not after. If you wait, details get forgotten.

2. **Documenting implementation.** Users don't care that you used a HashMap internally. Document WHAT it does and HOW to use it.

3. **Copy-paste from code comments.** Code comments explain WHY to developers. Docs explain WHAT and HOW to users.

4. **Stale docs.** Out-of-date documentation is worse than no documentation. It actively misleads users.

5. **No examples.** Abstract descriptions without concrete examples are useless. Show the setting value, the command output, the expected result.

6. **Assuming knowledge.** Don't assume users know VS Code internals, TypeScript, or the project architecture. Explain or link.

7. **Walls of text.** If a section is more than 5 sentences of prose, convert to a list or table.

## Handoff to Next Step

**What pipeline-07-verify needs from this step:**
- ✅ All documentation updated to match code changes
- ✅ package.json descriptions in sync with README
- ✅ Documentation verification complete (steps tested)
- ✅ No broken links or stale references

**See also:** pipeline-05-ux-review, pipeline-07-verify
