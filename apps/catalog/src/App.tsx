import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  Badge,
  Icon,
  Panel,
  SegmentedControl,
  Select,
  ThemeProvider,
  type Density,
  type Theme,
} from "@from-trees/ui";
import { s } from "./styles";
import { pages, behavior, snippets, type PageId } from "./content";
import { Demo, type ExampleState } from "./demos";
function readPage(): PageId {
  return pages.find((p) => p.id === location.hash.slice(1))?.id ?? "overview";
}
export default function App() {
  const [page, setPage] = useState<PageId>(readPage);
  const [theme, setTheme] = useState<Theme>("forest");
  const [density, setDensity] = useState<Density>("comfortable");
  const [state, setState] = useState<ExampleState>("default");
  const [width, setWidth] = useState("fluid");
  const [tab, setTab] = useState("preview");
  useEffect(() => {
    const change = () => {
      setPage(readPage());
      setState("default");
      setTab("preview");
      document.getElementById("content")?.focus();
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const current = pages.find((p) => p.id === page)!;
  useEffect(() => {
    document.title = `${current.title} · From Trees design system`;
  }, [current.title]);
  const isComposition =
    page === "overview" || page === "patterns" || page === "sidebar";
  const hasStates = [
    "lists",
    "buttons",
    "menus",
    "fields",
    "parameters",
    "panels",
  ].includes(page);
  return (
    <ThemeProvider theme={theme} density={density}>
      <a
        href="#content"
        {...stylex.props(s.skipLink)}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("content")?.focus();
        }}
      >
        Skip to content
      </a>
      <div {...stylex.props(s.shell)}>
        <aside {...stylex.props(s.sidebar)}>
          <a href="#overview" {...stylex.props(s.brand)}>
            <span {...stylex.props(s.brandMark)}>↟</span>
            <span>
              From Trees<span {...stylex.props(s.brandSub)}>DESIGN SYSTEM</span>
            </span>
          </a>
          <nav aria-label="Design system" {...stylex.props(s.nav)}>
            {pages.map((p, i) => (
              <div key={p.id}>
                {(i === 0 || p.group !== pages[i - 1].group) && (
                  <p {...stylex.props(s.navGroup)}>{p.group}</p>
                )}
                <a
                  href={`#${p.id}`}
                  aria-current={page === p.id ? "page" : undefined}
                  {...stylex.props(s.navItem, page === p.id && s.navActive)}
                >
                  <Icon name={p.icon} size={15} />
                  {p.title}
                </a>
              </div>
            ))}
          </nav>
          <div {...stylex.props(s.navFooter)}>
            <span>React + StyleX</span>
            <Badge>v0.5.0</Badge>
          </div>
        </aside>
        <main {...stylex.props(s.main)}>
          <header {...stylex.props(s.topbar)}>
            <div {...stylex.props(s.breadcrumb)}>
              <span>Design system</span>
              <Icon name="chevronRight" size={12} />
              <span>{current.title}</span>
            </div>
            <a
              href="https://github.com/from-trees/design-system"
              {...stylex.props(s.topLink)}
              target="_blank"
              rel="noreferrer"
            >
              Source <Icon name="external" size={13} />
            </a>
          </header>
          <div id="content" tabIndex={-1} {...stylex.props(s.content)}>
            <p {...stylex.props(s.eyebrow)}>
              {page === "overview"
                ? "Built together. Used everywhere."
                : current.group}
            </p>
            <div {...stylex.props(s.headingRow)}>
              <h1 {...stylex.props(s.pageTitle)}>
                {page === "overview"
                  ? "Less noise. More clarity."
                  : current.title}
              </h1>
              <Badge tone="warning">
                {page === "sidebar" ? "Prototype" : "Initial release"}
              </Badge>
            </div>
            <p {...stylex.props(s.lede)}>{current.description}</p>
            {page === "adoption" ? (
              <Adoption />
            ) : (
              <div {...stylex.props(s.workspace)}>
                <div {...stylex.props(s.stack)}>
                  {page === "overview" && (
                    <div {...stylex.props(s.notice)}>
                      <Icon name="info" />
                      <span>
                        Start with a real workflow. Open a project’s action menu
                        below, or adjust the cabinet parameters. Every control
                        comes from the shared package.
                      </span>
                    </div>
                  )}
                  <section
                    {...stylex.props(s.card)}
                    aria-label={`${current.title} example`}
                  >
                    <header {...stylex.props(s.cardHeader)}>
                      <h2 {...stylex.props(s.cardTitle)}>
                        {page === "sidebar"
                          ? "Cabinitron · sidebar prototype"
                          : isComposition
                            ? "Cabinitron · composed examples"
                            : "Interactive example"}
                      </h2>
                      {snippets[page] && (
                        <SegmentedControl
                          label="Example display"
                          value={tab}
                          onChange={setTab}
                          options={[
                            { value: "preview", label: "Preview" },
                            { value: "code", label: "Code" },
                          ]}
                        />
                      )}
                    </header>
                    {tab === "code" ? (
                      <pre {...stylex.props(s.code)}>
                        <code>{snippets[page]}</code>
                      </pre>
                    ) : (
                      <div
                        {...stylex.props(
                          !isComposition && s.canvas,
                          isComposition && s.prose,
                        )}
                      >
                        <div
                          {...stylex.props(
                            !isComposition && s.canvasInner,
                            width === "narrow" && s.narrow,
                          )}
                        >
                          <Demo key={page} page={page} state={state} />
                        </div>
                      </div>
                    )}
                    <div {...stylex.props(s.notes)}>
                      <Icon name="info" size={14} />
                      <span>
                        {isComposition
                          ? "Synthetic data. Actions affect this demo only."
                          : "Live React components, imported from @from-trees/ui. Changes here exercise the package applications will use."}
                      </span>
                    </div>
                  </section>
                  <section {...stylex.props(s.card, s.prose)}>
                    <h2 {...stylex.props(s.heading)}>Behavior & usage</h2>
                    <ul {...stylex.props(s.list)}>
                      {(
                        behavior[page] ?? [
                          "Shared components stay independent of application data and permissions.",
                          "Keep common controls visible; organize uncommon details into named sections.",
                          "Use the catalog to inspect behavior before application adoption.",
                        ]
                      ).map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  </section>
                  {page === "overview" && (
                    <div {...stylex.props(s.grid)}>
                      <section {...stylex.props(s.card, s.prose)}>
                        <h2 {...stylex.props(s.heading)}>
                          One language, many tools
                        </h2>
                        <p {...stylex.props(s.text)}>
                          Shared behaviors and components. Application themes
                          and density settings. Cabinitron is the first adopter;
                          the system has no dependency on it.
                        </p>
                      </section>
                      <section {...stylex.props(s.card, s.prose)}>
                        <h2 {...stylex.props(s.heading)}>
                          Build → review → adopt
                        </h2>
                        <p {...stylex.props(s.text)}>
                          Explore states here, review a composed workflow, then
                          integrate a versioned package into an application.
                        </p>
                      </section>
                    </div>
                  )}
                </div>
                <aside {...stylex.props(s.inspector)}>
                  <Panel title="Preview settings">
                    <Select
                      label="Theme"
                      value={theme}
                      onChange={(e) => setTheme(e.currentTarget.value as Theme)}
                    >
                      <option value="forest">Forest</option>
                      <option value="slate">Slate</option>
                      <option value="dark">Dark</option>
                    </Select>
                    <Select
                      label="Density"
                      value={density}
                      onChange={(e) =>
                        setDensity(e.currentTarget.value as Density)
                      }
                    >
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                    </Select>
                    {!isComposition && (
                      <Select
                        label="Example width"
                        value={width}
                        onChange={(e) => setWidth(e.currentTarget.value)}
                      >
                        <option value="fluid">Fluid</option>
                        <option value="narrow">Narrow · 320 px</option>
                      </Select>
                    )}
                    {hasStates && (
                      <Select
                        label="Example state"
                        value={state}
                        onChange={(e) =>
                          setState(e.currentTarget.value as ExampleState)
                        }
                      >
                        <option value="default">Default</option>
                        <option value="disabled">Disabled</option>
                        {["buttons", "fields", "lists"].includes(page) && (
                          <option value="loading">
                            {page === "lists"
                              ? "Loading"
                              : "Loading / read-only"}
                          </option>
                        )}
                        {["fields", "parameters", "lists"].includes(page) && (
                          <option value="error">
                            {page === "lists" ? "Error" : "Validation"}
                          </option>
                        )}
                      </Select>
                    )}
                  </Panel>
                  <div {...stylex.props(s.prose)}>
                    <p {...stylex.props(s.eyebrow)}>Review checklist</p>
                    <ul {...stylex.props(s.list)}>
                      <li>Keyboard & focus</li>
                      <li>Short, clear labels</li>
                      <li>Contextual feedback</li>
                      <li>Narrow layouts</li>
                      <li>Theme & density</li>
                    </ul>
                  </div>
                </aside>
              </div>
            )}
            <footer {...stylex.props(s.footer)}>
              <span>From Trees · shared foundations</span>
              <span>Independent of application releases</span>
            </footer>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
function Adoption() {
  return (
    <div {...stylex.props(s.stack)} {...stylex.props(s.adoption)}>
      <section {...stylex.props(s.card, s.prose)}>
        <h2 {...stylex.props(s.heading)}>Install the package</h2>
        <p {...stylex.props(s.text)}>
          Install the confirmed evaluation tarball. New components stay in
          catalog review until confirmation and a versioned release. The package
          installs as @from-trees/ui and includes native React, TypeScript and
          StyleX sources.
        </p>
        <pre {...stylex.props(s.code)}>
          <code>{`npm install https://github.com/from-trees/design-system/releases/download/v0.3.0/from-trees-ui-0.2.1.tgz`}</code>
        </pre>
        <p {...stylex.props(s.small)}>
          GitHub Packages publication is a separate maintainer workflow after
          adoption review. Registry configuration and contribution guidance are
          in the repository README.
        </p>
      </section>
      <section {...stylex.props(s.card)}>
        <div {...stylex.props(s.prose)}>
          <h2 {...stylex.props(s.heading)}>Use in any React application</h2>
          <p {...stylex.props(s.text)}>
            The consuming app compiles the library’s StyleX alongside its own
            styles. Use the shared Vite integration and import tokens directly.
          </p>
        </div>
        <pre {...stylex.props(s.code)}>
          <code>{`import {ThemeProvider, Button, MenuButton} from '@from-trees/ui';\n\nexport default function App() {\n  return (\n    <ThemeProvider theme="forest" density="compact">\n      <Button icon="save" variant="primary" onPress={save}>\n        Save\n      </Button>\n    </ThemeProvider>\n  );\n}`}</code>
        </pre>
      </section>
      <section {...stylex.props(s.card, s.prose)}>
        <h2 {...stylex.props(s.heading)}>Contribution contract</h2>
        <ul {...stylex.props(s.list)}>
          <li>
            Implement shared components in packages/ui. The catalog imports
            their native source API.
          </li>
          <li>
            Add working examples, usage guidance and meaningful interaction
            tests.
          </li>
          <li>Run npm run check. Inspect desktop and narrow layouts.</li>
          <li>
            Open a PR with screenshots and behavior notes before adoption.
          </li>
          <li>
            Keep business logic, permission checks, persistence and domain
            adapters in consuming applications.
          </li>
          <li>
            Version changes deliberately. Document breaking changes and
            migration steps.
          </li>
        </ul>
      </section>
      <section {...stylex.props(s.card, s.prose)}>
        <h2 {...stylex.props(s.heading)}>Next coverage</h2>
        <p {...stylex.props(s.text)}>
          This initial release establishes the component and review foundation.
          Dedicated table, visual picker, tabs, progress, toast and richer
          toolbar components remain tracked in the repository roadmap.
          Application migration has not started.
        </p>
      </section>
      <p {...stylex.props(s.small)}>
        References:{" "}
        <a href="https://stylexjs.com/docs/learn/installation/vite/">
          StyleX build integration
        </a>{" "}
        ·{" "}
        <a href="https://react-aria.adobe.com/">
          React Aria interaction primitives
        </a>{" "}
        ·{" "}
        <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages">
          GitHub Pages deployment
        </a>
      </p>
    </div>
  );
}
