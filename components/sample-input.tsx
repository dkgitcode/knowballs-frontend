import { Button } from "@/components/ui/button"

const sampleQuestions = [
  "Who led the league in scoring last season?",
  "Have there ever been a 30/20/20 triple-double in NBA history?",
  "What is the most points scored in a game this season?",
  "Who is the franchise leader of the Lakers in points?",
  "When did the Bucks last win a championship?",
  "Who is a better 3 point shooter, Curry or Thompson?",
  "Who led the league in blocks last season?",
  "Who is the general manager of the Mavericks?",
]

export default function SampleInput({ onSelect }: { onSelect: (question: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {sampleQuestions.map((question, index) => (
        <Button
          key={index}
          variant="outline"
          onClick={() => onSelect(question)}
          className="bg-accent/30 border border-white/10 rounded-sm hover:bg-accent/50 transition-colors"
        >
          {question}
        </Button>
      ))}
    </div>
  )
}