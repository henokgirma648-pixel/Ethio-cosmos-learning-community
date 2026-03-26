import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';

interface BookmarkItem {
  id: string;
  title: string;
  type: 'topic' | 'lesson';
  url: string;
  description: string;
}

const defaultBookmarks: BookmarkItem[] = [
  {
    id: '1',
    title: 'Fundamentals of Astronomy',
    type: 'topic',
    url: '/learning/fundamentals',
    description: 'Start your journey with the basics of astronomy and space observation'
  },
  {
    id: '2',
    title: 'Solar System',
    type: 'topic',
    url: '/learning/solar-system',
    description: 'Our cosmic neighborhood and the Sun\'s family of planets'
  },
  {
    id: '3',
    title: 'Black Hole - Introduction',
    type: 'lesson',
    url: '/learning/black-hole/b1',
    description: 'Understanding these mysterious objects'
  }
];

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const saved = localStorage.getItem('ethioCosmosBookmarks');
    return saved ? JSON.parse(saved) : defaultBookmarks;
  });

  const removeBookmark = (id: string) => {
    const newBookmarks = bookmarks.filter(b => b.id !== id);
    setBookmarks(newBookmarks);
    localStorage.setItem('ethioCosmosBookmarks', JSON.stringify(newBookmarks));
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0a0e1a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Your Bookmarks</h1>
          <p className="text-gray-400">Save and access your favorite learning materials</p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-white mb-2">No bookmarks yet</h3>
            <p className="text-gray-400 mb-6">Start exploring and bookmark topics or lessons you want to revisit</p>
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
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          bookmark.type === 'topic' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {bookmark.type === 'topic' ? 'Topic' : 'Lesson'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{bookmark.title}</h3>
                      <p className="text-gray-400">{bookmark.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link to={bookmark.url}>
                        <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white/10">
                          <ExternalLink size={18} />
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => removeBookmark(bookmark.id)}
                      >
                        <Trash2 size={18} />
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
