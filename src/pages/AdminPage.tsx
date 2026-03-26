import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { supabase, isValidConfig } from '@/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUp, ArrowDown, Plus, Trash2, Upload, FileText, Play, Image as ImageIcon } from 'lucide-react';
import type { Topic, Subtopic, LessonBlock, FeaturedTopic, FeatureCard, GalleryImage, VideoItem, PdfItem } from '@/types';

// ─── Image Upload Component ───────────────────────────────────────────────────
interface ImageUploadProps {
  currentImage: string;
  onImageUploaded: (url: string) => void;
  label: string;
}

function ImageUpload({ currentImage, onImageUploaded, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidConfig) {
      alert('Supabase is not configured. Please add your credentials to the .env file.');
      return;
    }

    setUploading(true);
    try {
      const filePath = `images/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('uploads').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(filePath);
      onImageUploaded(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Make sure the "uploads" storage bucket exists in Supabase.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm text-gray-400">{label}</label>}
      <div className="flex items-center gap-4">
        {currentImage && (
          <img src={currentImage} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
        )}
        <div className="flex-1">
          <Input
            value={currentImage}
            onChange={(e) => onImageUploaded(e.target.value)}
            className="bg-slate-700 border-white/20 text-white mb-2"
            placeholder="Or paste image URL here"
          />
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Upload size={16} className="mr-2" />
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Page ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const {
    heroTitle, heroSubtitle, featureCards, featuredTopics, topics,
    missionText, whoWeAreText1, whoWeAreText2, missionImage, whoWeAreImage1, whoWeAreImage2,
    galleryImages, videos, pdfs,
    setHeroTitle, setHeroSubtitle, setFeatureCards, setFeaturedTopics, setTopics,
    getSubtopics, setSubtopics, getLesson, setLesson,
    setMissionText, setWhoWeAreText1, setWhoWeAreText2,
    setMissionImage, setWhoWeAreImage1, setWhoWeAreImage2,
    setGalleryImages, setVideos, setPdfs,
  } = useData();

  const [activeTab, setActiveTab] = useState('homepage');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate('/login');
    else if (!isAdmin) navigate('/');
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  // ── Homepage ────────────────────────────────────────────────────────────────
  const updateFeatureCard = (i: number, field: keyof FeatureCard, value: string) => {
    const c = [...featureCards]; c[i] = { ...c[i], [field]: value }; setFeatureCards(c);
  };
  const updateFeaturedTopic = (i: number, field: keyof FeaturedTopic, value: string) => {
    const t = [...featuredTopics]; t[i] = { ...t[i], [field]: value }; setFeaturedTopics(t);
  };
  const addFeaturedTopic = () => setFeaturedTopics([...featuredTopics, { id: `ft-${Date.now()}`, title: 'New Topic', description: 'Description', image: '/images/topic-fundamentals.jpg' }]);
  const deleteFeaturedTopic = (i: number) => setFeaturedTopics(featuredTopics.filter((_, idx) => idx !== i));

  // ── Topics ──────────────────────────────────────────────────────────────────
  const updateTopic = (i: number, field: keyof Topic, value: string | number) => {
    const t = [...topics]; t[i] = { ...t[i], [field]: value }; setTopics(t);
  };
  const addTopic = () => setTopics([...topics, { id: `topic-${Date.now()}`, emoji: '🚀', title: 'New Topic', description: 'Description', lessonCount: 0, image: '/images/topic-fundamentals.jpg' }]);
  const deleteTopic = (i: number) => setTopics(topics.filter((_, idx) => idx !== i));
  const moveTopic = (i: number, dir: 'up' | 'down') => {
    if (dir === 'up' && i === 0) return;
    if (dir === 'down' && i === topics.length - 1) return;
    const t = [...topics]; const swap = dir === 'up' ? i - 1 : i + 1;
    [t[i], t[swap]] = [t[swap], t[i]]; setTopics(t);
  };

  // ── Subtopics ───────────────────────────────────────────────────────────────
  const currentSubtopics = selectedTopic ? getSubtopics(selectedTopic) : [];
  const updateSubtopic = (i: number, field: keyof Subtopic, value: string) => {
    if (!selectedTopic) return;
    const s = [...currentSubtopics]; s[i] = { ...s[i], [field]: value }; setSubtopics(selectedTopic, s);
  };
  const addSubtopic = () => {
    if (!selectedTopic) return;
    setSubtopics(selectedTopic, [...currentSubtopics, { id: `sub-${Date.now()}`, emoji: '📚', title: 'New Lesson', description: 'Lesson description' }]);
  };
  const deleteSubtopic = (i: number) => {
    if (!selectedTopic) return;
    setSubtopics(selectedTopic, currentSubtopics.filter((_, idx) => idx !== i));
  };
  const moveSubtopic = (i: number, dir: 'up' | 'down') => {
    if (!selectedTopic) return;
    if (dir === 'up' && i === 0) return;
    if (dir === 'down' && i === currentSubtopics.length - 1) return;
    const s = [...currentSubtopics]; const swap = dir === 'up' ? i - 1 : i + 1;
    [s[i], s[swap]] = [s[swap], s[i]]; setSubtopics(selectedTopic, s);
  };

  // ── Lessons ─────────────────────────────────────────────────────────────────
  const currentLesson = selectedTopic && selectedSubtopic ? getLesson(selectedTopic, selectedSubtopic) : undefined;
  const currentBlocks = currentLesson?.blocks || [];
  const saveBlocks = (blocks: LessonBlock[]) => {
    if (!selectedTopic || !selectedSubtopic) return;
    const title = currentSubtopics.find(s => s.id === selectedSubtopic)?.title || '';
    setLesson(selectedTopic, selectedSubtopic, { id: selectedSubtopic, title, blocks });
  };
  const updateLessonBlock = (i: number, content: string) => {
    const b = [...currentBlocks]; b[i] = { ...b[i], content }; saveBlocks(b);
  };
  const addLessonBlock = (type: 'text' | 'image') => saveBlocks([...currentBlocks, { type, content: type === 'text' ? '' : '' }]);
  const removeLessonBlock = (i: number) => saveBlocks(currentBlocks.filter((_, idx) => idx !== i));
  const moveLessonBlock = (i: number, dir: 'up' | 'down') => {
    if (dir === 'up' && i === 0) return;
    if (dir === 'down' && i === currentBlocks.length - 1) return;
    const b = [...currentBlocks]; const swap = dir === 'up' ? i - 1 : i + 1;
    [b[i], b[swap]] = [b[swap], b[i]]; saveBlocks(b);
  };

  // ── Materials ───────────────────────────────────────────────────────────────
  const addGalleryImage = () => setGalleryImages([...galleryImages, { id: `gallery-${Date.now()}`, url: '', title: 'New Image' }]);
  const updateGalleryImage = (i: number, field: keyof GalleryImage, value: string) => {
    const imgs = [...galleryImages]; imgs[i] = { ...imgs[i], [field]: value }; setGalleryImages(imgs);
  };
  const deleteGalleryImage = (i: number) => setGalleryImages(galleryImages.filter((_, idx) => idx !== i));

  const addVideo = () => setVideos([...videos, { id: `video-${Date.now()}`, url: '', thumbnail: '', title: 'New Video' }]);
  const updateVideo = (i: number, field: keyof VideoItem, value: string) => {
    const v = [...videos]; v[i] = { ...v[i], [field]: value }; setVideos(v);
  };
  const deleteVideo = (i: number) => setVideos(videos.filter((_, idx) => idx !== i));

  const addPdf = () => setPdfs([...pdfs, { id: `pdf-${Date.now()}`, url: '', title: 'New PDF', label: 'New PDF' }]);
  const updatePdf = (i: number, field: keyof PdfItem, value: string) => {
    const p = [...pdfs]; p[i] = { ...p[i], [field]: value }; setPdfs(p);
  };
  const deletePdf = (i: number) => setPdfs(pdfs.filter((_, idx) => idx !== i));

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0a0e1a]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">Signed in as {user.email}</p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-900 border border-white/10 mb-8 flex flex-wrap gap-1 h-auto p-1">
            {['homepage','topics','subtopics','lessons','about','materials'].map(tab => (
              <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-orange-500 data-[state=active]:text-white capitalize">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── HOMEPAGE TAB ────────────────────────────────────────────── */}
          <TabsContent value="homepage" className="space-y-8">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Hero Section</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="bg-slate-800 border-white/20 text-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Subtitle</label>
                  <Input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="bg-slate-800 border-white/20 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Feature Cards</h2>
              <div className="space-y-4">
                {featureCards.map((card, i) => (
                  <div key={i} className="p-4 bg-slate-800 rounded-lg space-y-3">
                    <Input value={card.icon} onChange={(e) => updateFeatureCard(i, 'icon', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Icon emoji" />
                    <Input value={card.title} onChange={(e) => updateFeatureCard(i, 'title', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Title" />
                    <Input value={card.description} onChange={(e) => updateFeatureCard(i, 'description', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Description" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Featured Topics</h2>
                <Button onClick={addFeaturedTopic} className="bg-orange-500 hover:bg-orange-600"><Plus size={16} className="mr-2" />Add</Button>
              </div>
              <div className="space-y-4">
                {featuredTopics.map((topic, i) => (
                  <div key={topic.id} className="p-4 bg-slate-800 rounded-lg space-y-3">
                    <Input value={topic.title} onChange={(e) => updateFeaturedTopic(i, 'title', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Title" />
                    <Input value={topic.description} onChange={(e) => updateFeaturedTopic(i, 'description', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Description" />
                    <ImageUpload currentImage={topic.image} onImageUploaded={(url) => updateFeaturedTopic(i, 'image', url)} label="Topic Image" />
                    <Button variant="destructive" size="sm" onClick={() => deleteFeaturedTopic(i)}><Trash2 size={14} className="mr-1" />Delete</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── TOPICS TAB ──────────────────────────────────────────────── */}
          <TabsContent value="topics" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Learning Topics</h2>
              <Button onClick={addTopic} className="bg-orange-500 hover:bg-orange-600"><Plus size={18} className="mr-2" />Add Topic</Button>
            </div>
            {topics.map((topic, i) => (
              <div key={topic.id} className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input value={topic.emoji} onChange={(e) => updateTopic(i, 'emoji', e.target.value)} className="bg-slate-800 border-white/20 text-white" placeholder="Emoji" />
                  <Input value={topic.title} onChange={(e) => updateTopic(i, 'title', e.target.value)} className="bg-slate-800 border-white/20 text-white" placeholder="Title" />
                  <Input value={topic.description} onChange={(e) => updateTopic(i, 'description', e.target.value)} className="bg-slate-800 border-white/20 text-white md:col-span-2" placeholder="Description" />
                  <Input type="number" value={topic.lessonCount} onChange={(e) => updateTopic(i, 'lessonCount', parseInt(e.target.value) || 0)} className="bg-slate-800 border-white/20 text-white" placeholder="Lesson Count" />
                  <div className="md:col-span-2">
                    <ImageUpload currentImage={topic.image} onImageUploaded={(url) => updateTopic(i, 'image', url)} label="Topic Image" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => moveTopic(i, 'up')} disabled={i === 0}><ArrowUp size={16} /></Button>
                  <Button variant="outline" size="sm" onClick={() => moveTopic(i, 'down')} disabled={i === topics.length - 1}><ArrowDown size={16} /></Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteTopic(i)}><Trash2 size={16} /></Button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ── SUBTOPICS TAB ────────────────────────────────────────────── */}
          <TabsContent value="subtopics" className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Topic</label>
              <select value={selectedTopic || ''} onChange={(e) => setSelectedTopic(e.target.value || null)} className="w-full bg-slate-800 border border-white/20 text-white rounded-md p-2">
                <option value="">Select a topic...</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.title}</option>)}
              </select>
            </div>
            {selectedTopic && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Subtopics / Lessons</h2>
                  <Button onClick={addSubtopic} className="bg-orange-500 hover:bg-orange-600"><Plus size={18} className="mr-2" />Add Subtopic</Button>
                </div>
                {currentSubtopics.map((sub, i) => (
                  <div key={sub.id} className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input value={sub.emoji} onChange={(e) => updateSubtopic(i, 'emoji', e.target.value)} className="bg-slate-800 border-white/20 text-white" placeholder="Emoji" />
                      <Input value={sub.title} onChange={(e) => updateSubtopic(i, 'title', e.target.value)} className="bg-slate-800 border-white/20 text-white md:col-span-2" placeholder="Title" />
                      <Input value={sub.description} onChange={(e) => updateSubtopic(i, 'description', e.target.value)} className="bg-slate-800 border-white/20 text-white md:col-span-3" placeholder="Description" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => moveSubtopic(i, 'up')} disabled={i === 0}><ArrowUp size={16} /></Button>
                      <Button variant="outline" size="sm" onClick={() => moveSubtopic(i, 'down')} disabled={i === currentSubtopics.length - 1}><ArrowDown size={16} /></Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteSubtopic(i)}><Trash2 size={16} /></Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </TabsContent>

          {/* ── LESSONS TAB ─────────────────────────────────────────────── */}
          <TabsContent value="lessons" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Select Topic</label>
                <select value={selectedTopic || ''} onChange={(e) => { setSelectedTopic(e.target.value || null); setSelectedSubtopic(null); }} className="w-full bg-slate-800 border border-white/20 text-white rounded-md p-2">
                  <option value="">Select a topic...</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Select Lesson</label>
                <select value={selectedSubtopic || ''} onChange={(e) => setSelectedSubtopic(e.target.value || null)} className="w-full bg-slate-800 border border-white/20 text-white rounded-md p-2" disabled={!selectedTopic}>
                  <option value="">Select a lesson...</option>
                  {currentSubtopics.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.title}</option>)}
                </select>
              </div>
            </div>

            {selectedTopic && selectedSubtopic && (
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Lesson Content</h2>
                <p className="text-sm text-gray-400 mb-6">Add text blocks and image blocks in any order. Images can appear anywhere between paragraphs.</p>
                <div className="space-y-4">
                  {currentBlocks.map((block, i) => (
                    <div key={i} className="bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase font-medium">{block.type === 'text' ? '📝 Text Block' : '🖼 Image Block'}</span>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => moveLessonBlock(i, 'up')} disabled={i === 0}><ArrowUp size={14} /></Button>
                          <Button variant="outline" size="sm" onClick={() => moveLessonBlock(i, 'down')} disabled={i === currentBlocks.length - 1}><ArrowDown size={14} /></Button>
                          <Button variant="destructive" size="sm" onClick={() => removeLessonBlock(i)}><Trash2 size={14} /></Button>
                        </div>
                      </div>
                      {block.type === 'text' ? (
                        <Textarea value={block.content} onChange={(e) => updateLessonBlock(i, e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Enter lesson text..." rows={5} />
                      ) : (
                        <ImageUpload currentImage={block.content} onImageUploaded={(url) => updateLessonBlock(i, url)} label="" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => addLessonBlock('text')} variant="outline" className="border-white/20 text-white hover:bg-white/10"><Plus size={16} className="mr-2" />Add Text</Button>
                  <Button onClick={() => addLessonBlock('image')} variant="outline" className="border-white/20 text-white hover:bg-white/10"><Plus size={16} className="mr-2" />Add Image</Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── ABOUT TAB ───────────────────────────────────────────────── */}
          <TabsContent value="about" className="space-y-8">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Our Mission</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mission Text</label>
                  <Textarea value={missionText} onChange={(e) => setMissionText(e.target.value)} className="bg-slate-800 border-white/20 text-white" rows={4} />
                </div>
                <ImageUpload currentImage={missionImage} onImageUploaded={setMissionImage} label="Mission Image" />
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Who We Are</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Paragraph 1</label>
                  <Textarea value={whoWeAreText1} onChange={(e) => setWhoWeAreText1(e.target.value)} className="bg-slate-800 border-white/20 text-white" rows={3} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Paragraph 2</label>
                  <Textarea value={whoWeAreText2} onChange={(e) => setWhoWeAreText2(e.target.value)} className="bg-slate-800 border-white/20 text-white" rows={3} />
                </div>
                <ImageUpload currentImage={whoWeAreImage1} onImageUploaded={setWhoWeAreImage1} label="Who We Are — Image 1" />
                <ImageUpload currentImage={whoWeAreImage2} onImageUploaded={setWhoWeAreImage2} label="Who We Are — Image 2" />
              </div>
            </div>
          </TabsContent>

          {/* ── MATERIALS TAB ───────────────────────────────────────────── */}
          <TabsContent value="materials" className="space-y-8">
            {/* Gallery */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><ImageIcon size={20} />Image Gallery</h2>
                <Button onClick={addGalleryImage} className="bg-orange-500 hover:bg-orange-600"><Plus size={18} className="mr-2" />Add Image</Button>
              </div>
              <div className="space-y-4">
                {galleryImages.map((img, i) => (
                  <div key={img.id} className="p-4 bg-slate-800 rounded-lg flex items-start gap-4">
                    {img.url && <img src={img.url} alt={img.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />}
                    <div className="flex-1 space-y-2">
                      <Input value={img.title} onChange={(e) => updateGalleryImage(i, 'title', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Image Title" />
                      <ImageUpload currentImage={img.url} onImageUploaded={(url) => updateGalleryImage(i, 'url', url)} label="" />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteGalleryImage(i)}><Trash2 size={16} /></Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Play size={20} />Video Collection</h2>
                <Button onClick={addVideo} className="bg-orange-500 hover:bg-orange-600"><Plus size={18} className="mr-2" />Add Video</Button>
              </div>
              <div className="space-y-4">
                {videos.map((video, i) => (
                  <div key={video.id} className="p-4 bg-slate-800 rounded-lg flex items-start gap-4">
                    {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="w-24 h-16 object-cover rounded-lg flex-shrink-0" />}
                    <div className="flex-1 space-y-2">
                      <Input value={video.title} onChange={(e) => updateVideo(i, 'title', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Video Title" />
                      <Input value={video.url} onChange={(e) => updateVideo(i, 'url', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Video URL (paste link)" />
                      <ImageUpload currentImage={video.thumbnail} onImageUploaded={(url) => updateVideo(i, 'thumbnail', url)} label="Thumbnail Image" />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteVideo(i)}><Trash2 size={16} /></Button>
                  </div>
                ))}
              </div>
            </div>

            {/* PDFs */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText size={20} />PDF Documents</h2>
                <Button onClick={addPdf} className="bg-orange-500 hover:bg-orange-600"><Plus size={18} className="mr-2" />Add PDF</Button>
              </div>
              <div className="space-y-4">
                {pdfs.map((pdf, i) => (
                  <div key={pdf.id} className="p-4 bg-slate-800 rounded-lg flex items-start gap-4">
                    <FileText size={40} className="text-orange-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 space-y-2">
                      <Input value={pdf.title} onChange={(e) => updatePdf(i, 'title', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="PDF Title" />
                      <Input value={pdf.label} onChange={(e) => updatePdf(i, 'label', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Display Label (short name)" />
                      <Input value={pdf.url} onChange={(e) => updatePdf(i, 'url', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="PDF URL (paste link)" />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deletePdf(i)}><Trash2 size={16} /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
