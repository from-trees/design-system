# From Trees design-system instructions

- Use native React and StyleX sources for our shared stack; do not introduce authored CSS files or a precompiled library CSS import.
- Build shared components, tokens, utilities and behavior in the design system and catalog first. Obtain the user's confirmation of the catalog behavior before implementing app adoption. Keep design-system changes and app adoption in separate changes and reviews; do not work on them in parallel. Passing tests alone is not confirmation.
- Existing confirmed components may be adopted without reopening design exploration. New reusable changes discovered during integration return here for catalog review first.
- Apps own business data, authorization, geometry, persistence and navigation.
- Create a GitHub PR for every completed change. Do not self-approve or merge. Main publishes the catalog automatically.
- Run checks appropriate to code changes. Documentation-only changes do not require the component test suite or builds.
