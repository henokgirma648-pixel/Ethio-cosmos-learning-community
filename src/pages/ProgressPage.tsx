import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { fetchCompletedSubtopicIds, buildTopicProgress } from '@/services/progress';
import type { TopicProgress } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, BookOpen, Target, Star, Loader2 } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export default function ProgressPage() {
  const { user } = useAuth();
  const { topics, getSubtopics, loadSubtopics } = useData();

  const [topicProgress, setTopicProgress] = useState<TopicProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || topics.length === 0) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load subtopics for every topic so we can count them
        await Promise.all(topics.map((t) => loadSubtopics(t.id)));

        const completedIds = await fetchCompletedSubtopicIds(user.id);
        const completedSet = new Set(completedIds);

        // Build subtopics map (what we have loaded so far)
        const subtopicsMap: Record<string, Array<{ id: string }>> = {};
        for (const topic of topics) {
          subtopicsMap[topic.id] = getSubtopics(topic.id);
        }

        const progress = buildTopicProgress(
          topics.map((t) => ({
            id: t.id,
            slug: t.slug,
            title: t.title,
            lessonCount: t.lessonCount,
          })),
          subtopicsMap,
          completedSet
        );

        setTopicProgress(progress);
      } catch (err) {
        console.error('ProgressPage load error:', err);
        setError('Failed to load progress data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, topics]);

  const totalCompleted = topicProgress.reduce((sum, t) => sum + t.completedLessons, 0);
  const totalLessons = topicProgress.reduce((sum, t) => sum + t.totalLessons, 0);
  const overallProgress = totalLessons > 0 ? (totalCompleted / totalLessons) * 100 : 0;

  const achievements: Achievement[] = [
    { id: '1', title: 'First Steps', description: 'Complete your first lesson', icon: '🌟', unlocked: totalCompleted >= 1 },
    { id: '2', title: 'Rising Star', description: 'Complete 5 lessons', icon: '⭐', unlocked: totalCompleted >= 5 },
    { id: '3', title: 'Space Explorer', description: 'Complete 10 lessons', icon: '🚀', unlocked: totalCompleted >= 10 },
    { id: '4', title: 'Cosmic Scholar', description: 'Complete 25 lessons', icon: '🎓', unlocked: totalCompleted >= 25 },
    { id: '5', title: 'Astronomy Master', description: 'Complete 50 lessons', icon: '🏆', unlocked: totalCompleted >= 50 },
    { id: '6', title: 'Universal Expert', description: 'Complete all lessons', icon: '🌌', unlocked: totalLessons > 0 && totalCompleted >= totalLessons },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0a0e1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Your Progress</h1>
          <p className="text-gray-400">Track your journey through the cosmos</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="text-orange-500 animate-spin" size={36} />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-slate-900/50 border-white/10">
                <CardContent className="p-6 text-center">
                  <BookOpen className="text-orange-500 mx-auto mb-2" size={32} />
                  <div className="text-3xl font-bold text-white">{totalCompleted}</div>
                  <div className="text-gray-400">Lessons Completed</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-white/10">
                <CardContent className="p-6 text-center">
                  <Target className="text-blue-500 mx-auto mb-2" size={32} />
                  <div className="text-3xl font-bold text-white">{Math.round(overallProgress)}%</div>
                  <div className="text-gray-400">Overall Progress</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-900/50 border-white/10">
                <CardContent className="p-6 text-center">
                  <Trophy className="text-yellow-500 mx-auto mb-2" size={32} />
                  <div className="text-3xl font-bold text-white">
                    {unlockedCount}/{achievements.length}
                  </div>
                  <div className="text-gray-400">Achievements</div>
                </CardContent>
              </Card>
            </div>

            {/* Overall Progress Bar */}
            <Card className="bg-slate-900/50 border-white/10 mb-8">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">Overall Progress</span>
                  <span className="text-orange-500 font-medium">
                    {totalCompleted} / {totalLessons} lessons
                  </span>
                </div>
                <Progress value={overallProgress} className="h-3 bg-slate-700" />
              </CardContent>
            </Card>

            {/* Topic Progress */}
            <Card className="bg-slate-900/50 border-white/10 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Progress by Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topicProgress.map((tp) => (
                    <div key={tp.topicId}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-300">{tp.topicName}</span>
                        <span className="text-gray-400 text-sm">
                          {tp.completedLessons} / {tp.totalLessons}
                        </span>
                      </div>
                      <Progress
                        value={tp.totalLessons > 0 ? (tp.completedLessons / tp.totalLessons) * 100 : 0}
                        className="h-2 bg-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="text-yellow-500" size={24} />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border text-center ${
                        achievement.unlocked
                          ? 'bg-orange-500/10 border-orange-500/50'
                          : 'bg-slate-800/50 border-white/10 opacity-50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <div className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                        {achievement.title}
                      </div>
                      <div className="text-xs text-gray-400">{achievement.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
