"use client";

import type { AiPersonalization } from "@/components/ai-component-personalizer";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDailyCopyLimit } from "@/hooks/use-daily-copy-limit";
import {
  useComponentCatalogData,
  type ComponentCatalogSource,
  type ComponentKind as CatalogType,
} from "@/hooks/use-component-catalog-data";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { CompositionCanvas } from "@/components/builder/composition-canvas";
import { CompositionPanel } from "@/components/builder/composition-panel";
import {
  PALETTE_BY_TYPE,
  defaultComposition,
  describeComposition,
  duplicateBlock,
  insertBlockAt,
  moveBlock,
  removeBlock,
  sequentialIds,
  toggleBlockHidden,
  updateBlockText,
  type BuilderBlock,
  type BuilderBlockKind,
  type BuilderComponentType,
} from "@/lib/builder-blocks";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Heart,
  Layers,
  MousePointerClick,
  LayoutDashboard,
  LayoutTemplate,
  Loader2,
  Mail,
  Moon,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Sun,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { useEffect, useMemo, useState, type CSSProperties } from "react";

const AiComponentPersonalizer = dynamic(
  () => import("@/components/ai-component-personalizer"),
);
const ComponentExportPanel = dynamic(
  () => import("@/components/component-export-panel"),
);
const ComponentLibraryActions = dynamic(
  () => import("@/components/component-library-actions"),
);
const ComponentVariantsPanel = dynamic(
  () => import("@/components/component-variants-panel"),
);
const EditorWorkspace = dynamic(
  () => import('@/components/editor/editor-workspace'),
  { ssr: false },
);
const PlatformPromptGenerator = dynamic(
  () => import("@/components/platform-prompt-generator"),
);

type UnifiedItem = {
  id: string;
  type: CatalogType;
  title: string;
  prompt: string;
  membership: string;
  primary: string;
  secondary: string;
  background: string;
};
const labels: Record<CatalogType, { es: string; en: string }> = {
  login: { es: "Login", en: "Login" },
  header: { es: "Headers", en: "Headers" },
  text: { es: "Textos", en: "Text" },
  form: { es: "Formularios", en: "Forms" },
  button: { es: "Botones", en: "Buttons" },
  card: { es: "Cards", en: "Cards" },
  navigation: { es: "Menús", en: "Navigation" },
  sidebar: { es: "Sidebars", en: "Sidebars" },
};
const fonts = {
  inter: "Inter, Arial, sans-serif",
  serif: "Georgia, Times, serif",
  mono: "ui-monospace, SFMono-Regular, monospace",
  display: "Impact, Arial Black, sans-serif",
  rounded: "ui-rounded, Nunito, Arial, sans-serif",
};
const shadowValues = {
  none: "none",
  soft: "0 12px 35px rgba(15,23,42,.14)",
  medium: "0 22px 60px rgba(15,23,42,.22)",
  dramatic: "0 35px 90px rgba(15,23,42,.35)",
  glow: "0 0 45px var(--builder-primary)",
};

