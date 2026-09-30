import { COUNTRIES } from "../data/countries";
import { modeConfig } from "../data/copy";
import type { HvhMode } from "../types";
import { Button, Note, Panel, Row, Stack } from "./Primitives";

export function ModeSelectScreen({
  modes,
  rounds,
  enableCountrySelection,
  countries,
  country,
  onCountry,
  onStart,
  onBack,
  best,
}: {
  modes: HvhMode[];
  rounds?: number;
  enableCountrySelection: boolean;
  countries?: { code: string; name: string }[];
  country: string;
  onCountry: (code: string) => void;
  onStart: (mode: HvhMode) => void;
  onBack: () => void;
  best: number;
}) {
  const list = countries && countries.length ? countries : COUNTRIES;
  return (
    <div className="hvh-stack hvh-gap-24">
      <div className="hvh-stack hvh-gap-8 hvh-fade">
        <span className="hvh-eyebrow">CHOOSE YOUR BATTLE</span>
        <h2 className="hvh-h2">How long do you want to be wrong?</h2>
      </div>

      <div className="hvh-modes hvh-fade-1">
        {modes.map((mode) => {
          const cfg = modeConfig(mode, rounds);
          return (
            <button
              key={mode}
              type="button"
              className="hvh-mode"
              onClick={() => onStart(mode)}
              aria-label={`${cfg.rounds} rounds. ${cfg.name}. ${cfg.blurb}`}
            >
              {cfg.badge ? <span className="hvh-badge">{cfg.badge}</span> : null}
              <span className="hvh-mode-name">{cfg.name}</span>
              <span className="hvh-mode-blurb">{cfg.blurb}</span>
            </button>
          );
        })}
      </div>

      {enableCountrySelection ? (
        <Panel tight className="hvh-fade-2">
          <Stack gap={10}>
            <div>
              <span className="hvh-micro">OPTIONAL · YOUR REGION</span>
              <p className="hvh-mode-blurb" style={{ marginTop: 4 }}>
                Used only if the host has real participation data for your country. Never detected
                automatically, never sent anywhere.
              </p>
            </div>
            <select
              className="hvh-country"
              value={country}
              onChange={(e) => onCountry(e.currentTarget.value)}
              aria-label="Select your country"
            >
              <option value="">No country selected</option>
              {list.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <Note>
              Comparison wording stays <strong>participating players</strong> — never
              &ldquo;people of your country chose&rdquo;.
            </Note>
          </Stack>
        </Panel>
      ) : null}

      <div className="hvh-footer hvh-fade-3">
        <span className="hvh-best">{best > 0 ? `PERSONAL BEST · ${best}` : "NO SCORE YET"}</span>
        <Row>
          <Button variant="ghost" small onClick={onBack}>
            BACK
          </Button>
        </Row>
      </div>
    </div>
  );
}
