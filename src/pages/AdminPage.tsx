import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { supabase } from '@/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowUp, ArrowDown, Plus, Trash2, Upload, FileText, Play,
  Image as ImageIcon, Save, Loader2, AlertCircle,
} from 'lucide-react';
import type {
  Topic, Subtopic, LessonBlock, FeaturedTopic, FeatureCard,
  GalleryImage, VideoItem, PdfItem, HomepageContent, AboutContent, MaterialsContent,
} from '@/types';

// ─── Image Upload ─────────────────────────────────────────────────────────────

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

    setUploading(true);
    try {
      const filePath = `images/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from('uploads').getPublicUrl(filePath);
      onImageUploaded(publicUrl);
    } catch (err) {
      console.error('Image upload error:', err);
      alert('Failed to upload image. Make sure the "uploads" storage bucket exists in Supabase and is public.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm text-gray-400">{label}</label>}
      <div className="flex items-center gap-4">
        {currentImage && (
          <img
            src={currentImage}
            alt="Preview"
            className="w-20 h-20 object-cover rounded-lg border border-white/10"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <div className="flex-1">
          <Input
            value={currentImage}
            onChange={(e) => onImageUploaded(e.target.value)}
            className="bg-slate-700 border-white/20 text-white mb-2"
            placeholder="Or paste image URL here"
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {uploading ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Upload size={16} className="mr-2" />
            )}
            {uploading ? 'Uploading…' : 'Upload Image'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline save notification ─────────────────────────────────────────────────

function SaveBar({ saving, saved, error }: { saving: boolean; saved: boolean; error: string | null }) {
  if (!saving && !saved && !error) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2 ${
      error ? 'bg-red-600 text-white' : saving ? 'bg-slate-700 text-gray-200' : 'bg-green-600 text-white'
    }`}>
      {saving && <Loader2 size={16} className="animate-spin" />}
      {error && <AlertCircle size={16} />}
      {error ?? (saving ? 'Saving…' : 'Saved ✓')}
    </div>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const {
    homepage, about, materials, topics,
    saveHomepageContent, saveAboutContent, saveMaterialsContent,
    getSubtopics, loadSubtopics, saveTopicRow, removeTopicRow, moveTopicOrder,
    saveSubtopicRow, removeSubtopicRow,
    getLesson, loadLesson, saveLessonBlocks,
  } = useData();

  const [activeTab, setActiveTab] = useState('homepage');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState<string | null>(null);

  // Local draft state (pending changes before save)
  const [draftHomepage, setDraftHomepage] = useState<HomepageContent>(homepage);
  const [draftAbout, setDraftAbout] = useState<AboutContent>(about);
  const [draftMaterials, setDraftMaterials] = useState<MaterialsContent>(materials);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync drafts when remote data loads
  useEffect(() => { setDraftHomepage(homepage); }, [homepage]);
  useEffect(() => { setDraftAbout(about); }, [about]);
  useEffect(() => { setDraftMaterials(materials); }, [materials]);

  // Guard
  useEffect(() => {
    if (user && !isAdmin) navigate('/');
    if (!user) navigate('/login');
  }, [user, isAdmin, navigate]);

  // Load subtopics when a topic is selected
  useEffect(() => {
    if (selectedTopicId) {
      void loadSubtopics(selectedTopicId);
    }
  }, [selectedTopicId, loadSubtopics]);

  // Load lesson when a subtopic is selected
  useEffect(() => {
    if (selectedSubtopicId) {
      void loadLesson(selectedSubtopicId);
    }
  }, [selectedSubtopicId, loadLesson]);

  if (!user || !isAdmin) return null;

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const withSave = async (fn: () => Promise<void>) => {
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      await fn();
      showSaved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(msg);
      setTimeout(() => setSaveError(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  // ── Homepage helpers ──────────────────────────────────────────────────────

  const updateFeatureCard = (i: number, field: keyof FeatureCard, value: string) => {
    const c = [...draftHomepage.featureCards];
    c[i] = { ...c[i], [field]: value };
    setDraftHomepage({ ...draftHomepage, featureCards: c });
  };
  const updateFeaturedTopic = (i: number, field: keyof FeaturedTopic, value: string) => {
    const t = [...draftHomepage.featuredTopics];
    t[i] = { ...t[i], [field]: value };
    setDraftHomepage({ ...draftHomepage, featuredTopics: t });
  };
  const addFeaturedTopic = () =>
    setDraftHomepage({
      ...draftHomepage,
      featuredTopics: [
        ...draftHomepage.featuredTopics,
        { id: `ft-${Date.now()}`, title: 'New Topic', description: 'Description', image: '/images/topic-fundamentals.jpg' },
      ],
    });
  const deleteFeaturedTopic = (i: number) =>
    setDraftHomepage({ ...draftHomepage, featuredTopics: draftHomepage.featuredTopics.filter((_, idx) => idx !== i) });

  // ── Topics helpers ────────────────────────────────────────────────────────

  const handleAddTopic = async () => {
    await withSave(async () => {
      await saveTopicRow({
        slug: `topic-${Date.now()}`,
        emoji: '🚀',
        title: 'New Topic',
        description: 'Topic description',
        lessonCount: 0,
        image: '/images/topic-fundamentals.jpg',
        sortOrder: topics.length,
      });
    });
  };

  const handleUpdateTopic = async (topic: Topic) => {
    await withSave(async () => {
      await saveTopicRow(topic);
    });
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm('Delete this topic and all its subtopics?')) return;
    await withSave(() => removeTopicRow(id));
  };

  const handleMoveTopic = async (id: string, dir: 'up' | 'down') => {
    await withSave(() => moveTopicOrder(id, dir));
  };

  // ── Subtopics helpers ─────────────────────────────────────────────────────

  const currentSubtopics = selectedTopicId ? getSubtopics(selectedTopicId) : [];

  const handleAddSubtopic = async () => {
    if (!selectedTopicId) return;
    await withSave(async () => {
      await saveSubtopicRow({
        topicId: selectedTopicId,
        slug: `sub-${Date.now()}`,
        emoji: '📚',
        title: 'New Lesson',
        description: 'Lesson description',
        sortOrder: currentSubtopics.length,
      });
    });
  };

  const handleUpdateSubtopic = async (sub: Subtopic) => {
    await withSave(() => saveSubtopicRow(sub));
  };

  const handleDeleteSubtopic = async (id: string) => {
    if (!confirm('Delete this subtopic?')) return;
    await withSave(() => removeSubtopicRow(id));
  };

  const handleMoveSubtopic = async (id: string, dir: 'up' | 'down') => {
    if (!selectedTopicId) return;
    const subs = [...currentSubtopics];
    const idx = subs.findIndex((s) => s.id === id);
    if (idx < 0) return;
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === subs.length - 1) return;
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [subs[idx], subs[swap]] = [subs[swap], subs[idx]];
    const updated = subs.map((s, i) => ({ ...s, sortOrder: i }));
    await withSave(async () => {
      for (const s of updated) await saveSubtopicRow(s);
    });
  };

  // ── Lesson helpers ────────────────────────────────────────────────────────

  const currentLesson = selectedSubtopicId ? getLesson(selectedSubtopicId) : undefined;
  const currentBlocks = currentLesson?.blocks ?? [];

  const saveBlocks = async (blocks: LessonBlock[]) => {
    if (!selectedSubtopicId) return;
    await withSave(() => saveLessonBlocks(selectedSubtopicId, blocks));
  };
  const updateLessonBlock = async (i: number, content: string) => {
    const b = [...currentBlocks];
    b[i] = { ...b[i], content };
    await saveBlocks(b);
  };
  const addLessonBlock = async (type: 'text' | 'image') => saveBlocks([...currentBlocks, { type, content: '' }]);
  const removeLessonBlock = async (i: number) => saveBlocks(currentBlocks.filter((_, idx) => idx !== i));
  const moveLessonBlock = async (i: number, dir: 'up' | 'down') => {
    if (dir === 'up' && i === 0) return;
    if (dir === 'down' && i === currentBlocks.length - 1) return;
    const b = [...currentBlocks];
    const swap = dir === 'up' ? i - 1 : i + 1;
    [b[i], b[swap]] = [b[swap], b[i]];
    await saveBlocks(b);
  };

  // ── Materials helpers ─────────────────────────────────────────────────────

  const addGalleryImage = () =>
    setDraftMaterials({
      ...draftMaterials,
      galleryImages: [...draftMaterials.galleryImages, { id: `gallery-${Date.now()}`, url: '', title: 'New Image' }],
    });
  const updateGalleryImage = (i: number, field: keyof GalleryImage, value: string) => {
    const imgs = [...draftMaterials.galleryImages];
    imgs[i] = { ...imgs[i], [field]: value };
    setDraftMaterials({ ...draftMaterials, galleryImages: imgs });
  };
  const deleteGalleryImage = (i: number) =>
    setDraftMaterials({ ...draftMaterials, galleryImages: draftMaterials.galleryImages.filter((_, idx) => idx !== i) });

  const addVideo = () =>
    setDraftMaterials({
      ...draftMaterials,
      videos: [...draftMaterials.videos, { id: `video-${Date.now()}`, url: '', thumbnail: '', title: 'New Video' }],
    });
  const updateVideo = (i: number, field: keyof VideoItem, value: string) => {
    const v = [...draftMaterials.videos];
    v[i] = { ...v[i], [field]: value };
    setDraftMaterials({ ...draftMaterials, videos: v });
  };
  const deleteVideo = (i: number) =>
    setDraftMaterials({ ...draftMaterials, videos: draftMaterials.videos.filter((_, idx) => idx !== i) });

  const addPdf = () =>
    setDraftMaterials({
      ...draftMaterials,
      pdfs: [...draftMaterials.pdfs, { id: `pdf-${Date.now()}`, url: '', title: 'New PDF', label: 'New PDF' }],
    });
  const updatePdf = (i: number, field: keyof PdfItem, value: string) => {
    const p = [...draftMaterials.pdfs];
    p[i] = { ...p[i], [field]: value };
    setDraftMaterials({ ...draftMaterials, pdfs: p });
  };
  const deletePdf = (i: number) =>
    setDraftMaterials({ ...draftMaterials, pdfs: draftMaterials.pdfs.filter((_, idx) => idx !== i) });

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#0a0e1a]">
      <SaveBar saving={saving} saved={saved} error={saveError} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-8">
          Signed in as {user.email} · All changes persist to Supabase
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-900 border border-white/10 mb-8 flex flex-wrap gap-1 h-auto p-1">
            {['homepage', 'topics', 'subtopics', 'lessons', 'about', 'materials'].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white capitalize"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── HOMEPAGE ────────────────────────────────────────────── */}
          <TabsContent value="homepage" className="space-y-8">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Hero Section</h2>
                <Button onClick={() => withSave(() => saveHomepageContent(draftHomepage))} size="sm" className="bg-orange-500 hover:bg-orange-600">
                  <Save size={14} className="mr-1" /> Save
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Title</label>
                  <Input
                    value={draftHomepage.heroTitle}
                    onChange={(e) => setDraftHomepage({ ...draftHomepage, heroTitle: e.target.value })}
                    className="bg-slate-800 border-white/20 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Subtitle</label>
                  <Input
                    value={draftHomepage.heroSubtitle}
                    onChange={(e) => setDraftHomepage({ ...draftHomepage, heroSubtitle: e.target.value })}
                    className="bg-slate-800 border-white/20 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Feature Cards</h2>
                <Button onClick={() => withSave(() => saveHomepageContent(draftHomepage))} size="sm" className="bg-orange-500 hover:bg-orange-600">
                  <Save size={14} className="mr-1" /> Save
                </Button>
              </div>
              <div className="space-y-4">
                {draftHomepage.featureCards.map((card, i) => (
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
                <div className="flex gap-2">
                  <Button onClick={addFeaturedTopic} variant="outline" size="sm" className="border-white/20 text-white">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                  <Button onClick={() => withSave(() => saveHomepageContent(draftHomepage))} size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <Save size={14} className="mr-1" /> Save
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {draftHomepage.featuredTopics.map((topic, i) => (
                  <div key={topic.id} className="p-4 bg-slate-800 rounded-lg space-y-3">
                    <Input value={topic.title} onChange={(e) => updateFeaturedTopic(i, 'title', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Title" />
                    <Input value={topic.description} onChange={(e) => updateFeaturedTopic(i, 'description', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Description" />
                    <ImageUpload currentImage={topic.image} onImageUploaded={(url) => updateFeaturedTopic(i, 'image', url)} label="Topic Image" />
                    <Button variant="destructive" size="sm" onClick={() => deleteFeaturedTopic(i)}>
                      <Trash2 size={14} className="mr-1" /> Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── TOPICS ──────────────────────────────────────────────── */}
          <TabsContent value="topics" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Learning Topics</h2>
              <Button onClick={handleAddTopic} className="bg-orange-500 hover:bg-orange-600" disabled={saving}>
                <Plus size={18} className="mr-2" /> Add Topic
              </Button>
            </div>
            {topics.map((topic, i) => (
              <TopicEditor
                key={topic.id}
                topic={topic}
                index={i}
                totalTopics={topics.length}
                onSave={handleUpdateTopic}
                onDelete={() => handleDeleteTopic(topic.id)}
                onMove={(dir) => handleMoveTopic(topic.id, dir)}
                saving={saving}
              />
            ))}
          </TabsContent>

          {/* ── SUBTOPICS ────────────────────────────────────────────── */}
          <TabsContent value="subtopics" className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Select Topic</label>
              <select
                value={selectedTopicId ?? ''}
                onChange={(e) => { setSelectedTopicId(e.target.value || null); setSelectedSubtopicId(null); }}
                className="w-full bg-slate-800 border border-white/20 text-white rounded-md p-2"
              >
                <option value="">Select a topic…</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.emoji} {t.title}
                  </option>
                ))}
              </select>
            </div>
            {selectedTopicId && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Subtopics / Lessons</h2>
                  <Button onClick={handleAddSubtopic} className="bg-orange-500 hover:bg-orange-600" disabled={saving}>
                    <Plus size={18} className="mr-2" /> Add Subtopic
                  </Button>
                </div>
                {currentSubtopics.map((sub, i) => (
                  <SubtopicEditor
                    key={sub.id}
                    subtopic={sub}
                    index={i}
                    totalSubtopics={currentSubtopics.length}
                    onSave={handleUpdateSubtopic}
                    onDelete={() => handleDeleteSubtopic(sub.id)}
                    onMove={(dir) => handleMoveSubtopic(sub.id, dir)}
                    saving={saving}
                  />
                ))}
              </>
            )}
          </TabsContent>

          {/* ── LESSONS ─────────────────────────────────────────────── */}
          <TabsContent value="lessons" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Select Topic</label>
                <select
                  value={selectedTopicId ?? ''}
                  onChange={(e) => {
                    setSelectedTopicId(e.target.value || null);
                    setSelectedSubtopicId(null);
                  }}
                  className="w-full bg-slate-800 border border-white/20 text-white rounded-md p-2"
                >
                  <option value="">Select a topic…</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.emoji} {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Select Lesson</label>
                <select
                  value={selectedSubtopicId ?? ''}
                  onChange={(e) => setSelectedSubtopicId(e.target.value || null)}
                  className="w-full bg-slate-800 border border-white/20 text-white rounded-md p-2"
                  disabled={!selectedTopicId}
                >
                  <option value="">Select a lesson…</option>
                  {currentSubtopics.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.emoji} {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedTopicId && selectedSubtopicId && (
              <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-2">Lesson Content</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Add text blocks and image blocks. Changes auto-save to Supabase.
                </p>
                <div className="space-y-4">
                  {currentBlocks.map((block, i) => (
                    <div key={i} className="bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 uppercase font-medium">
                          {block.type === 'text' ? '📝 Text Block' : '🖼 Image Block'}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => moveLessonBlock(i, 'up')} disabled={i === 0 || saving}>
                            <ArrowUp size={14} />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => moveLessonBlock(i, 'down')} disabled={i === currentBlocks.length - 1 || saving}>
                            <ArrowDown size={14} />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => removeLessonBlock(i)} disabled={saving}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                      {block.type === 'text' ? (
                        <Textarea
                          value={block.content}
                          onChange={(e) => updateLessonBlock(i, e.target.value)}
                          className="bg-slate-700 border-white/20 text-white"
                          placeholder="Enter lesson text…"
                          rows={5}
                        />
                      ) : (
                        <ImageUpload
                          currentImage={block.content}
                          onImageUploaded={(url) => updateLessonBlock(i, url)}
                          label=""
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => addLessonBlock('text')} variant="outline" className="border-white/20 text-white hover:bg-white/10" disabled={saving}>
                    <Plus size={16} className="mr-2" /> Add Text
                  </Button>
                  <Button onClick={() => addLessonBlock('image')} variant="outline" className="border-white/20 text-white hover:bg-white/10" disabled={saving}>
                    <Plus size={16} className="mr-2" /> Add Image
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── ABOUT ───────────────────────────────────────────────── */}
          <TabsContent value="about" className="space-y-8">
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Our Mission</h2>
                <Button onClick={() => withSave(() => saveAboutContent(draftAbout))} size="sm" className="bg-orange-500 hover:bg-orange-600">
                  <Save size={14} className="mr-1" /> Save
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mission Text</label>
                  <Textarea
                    value={draftAbout.missionText}
                    onChange={(e) => setDraftAbout({ ...draftAbout, missionText: e.target.value })}
                    className="bg-slate-800 border-white/20 text-white"
                    rows={4}
                  />
                </div>
                <ImageUpload
                  currentImage={draftAbout.missionImage}
                  onImageUploaded={(url) => setDraftAbout({ ...draftAbout, missionImage: url })}
                  label="Mission Image"
                />
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Who We Are</h2>
                <Button onClick={() => withSave(() => saveAboutContent(draftAbout))} size="sm" className="bg-orange-500 hover:bg-orange-600">
                  <Save size={14} className="mr-1" /> Save
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Paragraph 1</label>
                  <Textarea
                    value={draftAbout.whoWeAreText1}
                    onChange={(e) => setDraftAbout({ ...draftAbout, whoWeAreText1: e.target.value })}
                    className="bg-slate-800 border-white/20 text-white"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Paragraph 2</label>
                  <Textarea
                    value={draftAbout.whoWeAreText2}
                    onChange={(e) => setDraftAbout({ ...draftAbout, whoWeAreText2: e.target.value })}
                    className="bg-slate-800 border-white/20 text-white"
                    rows={3}
                  />
                </div>
                <ImageUpload currentImage={draftAbout.whoWeAreImage1} onImageUploaded={(url) => setDraftAbout({ ...draftAbout, whoWeAreImage1: url })} label="Who We Are — Image 1" />
                <ImageUpload currentImage={draftAbout.whoWeAreImage2} onImageUploaded={(url) => setDraftAbout({ ...draftAbout, whoWeAreImage2: url })} label="Who We Are — Image 2" />
              </div>
            </div>
          </TabsContent>

          {/* ── MATERIALS ───────────────────────────────────────────── */}
          <TabsContent value="materials" className="space-y-8">
            {/* Gallery */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ImageIcon size={20} /> Image Gallery
                </h2>
                <div className="flex gap-2">
                  <Button onClick={addGalleryImage} variant="outline" size="sm" className="border-white/20 text-white">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                  <Button onClick={() => withSave(() => saveMaterialsContent(draftMaterials))} size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <Save size={14} className="mr-1" /> Save
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {draftMaterials.galleryImages.map((img, i) => (
                  <div key={img.id} className="p-4 bg-slate-800 rounded-lg flex items-start gap-4">
                    {img.url && (
                      <img src={img.url} alt={img.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="flex-1 space-y-2">
                      <Input value={img.title} onChange={(e) => updateGalleryImage(i, 'title', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Image Title" />
                      <ImageUpload currentImage={img.url} onImageUploaded={(url) => updateGalleryImage(i, 'url', url)} label="" />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteGalleryImage(i)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Play size={20} /> Video Collection
                </h2>
                <div className="flex gap-2">
                  <Button onClick={addVideo} variant="outline" size="sm" className="border-white/20 text-white">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                  <Button onClick={() => withSave(() => saveMaterialsContent(draftMaterials))} size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <Save size={14} className="mr-1" /> Save
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {draftMaterials.videos.map((video, i) => (
                  <div key={video.id} className="p-4 bg-slate-800 rounded-lg flex items-start gap-4">
                    {video.thumbnail && (
                      <img src={video.thumbnail} alt={video.title} className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                    <div className="flex-1 space-y-2">
                      <Input value={video.title} onChange={(e) => updateVideo(i, 'title', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Video Title" />
                      <Input value={video.url} onChange={(e) => updateVideo(i, 'url', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Video URL" />
                      <ImageUpload currentImage={video.thumbnail} onImageUploaded={(url) => updateVideo(i, 'thumbnail', url)} label="Thumbnail Image" />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deleteVideo(i)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* PDFs */}
            <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={20} /> PDF Documents
                </h2>
                <div className="flex gap-2">
                  <Button onClick={addPdf} variant="outline" size="sm" className="border-white/20 text-white">
                    <Plus size={14} className="mr-1" /> Add
                  </Button>
                  <Button onClick={() => withSave(() => saveMaterialsContent(draftMaterials))} size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <Save size={14} className="mr-1" /> Save
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                {draftMaterials.pdfs.map((pdf, i) => (
                  <div key={pdf.id} className="p-4 bg-slate-800 rounded-lg flex items-start gap-4">
                    <FileText size={40} className="text-orange-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 space-y-2">
                      <Input value={pdf.title} onChange={(e) => updatePdf(i, 'title', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="PDF Title" />
                      <Input value={pdf.label} onChange={(e) => updatePdf(i, 'label', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="Display Label" />
                      <Input value={pdf.url} onChange={(e) => updatePdf(i, 'url', e.target.value)} className="bg-slate-700 border-white/20 text-white" placeholder="PDF URL" />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => deletePdf(i)}>
                      <Trash2 size={16} />
                    </Button>
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

// ─── Sub-components (used inline in Admin) ─────────────────────────────────────

interface TopicEditorProps {
  topic: Topic;
  index: number;
  totalTopics: number;
  onSave: (t: Topic) => Promise<void>;
  onDelete: () => Promise<void>;
  onMove: (dir: 'up' | 'down') => Promise<void>;
  saving: boolean;
}

function TopicEditor({ topic, index, totalTopics, onSave, onDelete, onMove, saving }: TopicEditorProps) {
  const [draft, setDraft] = useState<Topic>(topic);
  useEffect(() => { setDraft(topic); }, [topic]);

  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input value={draft.emoji} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })} className="bg-slate-800 border-white/20 text-white" placeholder="Emoji" />
        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="bg-slate-800 border-white/20 text-white" placeholder="Title" />
        <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="bg-slate-800 border-white/20 text-white" placeholder="slug (URL-safe)" />
        <Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="bg-slate-800 border-white/20 text-white" placeholder="Description" />
        <Input type="number" value={draft.lessonCount} onChange={(e) => setDraft({ ...draft, lessonCount: parseInt(e.target.value) || 0 })} className="bg-slate-800 border-white/20 text-white" placeholder="Lesson Count" />
        <div className="md:col-span-1">
          <ImageUpload currentImage={draft.image} onImageUploaded={(url) => setDraft({ ...draft, image: url })} label="Topic Image" />
        </div>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => onMove('up')} disabled={index === 0 || saving}><ArrowUp size={16} /></Button>
        <Button variant="outline" size="sm" onClick={() => onMove('down')} disabled={index === totalTopics - 1 || saving}><ArrowDown size={16} /></Button>
        <Button size="sm" onClick={() => onSave(draft)} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
          <Save size={14} className="mr-1" /> Save
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} disabled={saving}><Trash2 size={16} /></Button>
      </div>
    </div>
  );
}

interface SubtopicEditorProps {
  subtopic: Subtopic;
  index: number;
  totalSubtopics: number;
  onSave: (s: Subtopic) => Promise<void>;
  onDelete: () => Promise<void>;
  onMove: (dir: 'up' | 'down') => Promise<void>;
  saving: boolean;
}

function SubtopicEditor({ subtopic, index, totalSubtopics, onSave, onDelete, onMove, saving }: SubtopicEditorProps) {
  const [draft, setDraft] = useState<Subtopic>(subtopic);
  useEffect(() => { setDraft(subtopic); }, [subtopic]);

  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input value={draft.emoji} onChange={(e) => setDraft({ ...draft, emoji: e.target.value })} className="bg-slate-800 border-white/20 text-white" placeholder="Emoji" />
        <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className="bg-slate-800 border-white/20 text-white md:col-span-2" placeholder="Title" />
        <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="bg-slate-800 border-white/20 text-white" placeholder="slug" />
        <Input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="bg-slate-800 border-white/20 text-white md:col-span-2" placeholder="Description" />
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        <Button variant="outline" size="sm" onClick={() => onMove('up')} disabled={index === 0 || saving}><ArrowUp size={16} /></Button>
        <Button variant="outline" size="sm" onClick={() => onMove('down')} disabled={index === totalSubtopics - 1 || saving}><ArrowDown size={16} /></Button>
        <Button size="sm" onClick={() => onSave(draft)} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
          <Save size={14} className="mr-1" /> Save
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete} disabled={saving}><Trash2 size={16} /></Button>
      </div>
    </div>
  );
}
