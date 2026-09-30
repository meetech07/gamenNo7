import { Button, Note, Panel, Row, Stack } from "./Primitives";

const STEPS = [
  {
    n: 1,
    title: "YOU CHOOSE",
    body: "Every round is a difficult, funny or genuinely uncomfortable situation. You make the call for yourself. There is no right answer and nobody is marking it yet.",
  },
  {
    n: 2,
    title: "HUMANITY RESPONDS",
    body: "Your decision locks, then the crowd is revealed. You see exactly how the participating players split across every option — real bars, real percentages, no mystery.",
  },
  {
    n: 3,
    title: "THE BATTLE",
    body: "Your choice is measured against the crowd on two axes at once: how aligned you were, and how individual your pick was. Both count. Neither is the correct one.",
  },
];

export function HowItWorksScreen({ onBack, onEnter }: { onBack: () => void; onEnter: () => void }) {
  return (
    <div className="hvh-stack hvh-gap-24">
      <div className="hvh-stack hvh-gap-8 hvh-fade">
        <span className="hvh-eyebrow">HOW IT WORKS</span>
        <h2 className="hvh-h2">Three steps. Then the truth.</h2>
      </div>

      <Stack gap={12} className="hvh-fade-1">
        {STEPS.map((s) => (
          <div className="hvh-step" key={s.n}>
            <span className="hvh-step-num">{s.n}</span>
            <div className="hvh-stack hvh-gap-6">
              <span className="hvh-step-title">{s.title}</span>
              <span className="hvh-step-body">{s.body}</span>
            </div>
          </div>
        ))}
      </Stack>

      <Panel tight className="hvh-fade-2">
        <div className="hvh-stack hvh-gap-12">
          <span className="hvh-micro">EXAMPLE ROUND</span>
          <div className="hvh-demo">
            <span className="hvh-micro" style={{ color: "#fde68a" }}>YOU</span>
            <span className="hvh-step-title">Teleport anywhere</span>
          </div>
          <div className="hvh-demo">
            <span className="hvh-micro" style={{ color: "#a5b4fc" }}>GAME HUMANITY</span>
            <span className="hvh-step-title">Learn anything instantly</span>
          </div>
          <div className="hvh-demo" style={{ borderColor: "rgba(103,232,249,0.4)" }}>
            <span className="hvh-micro">RESULT</span>
            <span className="hvh-headline" style={{ fontSize: 18, textAlign: "left" }}>
              YOU WENT AGAINST THE CROWD
            </span>
          </div>
          <Note>
            Labels are never fake. Built-in sample crowds are always marked <strong>GAME HUMANITY</strong>.
            Real host data is always marked <strong>PARTICIPATING PLAYERS</strong>.
          </Note>
        </div>
      </Panel>

      <Row className="hvh-fade-3">
        <Button onClick={onEnter}>ENTER THE BATTLE</Button>
        <Button onClick={onBack} variant="ghost">
          BACK
        </Button>
      </Row>
    </div>
  );
}