function Canvas({
  type,
  primary,
  secondary,
  background,
  font,
  radius,
  spacing,
  shadow,
  heading,
  body,
  cta,
  icon,
  motion,
  dark,
  loading,
  error,
  fieldLabels,
}: {
  type: CatalogType;
  primary: string;
  secondary: string;
  background: string;
  font: keyof typeof fonts;
  radius: number;
  spacing: number;
  shadow: keyof typeof shadowValues;
  heading: string;
  body: string;
  cta: string;
  icon: string;
  motion: boolean;
  dark: boolean;
  loading: boolean;
  error: boolean;
  fieldLabels: string[];
}) {
  const ink = dark ? "#f8fafc" : "#111827",
    muted = dark ? "#a1a1aa" : "#64748b",
    surface = dark ? "#131722" : "#fff";
  const vars = {
    "--builder-primary": primary,
    "--builder-secondary": secondary,
  } as CSSProperties;
  const iconNode =
    icon === "heart" ? (
      <Heart className="size-4" />
    ) : icon === "mail" ? (
      <Mail className="size-4" />
    ) : icon === "settings" ? (
      <Settings className="size-4" />
    ) : icon === "dashboard" ? (
      <LayoutDashboard className="size-4" />
    ) : (
      <Sparkles className="size-4" />
    );
  const control = (
    <button
      className="builder-control inline-flex min-h-11 items-center justify-center gap-2 px-5 text-sm font-black text-white"
      style={{
        borderRadius: radius,
        background: `linear-gradient(100deg,${primary},${secondary})`,
      }}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : iconNode}
      {loading ? "Procesando…" : cta}
      <ArrowRight className="size-4" />
    </button>
  );
  const fields = (
    <div className="space-y-3">
      {fieldLabels.map((field, index) => (
        <label key={field} className="block text-xs font-bold">
          {field}
          {index === fieldLabels.length - 1 ? (
            <textarea
              className="mt-1.5 min-h-20 w-full resize-none border bg-transparent p-3 outline-none"
              style={{
                borderRadius: radius / 1.5,
                borderColor: `${primary}55`,
              }}
            />
          ) : (
            <input
              className="mt-1.5 h-11 w-full border bg-transparent px-3 outline-none"
              style={{
                borderRadius: radius / 1.5,
                borderColor: error ? "#ef4444" : `${primary}55`,
              }}
              placeholder={field}
            />
          )}
        </label>
      ))}
      {error ? (
        <p className="text-xs font-bold text-red-500">
          Revisa los campos marcados antes de continuar.
        </p>
      ) : null}
    </div>
  );
  const content = (
    <>
      <p
        className="text-[10px] font-black uppercase tracking-[.25em]"
        style={{ color: primary }}
      >
        Visual component
      </p>
      <h2 className="mt-3 text-4xl font-black leading-none tracking-[-.05em]">
        {heading}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6" style={{ color: muted }}>
        {body}
      </p>
    </>
  );
  return (
    <div
      className={`builder-canvas relative isolate min-h-[620px] overflow-hidden transition-colors ${motion ? "motion-enabled" : ""}`}
      style={{
        ...vars,
        background,
        color: ink,
        fontFamily: fonts[font],
        padding: spacing,
      }}
    >
      <div
        className="absolute -right-24 -top-28 size-80 rounded-full blur-3xl"
        style={{ background: secondary, opacity: 0.25 }}
      />
      <div
        className="absolute -bottom-28 -left-24 size-72 rounded-full blur-3xl"
        style={{ background: primary, opacity: 0.2 }}
      />
      {type === "header" ? (
        <nav
          className="relative z-10 flex items-center gap-4 border p-3"
          style={{
            borderRadius: radius,
            background: surface,
            borderColor: `${primary}35`,
            boxShadow: shadowValues[shadow],
          }}
        >
          <strong>NOVA</strong>
          <div className="ml-auto hidden gap-5 text-xs font-bold sm:flex">
            <span>Producto</span>
            <span>Soluciones</span>
            <span>Precios</span>
          </div>
          {control}
        </nav>
      ) : null}
      {type === "sidebar" || type === "navigation" ? (
        <aside
          className="relative mb-6 w-full border p-3 sm:absolute sm:bottom-6 sm:left-6 sm:top-6 sm:mb-0 sm:w-52 z-10"
          style={{
            borderRadius: radius,
            background: surface,
            borderColor: `${primary}35`,
            boxShadow: shadowValues[shadow],
          }}
        >
          <strong className="flex items-center gap-2">
            <span
              className="grid size-8 place-items-center rounded-lg text-white"
              style={{ background: primary }}
            >
              {iconNode}
            </span>
            NOVA
          </strong>
          <div className="mt-4 sm:mt-7 grid grid-cols-2 gap-2 sm:grid-cols-1 sm:space-y-2">
            {["Overview", "Projects", "Team", "Settings"].map((x, i) => (
              <div
                key={x}
                className="flex min-h-10 items-center gap-2 px-3 text-xs font-bold"
                style={{
                  borderRadius: radius / 2,
                  background: i === 0 ? primary : "transparent",
                  color: i === 0 ? "#fff" : "inherit",
                }}
              >
                {i === 0 ? (
                  <LayoutDashboard className="size-4 shrink-0" />
                ) : (
                  <Settings className="size-4 shrink-0" />
                )}
                <span className="truncate">{x}</span>
              </div>
            ))}
          </div>
        </aside>
      ) : null}
      <main
        className={`relative z-[1] flex min-h-[500px] items-center justify-center ${type === "sidebar" || type === "navigation" ? "sm:pl-56" : ""}`}
      >
        <section className="w-full max-w-lg" style={{ padding: spacing / 2 }}>
          {type === "text" ? (
            <div className="text-center">
              {content}
              <div
                className="mx-auto mt-5 h-1 w-24"
                style={{
                  background: `linear-gradient(90deg,${primary},${secondary})`,
                }}
              />
            </div>
          ) : null}
          {type === "button" ? (
            <div className="text-center">
              {content}
              <div className="mt-7">{control}</div>
            </div>
          ) : null}
          {type === "login" || type === "form" ? (
            <div
              className="border"
              style={{
                padding: spacing,
                borderRadius: radius,
                background: surface,
                borderColor: `${primary}35`,
                boxShadow: shadowValues[shadow],
              }}
            >
              {content}
              <div className="mt-6">
                {fields}
                <div className="mt-5">{control}</div>
              </div>
            </div>
          ) : null}
          {type === "card" ? (
            <article
              className="overflow-hidden border"
              style={{
                borderRadius: radius,
                background: surface,
                borderColor: `${primary}35`,
                boxShadow: shadowValues[shadow],
              }}
            >
              <div
                className="h-52"
                style={{
                  background: `linear-gradient(135deg,${primary},${secondary})`,
                }}
              />
              <div style={{ padding: spacing }}>
                {content}
                <div className="mt-6 flex items-center justify-between">
                  {control}
                  <button
                    aria-label="Favorite"
                    className="grid size-11 place-items-center rounded-full border"
                    style={{ borderColor: `${primary}45` }}
                  >
                    <Heart className="size-4" />
                  </button>
                </div>
              </div>
            </article>
          ) : null}
          {type === "header" ? (
            <div className="text-center">{content}</div>
          ) : null}
          {type === "sidebar" || type === "navigation" ? (
            <div>
              {content}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div
                  className="h-24 border"
                  style={{
                    borderRadius: radius,
                    background: surface,
                    borderColor: `${primary}30`,
                  }}
                />
                <div
                  className="h-24 border"
                  style={{
                    borderRadius: radius,
                    background: surface,
                    borderColor: `${primary}30`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default function ComponentBuilderClient() {
  const { sources, loading, error } = useComponentCatalogData();
  if (loading || error) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="grid flex-1 place-items-center px-4">
          <div className="text-center">
            {loading ? (
              <Loader2 className="mx-auto size-7 animate-spin text-violet-500" />
            ) : null}
            <p className="mt-3 text-sm text-muted-foreground">
              {error || "Cargando componentes…"}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  return <ComponentBuilderContent sources={sources} />;
}

function ComponentBuilderContent({
  sources,
}: {
  sources: ComponentCatalogSource[];
}) {
  const locale = useLocale(),
    spanish = locale.toLowerCase().startsWith("es"),
    { copyWithDailyLimit } = useDailyCopyLimit();
  const items = useMemo<UnifiedItem[]>(
    () =>
      sources.flatMap(([type, list]) =>
        list.map((item) => {
          const preview = item.preview as {
            primary?: string;
            secondary?: string;
            background?: string;
          };
          return {
            id: item.id,
            type,
            title: spanish ? item.name.es : item.name.en,
            prompt: spanish ? item.prompt.es : item.prompt.en,
            membership: item.membership,
            primary: preview.primary || "#6366f1",
            secondary: preview.secondary || "#22d3ee",
            background: preview.background || "#f8fafc",
          };
        }),
      ),
    [spanish],
  );
  const [type, setType] = useState<CatalogType>("card"),
    [query, setQuery] = useState(""),
    [selectedId, setSelectedId] = useState("card-001");
  const selected =
    items.find((x) => x.id === selectedId) ||
    items.find((x) => x.type === type)!;
  const visible = items.filter(
    (x) =>
      x.type === type && x.title.toLowerCase().includes(query.toLowerCase()),
  );
  const [primary, setPrimary] = useState("#8b5cf6"),
    [secondary, setSecondary] = useState("#ec4899"),
    [background, setBackground] = useState("#09090b"),
    [font, setFont] = useState<keyof typeof fonts>("inter"),
    [radius, setRadius] = useState(24),
    [spacing, setSpacing] = useState(28),
    [shadow, setShadow] = useState<keyof typeof shadowValues>("medium"),
    [heading, setHeading] = useState("Diseña sin límites."),
    [body, setBody] = useState(
      "Personaliza cada detalle visual y convierte el resultado en un prompt listo para producción.",
    ),
    [cta, setCta] = useState("Comenzar ahora"),
    [icon, setIcon] = useState("sparkles"),
    [motion, setMotion] = useState(true),
    [dark, setDark] = useState(true),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(false),
    [fieldLabels, setFieldLabels] = useState(["Email", "Mensaje"]),
    [aiDirection, setAiDirection] = useState(""),
    [copied, setCopied] = useState(false);
  /**
   * Composicion por bloques. Es el modo "Composicion": el lienzo deja de ser
   * una plantilla fija y se monta arrastrando. La plantilla original sigue
   * disponible en el otro modo, sin tocarla.
   */
  const [mode, setMode] = useState<"template" | "compose" | "editor">("template");
  const [blocks, setBlocks] = useState<BuilderBlock[]>(() =>
    defaultComposition(
      type as BuilderComponentType,
      locale,
      sequentialIds(type),
    ),
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  // Cada tipo de componente tiene su propia paleta y su propio punto de partida.
  useEffect(() => {
    setBlocks(
      defaultComposition(
        type as BuilderComponentType,
        locale,
        sequentialIds(`${type}-${Date.now()}`),
      ),
    );
    setSelectedBlockId(null);
  }, [type, locale]);
  const palette = PALETTE_BY_TYPE[type as BuilderComponentType] ?? [];
  const nextBlockId = () => sequentialIds(`${type}-${Date.now()}`);
  const addBlock = (kind: BuilderBlockKind) =>
    setBlocks((current) =>
      insertBlockAt(current, kind, current.length, locale, nextBlockId()),
    );
  const dropBlock = (kind: string, index: number) =>
    setBlocks((current) =>
      insertBlockAt(
        current,
        kind as BuilderBlockKind,
        index,
        locale,
        nextBlockId(),
      ),
    );
  const moveBlockTo = (from: number, to: number) =>
    setBlocks((current) => moveBlock(current, from, to));
  const resetBlocks = () => {
    setBlocks(
      defaultComposition(
        type as BuilderComponentType,
        locale,
        sequentialIds(`${type}-${Date.now()}`),
      ),
    );
    setSelectedBlockId(null);
  };
  const choose = (id: string) => {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    setSelectedId(id);
    setPrimary(item.primary);
    setSecondary(item.secondary);
    setBackground(item.background);
    setDark(
      [
        "#09090b",
        "#03150d",
        "#080b1c",
        "#16051c",
        "#071325",
        "#020617",
      ].includes(item.background),
    );
  };
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get(
      "component",
    );
    const item = items.find((entry) => entry.id === requested);
    if (item) {
      setType(item.type);
      choose(item.id);
    }
  }, [items]);
  const reset = () => {
    setPrimary(selected.primary);
    setSecondary(selected.secondary);
    setBackground(selected.background);
    setFont("inter");
    setRadius(24);
    setSpacing(28);
    setShadow("medium");
    setHeading("Diseña sin límites.");
    setBody(
      "Personaliza cada detalle visual y convierte el resultado en un prompt listo para producción.",
    );
    setCta("Comenzar ahora");
    setIcon("sparkles");
    setMotion(true);
    setLoading(false);
    setError(false);
    setFieldLabels(["Email", "Mensaje"]);
    setAiDirection("");
  };
  const applyAi = (result: AiPersonalization) => {
    setPrimary(result.primary);
    setSecondary(result.secondary);
    setBackground(result.background);
    setHeading(result.heading);
    setBody(result.body);
    setCta(result.cta);
    setIcon(result.icon);
    setFieldLabels(result.fields);
    setDark(result.dark);
    setAiDirection(result.promptAddendum);
  };
  const compositionBrief =
    mode === "compose"
      ? `\n\nCOMPOSITION — BUILD EXACTLY THIS STRUCTURE:\n${describeComposition(blocks, locale)}`
      : "";
  const personalized = `${selected.prompt}${compositionBrief}\n\nVISUAL CUSTOMIZATION — APPLY THESE VALUES EXACTLY:\n- Component: ${selected.title} (${selected.type}).\n- Primary color: ${primary}.\n- Secondary color: ${secondary}.\n- Background: ${background}; theme: ${dark ? "dark" : "light"}.\n- Typography: ${font}; use production-safe loading and fallbacks.\n- Border radius: ${radius}px.\n- Internal spacing: ${spacing}px using a consistent spacing scale.\n- Shadow: ${shadow}.\n- Heading: “${heading}”.\n- Supporting copy: “${body}”.\n- CTA: “${cta}”; icon: ${icon}.\n- Fields or navigation content: ${fieldLabels.join(", ")}.\n- Motion: ${motion ? "enabled with reduced-motion fallback" : "disabled; use immediate state changes"}.\n- Include hover: yes; loading state: ${loading ? "visible in preview and required" : "required"}; error state: ${error ? "visible in preview and required" : "required"}.\n${aiDirection ? `\nAI BUSINESS ADAPTATION\n${aiDirection}\n` : ""}\nPreserve accessibility, responsive behavior, semantic HTML, keyboard support and every functional requirement from the original prompt. Return final code, not a design description.`;
  const copy = async () => {
    const result = await copyWithDailyLimit(() =>
      copyToClipboard(personalized),
    );
    if (result === "copied") {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };
  const download = () => {
    const blob = new Blob([personalized], { type: "text/plain;charset=utf-8" }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `${selected.id}-custom-prompt.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b bg-gradient-to-b from-violet-500/10 to-transparent px-4 py-10">
          <div className="mx-auto max-w-7xl">
            <Badge className="mb-4 bg-violet-600">
              <WandSparkles className="mr-1 size-3.5" />
              {items.length} componentes conectados
            </Badge>
            <h1 className="max-w-4xl font-headline text-4xl font-black tracking-tight md:text-6xl">
              Constructor visual de componentes
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
              Encuentra un componente, personaliza su diseño sin editar código y
              copia un prompt listo para construirlo.
            </p>
          </div>
        </section>
        <div className="mx-auto grid max-w-[1600px] gap-0 border-x border-border/40 xl:grid-cols-[320px_minmax(0,1fr)_350px]">
          <aside className="border-b p-4 md:p-5 xl:border-b-0 xl:border-r xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
            <h2 className="font-bold">1. Elige un componente</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(labels).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    setType(id as CatalogType);
                    const first = items.find((x) => x.type === id);
                    if (first) choose(first.id);
                  }}
                  className={`rounded-xl border p-2 text-xs font-bold ${type === id ? "border-violet-600 bg-violet-600 text-white" : ""}`}
                >
                  {spanish ? label.es : label.en}
                </button>
              ))}
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar…"
                className="pl-9"
              />
            </div>
            <div className="mt-3 max-h-[55vh] space-y-1 overflow-y-auto pr-1">
              {visible.map((item) => (
                <button
                  key={item.id}
                  onClick={() => choose(item.id)}
                  className={`w-full rounded-lg border p-2.5 text-left text-xs ${selected.id === item.id ? "border-violet-600 bg-violet-500/10" : ""}`}
                >
                  <span className="font-bold">{item.title}</span>
                  <span className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                    <span>{item.id}</span>
                    <span>{item.membership}</span>
                  </span>
                </button>
              ))}
            </div>
          </aside>
          <section className="min-w-0 bg-muted/30 p-4 md:p-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-violet-600">
                  2. Vista previa en tiempo real
                </p>
                <h2 className="text-xl font-black">{selected.title}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <div
                  className="inline-flex rounded-full border bg-background p-0.5"
                  role="tablist"
                  aria-label={spanish ? "Modo del lienzo" : "Canvas mode"}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "template"}
                    onClick={() => setMode("template")}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${mode === "template" ? "bg-violet-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <LayoutTemplate className="size-3.5" />
                    {spanish ? "Plantilla" : "Template"}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "compose"}
                    onClick={() => setMode("compose")}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${mode === "compose" ? "bg-violet-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Layers className="size-3.5" />
                    {spanish ? "Composición" : "Compose"}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={mode === "editor"}
                    onClick={() => setMode("editor")}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${mode === "editor" ? "bg-violet-600 text-white" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <MousePointerClick className="size-3.5" />
                    {spanish ? "Editor" : "Editor"}
                    <span className="rounded-full bg-emerald-500/20 px-1.5 text-[9px] font-black text-emerald-300">
                      NUEVO
                    </span>
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDark((value) => !value)}
                >
                  {dark ? (
                    <Sun className="mr-2 size-4" />
                  ) : (
                    <Moon className="mr-2 size-4" />
                  )}
                  {dark ? "Claro" : "Oscuro"}
                </Button>
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="mr-2 size-4" />
                  Restablecer
                </Button>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border bg-background shadow-xl">
              {mode === "editor" ? (
              <EditorWorkspace name={selected.title} />
            ) : mode === "compose" ? (
                <div className="p-4 md:p-6">
                  <CompositionCanvas
                    blocks={blocks}
                    tokens={{
                      primary,
                      secondary,
                      background: dark ? background : "#f8fafc",
                      fontFamily: fonts[font],
                      radius,
                      spacing,
                      shadow: shadowValues[shadow],
                      dark,
                    }}
                    locale={locale}
                    selectedId={selectedBlockId}
                    onSelect={setSelectedBlockId}
                    onMove={moveBlockTo}
                    onDropNew={dropBlock}
                  />
                  <p className="mt-3 text-center text-[0.7rem] text-muted-foreground">
                    {spanish
                      ? "Arrastra los bloques para reordenarlos, o suelta uno nuevo desde la paleta de la derecha."
                      : "Drag blocks to reorder, or drop a new one from the palette on the right."}
                  </p>
                </div>
              ) : (
                <Canvas
                  type={type}
                  primary={primary}
                  secondary={secondary}
                  background={dark ? background : "#f8fafc"}
                  font={font}
                  radius={radius}
                  spacing={spacing}
                  shadow={shadow}
                  heading={heading}
                  body={body}
                  cta={cta}
                  icon={icon}
                  motion={motion}
                  dark={dark}
                  loading={loading}
                  error={error}
                  fieldLabels={fieldLabels}
                />
              )}
            </div>
            <div className="mt-5 rounded-xl border bg-background p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black">Prompt personalizado</p>
                  <p className="text-[10px] text-muted-foreground">
                    Combina requisitos originales y configuración visual.
                  </p>
                </div>
                <Badge variant="outline">
                  {personalized.length.toLocaleString()} caracteres
                </Badge>
              </div>
              <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 text-[10px] leading-5 text-zinc-200">
                {personalized}
              </pre>
            </div>
          </section>
          <aside className="border-t p-4 md:p-5 xl:border-t-0 xl:border-l xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto">
            <h2 className="font-bold">3. Personaliza</h2>
            {mode === "compose" ? (
              <div className="mt-5 rounded-2xl border border-violet-500/25 bg-violet-500/5 p-4">
                <CompositionPanel
                  blocks={blocks}
                  palette={palette}
                  locale={locale}
                  selectedId={selectedBlockId}
                  onSelect={setSelectedBlockId}
                  onAdd={addBlock}
                  onMove={moveBlockTo}
                  onRemove={(id) => {
                    setBlocks((current) => removeBlock(current, id));
                    setSelectedBlockId((current) =>
                      current === id ? null : current,
                    );
                  }}
                  onDuplicate={(id) =>
                    setBlocks((current) =>
                      duplicateBlock(current, id, nextBlockId()),
                    )
                  }
                  onToggleHidden={(id) =>
                    setBlocks((current) => toggleBlockHidden(current, id))
                  }
                  onTextChange={(id, text) =>
                    setBlocks((current) => updateBlockText(current, id, text))
                  }
                  onReset={resetBlocks}
                />
              </div>
            ) : null}
            <div className="mt-5 space-y-5">
              <div>
                <Label className="text-xs font-semibold">Colores</Label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    ["Principal", primary, setPrimary],
                    ["Secundario", secondary, setSecondary],
                    ["Fondo", background, setBackground],
                  ].map(([label, value, setter]) => (
                    <div
                      key={label as string}
                      className="flex flex-col items-center rounded-xl border border-border/70 bg-card/50 p-2 text-center transition-colors hover:border-violet-500/40"
                    >
                      <span className="w-full truncate text-[11px] font-medium text-muted-foreground">
                        {label as string}
                      </span>
                      <div className="relative mt-1.5 flex h-9 w-full items-center justify-center overflow-hidden rounded-lg border border-border/80 shadow-inner">
                        <input
                          type="color"
                          value={value as string}
                          onChange={(e) =>
                            (setter as typeof setPrimary)(e.target.value)
                          }
                          className="absolute inset-[-8px] h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-0 bg-transparent p-0"
                          aria-label={label as string}
                        />
                      </div>
                      <span className="mt-1 font-mono text-[9px] text-muted-foreground uppercase">
                        {value as string}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Tipografía</Label>
                <Select
                  value={font}
                  onValueChange={(value) =>
                    setFont(value as keyof typeof fonts)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(fonts).map((x) => (
                      <SelectItem key={x} value={x}>
                        {x}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex justify-between">
                  <Label>Bordes</Label>
                  <span className="text-xs">{radius}px</span>
                </div>
                <Slider
                  className="mt-3"
                  value={[radius]}
                  min={0}
                  max={40}
                  step={2}
                  onValueChange={(v) => setRadius(v[0])}
                />
              </div>
              <div>
                <div className="flex justify-between">
                  <Label>Espaciado</Label>
                  <span className="text-xs">{spacing}px</span>
                </div>
                <Slider
                  className="mt-3"
                  value={[spacing]}
                  min={12}
                  max={56}
                  step={2}
                  onValueChange={(v) => setSpacing(v[0])}
                />
              </div>
              <div>
                <Label>Sombra</Label>
                <Select
                  value={shadow}
                  onValueChange={(value) =>
                    setShadow(value as keyof typeof shadowValues)
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(shadowValues).map((x) => (
                      <SelectItem key={x} value={x}>
                        {x}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Contenido</Label>
                <Input
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="Título"
                />
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="min-h-20"
                />
                <Input
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  placeholder="CTA"
                />
              </div>
              <div>
                <Label>Icono</Label>
                <Select value={icon} onValueChange={setIcon}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["sparkles", "heart", "mail", "settings", "dashboard"].map(
                      (x) => (
                        <SelectItem key={x} value={x}>
                          {x}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3 rounded-xl border p-3">
                {[
                  ["Animaciones", motion, setMotion],
                  ["Mostrar loading", loading, setLoading],
                  ["Mostrar error", error, setError],
                ].map(([label, value, setter]) => (
                  <div
                    key={label as string}
                    className="flex items-center justify-between"
                  >
                    <Label>{label as string}</Label>
                    <Switch
                      checked={value as boolean}
                      onCheckedChange={setter as (value: boolean) => void}
                    />
                  </div>
                ))}
              </div>
              <Button
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={() => void copy()}
              >
                {copied ? (
                  <Check className="mr-2 size-4" />
                ) : (
                  <Copy className="mr-2 size-4" />
                )}
                {copied ? "Prompt copiado" : "Copiar prompt personalizado"}
              </Button>
              <Button variant="outline" className="w-full" onClick={download}>
                <Download className="mr-2 size-4" />
                Descargar prompt
              </Button>
              <AiComponentPersonalizer
                componentType={selected.type}
                componentName={selected.title}
                basePrompt={selected.prompt}
                current={{
                  primary,
                  secondary,
                  background,
                  heading,
                  body,
                  cta,
                  icon,
                  fields: fieldLabels,
                }}
                onApply={applyAi}
              />
              <PlatformPromptGenerator
                basePrompt={personalized}
                name={selected.title}
                type={selected.type}
              />
              <ComponentLibraryActions componentId={selected.id} />
              <ComponentVariantsPanel
                config={{
                  id: selected.id,
                  type: selected.type,
                  title: selected.title,
                  primary,
                  secondary,
                  background,
                  font,
                  radius,
                  spacing,
                  shadow,
                  heading,
                  body,
                  cta,
                  motion,
                  dark,
                  fields: fieldLabels,
                  icon,
                }}
              />
              <ComponentExportPanel
                config={{
                  id: selected.id,
                  type: selected.type,
                  title: selected.title,
                  primary,
                  secondary,
                  background,
                  font,
                  radius,
                  spacing,
                  shadow,
                  heading,
                  body,
                  cta,
                  motion,
                  dark,
                  fields: fieldLabels,
                  icon,
                }}
              />
              {selected.membership === "Premium" ? (
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/prices">
                    <Sparkles className="mr-2 size-4" />
                    Obtener acceso Premium
                  </Link>
                </Button>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      <style>{`
        .motion-enabled .builder-control {
          transition:
            transform 0.25s,
            filter 0.25s;
        }
        .motion-enabled .builder-control:hover {
          transform: translateY(-3px) scale(1.025);
          filter: brightness(1.08);
        }
        @media (prefers-reduced-motion: reduce) {
          .builder-canvas * {
            animation-duration: 0.001ms !important;
            transition-duration: 0.001ms !important;
          }
        }
      `}</style>
    </div>
  );
}
