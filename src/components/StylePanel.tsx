import type { DocumentStyle } from "@/lib/document/types";
import styles from "./AppShell.module.css";

type StylePanelProps = {
  value: DocumentStyle;
  onChange: (value: DocumentStyle) => void;
};

export function StylePanel({ value, onChange }: StylePanelProps) {
  const update = <K extends keyof DocumentStyle>(key: K, nextValue: DocumentStyle[K]) => {
    onChange({ ...value, [key]: nextValue });
  };

  return (
    <aside className={styles.settings} aria-label="PDF style settings">
      <label className={styles.field}>
        Body font size
        <input
          aria-label="Body font size"
          type="number"
          min={10}
          max={24}
          value={value.fontSizePx}
          onChange={(event) => update("fontSizePx", Number(event.target.value))}
        />
      </label>
      <label className={styles.field}>
        Line height
        <input
          aria-label="Line height"
          type="number"
          min={1.1}
          max={2.4}
          step={0.1}
          value={value.lineHeight}
          onChange={(event) => update("lineHeight", Number(event.target.value))}
        />
      </label>
      <label className={styles.field}>
        Page size
        <select
          aria-label="Page size"
          value={value.pageSize}
          onChange={(event) => update("pageSize", event.target.value as DocumentStyle["pageSize"])}
        >
          <option value="A4">A4</option>
          <option value="Letter">Letter</option>
        </select>
      </label>
      <label className={styles.field}>
        Page margin
        <input
          aria-label="Page margin"
          type="number"
          min={8}
          max={32}
          value={value.marginMm}
          onChange={(event) => update("marginMm", Number(event.target.value))}
        />
      </label>
      <label className={styles.field}>
        Code font size
        <input
          aria-label="Code font size"
          type="number"
          min={9}
          max={20}
          value={value.codeFontSizePx}
          onChange={(event) => update("codeFontSizePx", Number(event.target.value))}
        />
      </label>
    </aside>
  );
}
