import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { fetchBookmarks, removeBookmark } from '@/services/bookmarks';
import type { Bookmark } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark as BookmarkIcon, Trash2, ExternalLink, Loader2 } from 'lucide-react';

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchBookmarks(user.id);
        setBookmarks(data);
      } catch (err) {
        console.error('Bookmarks load error:', err);
        setError('Failed to load bookmarks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user]);

  const handleRemove = async (id: string) => {
    if (!user) return;
    setRemoving(id);
    try {
      await removeBookmark(user.id, id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Remove bookmark error:', err);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0a0e1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Your Bookmarks</h1>
          <p className="text-gray-400">Save and access your favorite learning materials</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="text-orange-500 animate-spin" size={36} />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkIcon size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">No bookmarks yet</h3>
            <p className="text-gray-400 mb-6">
              Open any lesson and click the bookmark icon to save it here.
            </p>
            <Link to="/learning">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Explore Learning
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="bg-slate-900/50 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            bookmark.itemType === 'topic'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {bookmark.itemType === 'topic' ? 'Topic' : 'Lesson'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{bookmark.title}</h3>
                      <p className="text-gray-400">{bookmark.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link to={bookmark.url}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <ExternalLink size={18} />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemove(bookmark.id)}
                        disabled={removing === bookmark.id}
                      >
                        {removing === bookmark.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
