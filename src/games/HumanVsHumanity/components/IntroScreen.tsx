import { TAGLINE } from "../data/copy";
import { Button, Note, Panel, Row, Stack } from "./Primitives";

export function IntroScreen({ onEnter, onHow }: { onEnter: () => void; onHow: () => void }) {
  return (
    <div className="hvh-stack hvh-gap-32" style={{ paddingTop: 18 }}>
      <div className="hvh-center hvh-stack hvh-gap-18 hvh-fade">
        <span className="hvh-eyebrow">A DECISION BATTLE FOR THE CROWD AND YOU</span>
        <h1 className="hvh-display">HUMAN<br />VS HUMANITY</h1>
        <p className="hvh-lede" style={{ maxWidth: 460, margin: "0 auto" }}>
          Millions of people can make a decision.
          <br />
          You only need one.
        </p>
        <p className="hvh-h3 hvh-muted" style={{ maxWidth: 420, margin: "0 auto", fontWeight: 600 }}>
          The question is whether yours is better for the game.
        </p>
        <Row style={{ justifyContent: "center", marginTop: 6 }}>
          <Button onClick={onEnter}>ENTER THE BATTLE</Button>
          <Button onClick={onHow} variant="ghost">
            HOW IT WORKS
          </Button>
        </Row>
        <p className="hvh-micro" style={{ marginTop: 4 }}>
          {TAGLINE}
        </p>
      </div>

      <Panel tight className="hvh-fade-2">
        <Stack gap={10}>
          <Note>
            <strong>You choose first.</strong> The crowd answers after. You are never asked to guess
            what everyone else will pick — only to decide what you actually want.
          </Note>
          <Note>
            <strong>Nothing here has a correct answer.</strong> A minority choice is not smarter. It
            is just yours.
          </Note>
        </Stack>
      </Panel>
    </div>
  );
}
