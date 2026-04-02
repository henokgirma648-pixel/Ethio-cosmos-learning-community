import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchAllQuizzes, saveQuizAttempt } from '@/services/quizzes';
import type { Quiz } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, RefreshCw, Trophy } from 'lucide-react';

type QuizState = 'selecting' | 'running' | 'result';

export default function TestsPage() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected quiz state
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>('selecting');

  // Running quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error('TestsPage load error:', err);
        setError('Failed to load quizzes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setQuizState('running');
  };

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
  };

  const handleNext = async () => {
    if (selectedAnswer === null || !selectedQuiz) return;

    const newAnswers = [...answers, selectedAnswer];
    const isCorrect = selectedAnswer === selectedQuiz.questions[currentQuestion].correctIndex;
    const newScore = isCorrect ? score + 1 : score;

    setAnswers(newAnswers);
    if (isCorrect) setScore(newScore);

    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz finished
      setScore(newScore);
      setQuizState('result');

      // Save attempt if logged in
      if (user) {
        setSaving(true);
        try {
          await saveQuizAttempt(
            user.id,
            selectedQuiz.id,
            newScore,
            selectedQuiz.questions.length,
            newAnswers
          );
        } catch (err) {
          console.error('Save quiz attempt error:', err);
        } finally {
          setSaving(false);
        }
      }
    }
  };

  const resetToSelector = () => {
    setSelectedQuiz(null);
    setQuizState('selecting');
  };

  // ─── Loading / Error states ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-[#0a0e1a] flex items-center justify-center">
        <Loader2 className="text-orange-500 animate-spin" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600 text-white">
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // ─── Quiz Selector ────────────────────────────────────────────────────────

  if (quizState === 'selecting') {
    return (
      <div className="min-h-screen pt-24 pb-12 bg-[#0a0e1a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Astronomy Tests</h1>
            <p className="text-gray-400">Test your knowledge of the cosmos</p>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No quizzes available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <Card
                  key={quiz.id}
                  className="bg-slate-900/50 border-white/10 cursor-pointer hover:border-orange-500/50 transition-all"
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{quiz.title}</h3>
                      <p className="text-gray-400 text-sm">{quiz.description}</p>
                      <p className="text-orange-500 text-sm mt-2">
                        {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      onClick={() => startQuiz(quiz)}
                      disabled={quiz.questions.length === 0}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Running Quiz ─────────────────────────────────────────────────────────

  if (quizState === 'running' && selectedQuiz) {
    const question = selectedQuiz.questions[currentQuestion];
    const total = selectedQuiz.questions.length;

    return (
      <div className="min-h-screen pt-24 pb-12 bg-[#0a0e1a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{selectedQuiz.title}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToSelector}
              className="text-gray-400 hover:text-white"
            >
              ← Back to quizzes
            </Button>
          </div>

          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">
                  Question {currentQuestion + 1} of {total}
                </CardTitle>
                <span className="text-orange-500 font-medium">Score: {score}</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full mt-4">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / total) * 100}%` }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl text-white mb-6">{question.questionText}</h3>
              <div className="space-y-3">
                {question.options.map((option, index) => (
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
                {currentQuestion === total - 1 ? 'Finish' : 'Next Question'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Results ──────────────────────────────────────────────────────────────

  if (quizState === 'result' && selectedQuiz) {
    const total = selectedQuiz.questions.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <div className="min-h-screen pt-24 pb-12 bg-[#0a0e1a]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-center flex items-center justify-center gap-2">
                <Trophy className="text-yellow-500" size={28} />
                Test Complete!
                {saving && <Loader2 size={18} className="animate-spin text-gray-400" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-orange-500 mb-2">
                  {score} / {total}
                </div>
                <div className="text-2xl text-gray-300 mb-1">{pct}%</div>
                <p className="text-gray-400">
                  {pct === 100
                    ? 'Perfect score! You are a true astronomer! 🌟'
                    : pct >= 70
                    ? 'Great job! Keep exploring the cosmos!'
                    : pct >= 50
                    ? 'Good effort! Keep studying the stars!'
                    : 'Keep learning — the cosmos awaits you!'}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {selectedQuiz.questions.map((q, index) => (
                  <div key={q.id} className="p-4 bg-slate-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      {answers[index] === q.correctIndex ? (
                        <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                      ) : (
                        <XCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                      )}
                      <div>
                        <p className="text-white font-medium">{q.questionText}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Your answer:{' '}
                          <span className={answers[index] === q.correctIndex ? 'text-green-400' : 'text-red-400'}>
                            {q.options[answers[index]] ?? 'No answer'}
                          </span>
                        </p>
                        {answers[index] !== q.correctIndex && (
                          <p className="text-green-400 text-sm">
                            Correct: {q.options[q.correctIndex]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => startQuiz(selectedQuiz)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Retake Quiz
                </Button>
                <Button
                  onClick={resetToSelector}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  All Quizzes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
