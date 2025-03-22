import { Button } from "@/components/ui/button"

// ✨ MODE-SPECIFIC SAMPLE QUESTIONS ✨
const answerQuestions = [
  "Who led the league in scoring last season?",
  "Have there ever been a 30/20/20 triple-double in NBA history?",
  "What is the most points scored in a game this season?",
  "Who is the franchise leader of the Lakers in points?",
  "When did the Bucks last win a championship?",
  "Who is a better 3 point shooter, Curry or Thompson?",
  "Who led the league in blocks last season?",
  "Who is the general manager of the Mavericks?",
]

// 📊 VISUALIZER SAMPLE QUESTIONS 📊
const visualizerQuestions = [
  "Show me LeBron James shot chart when playing against the Suns",
  "Visualize Steph Curry's 3-point percentage by season",
  "Create a shot chart for Giannis in the 2021 Finals",
  "Show me the Celtics team shooting percentages by zone",
  "Compare Jokic and Embiid's scoring efficiency this season",
  "Visualize Lakers vs Warriors scoring trends by quarter",
]

// 🎬 CLIPPER SAMPLE QUESTIONS 🎬
const filmQuestions = [
  "2016 Steph Curry threes",
  "LeBron clutch blocks in the 2016 playoffs",
  "Wembanyama floating threes",
  "Harden stepback threes in 2019",
  "Trae Young threes from downtown",
  "Jaylen Brown clutch buckets in 2024 playoffs",
  "2017 Kevin Durant mid range shots",
  "Nikola Jokic assists in the 2023 playoffs",
]

export default function SampleInput({ 
  onSelect, 
  mode = 'film'
}: { 
  onSelect: (question: string) => void,
  mode?: 'answer' | 'visualizer' | 'film'
}) {
  // GET THE APPROPRIATE QUESTIONS BASED ON THE CURRENT MODE
  const getQuestions = () => {
    switch(mode) {
      case 'visualizer': return visualizerQuestions;
      case 'film': return filmQuestions;
      default: return answerQuestions;
    }
  }

  const questions = getQuestions();

  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((question, index) => (
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