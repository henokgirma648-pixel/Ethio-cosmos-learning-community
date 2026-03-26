import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "What is the closest star to Earth?",
    options: ["Proxima Centauri", "The Sun", "Sirius", "Alpha Centauri"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Mars", "Saturn"],
    correctAnswer: 2
  },
  {
    id: 3,
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Saturn", "Jupiter", "Neptune"],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "How many moons does Earth have?",
    options: ["None", "One", "Two", "Seventy-nine"],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "What causes the Earth's seasons?",
    options: ["Distance from the Sun", "The Earth's tilt", "Solar flares", "The Moon's gravity"],
    correctAnswer: 1
  }
];

export default function TestsPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);
      
      if (selectedAnswer === sampleQuestions[currentQuestion].correctAnswer) {
        setScore(score + 1);
      }

      if (currentQuestion < sampleQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswers([]);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0a0e1a]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Astronomy Tests</h1>
          <p className="text-gray-400">Test your knowledge of the cosmos</p>
        </div>

        {!showResult ? (
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">
                  Question {currentQuestion + 1} of {sampleQuestions.length}
                </CardTitle>
                <span className="text-orange-500 font-medium">
                  Score: {score}
                </span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full mt-4">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / sampleQuestions.length) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl text-white mb-6">
                {sampleQuestions[currentQuestion].question}
              </h3>
              <div className="space-y-3">
                {sampleQuestions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      selectedAnswer === index
                        ? 'border-orange-500 bg-orange-500/20 text-white'
                        : 'border-white/10 text-gray-300 hover:border-white/30 hover:bg-white/5'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {currentQuestion === sampleQuestions.length - 1 ? 'Finish' : 'Next Question'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-center">Test Complete!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-orange-500 mb-2">
                  {score} / {sampleQuestions.length}
                </div>
                <p className="text-gray-400">
                  {score === sampleQuestions.length 
                    ? 'Perfect score! You are a true astronomer!' 
                    : score >= sampleQuestions.length / 2 
                      ? 'Good job! Keep learning!' 
                      : 'Keep studying the cosmos!'}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {sampleQuestions.map((q, index) => (
                  <div key={q.id} className="p-4 bg-slate-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      {answers[index] === q.correctAnswer ? (
                        <CheckCircle className="text-green-500 mt-1" size={20} />
                      ) : (
                        <XCircle className="text-red-500 mt-1" size={20} />
                      )}
                      <div>
                        <p className="text-white font-medium">{q.question}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Your answer: {q.options[answers[index]]}
                        </p>
                        {answers[index] !== q.correctAnswer && (
                          <p className="text-green-400 text-sm">
                            Correct answer: {q.options[q.correctAnswer]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={resetQuiz}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Take Test Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
