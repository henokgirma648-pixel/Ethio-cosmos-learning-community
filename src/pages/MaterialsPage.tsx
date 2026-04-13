import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, FileText, Image } from 'lucide-react';
import { FallbackImage, FallbackVideo, FallbackPdfLink } from '@/components/MediaFallback';

export default function MaterialsPage() {
  const { materials, dataLoading } = useData();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d051a]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const { galleryImages, videos, pdfs } = materials;

  return (
    <div className="min-h-screen pt-16 bg-[#0d051a]">
      {/* Hero Section */}
      <section
        className="py-32 relative"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, rgba(13, 5, 26, 0.7), rgba(13, 5, 26, 0.9)), url(/images/materials-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight">
            Our Materials
          </h1>
          <p className="text-2xl text-purple-100/70 max-w-3xl mx-auto leading-relaxed">
            Explore and access our collection of resources related to space science and astronomy.
          </p>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-32 bg-[#0d051a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Image Gallery Card */}
            <div className="bg-purple-950/20 rounded-2xl overflow-hidden border border-white/5 p-10 shadow-2xl hover:border-purple-500/30 transition-all group">
              <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Image Gallery</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {galleryImages.slice(0, 4).map((img) => (
                  <div key={img.id} className="aspect-square rounded-xl overflow-hidden shadow-lg">
                    <FallbackImage
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                      fallbackClassName="w-full h-full"
                      onClick={() => { setSelectedImage(img.url); setGalleryOpen(true); }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-purple-300/50 text-lg mb-8">Browse Our Photos</p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-8 text-lg rounded-xl shadow-lg shadow-purple-500/10 transition-all"
                onClick={() => setGalleryOpen(true)}
              >
                <Image size={24} className="mr-3" />
                View Gallery
              </Button>
            </div>

            {/* Video Collection Card */}
            <div className="bg-purple-950/20 rounded-2xl overflow-hidden border border-white/5 p-10 shadow-2xl hover:border-purple-500/30 transition-all group">
              <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">Video Collection</h3>
              <div
                className="aspect-video rounded-xl overflow-hidden bg-purple-900/20 relative mb-8 group cursor-pointer shadow-lg"
                onClick={() => setVideoOpen(true)}
              >
                {videos[0] ? (
                  <>
                    <FallbackImage
                      src={videos[0].thumbnail}
                      alt={videos[0].title}
                      className="w-full h-full object-cover"
                      fallbackClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                      <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/40 group-hover:scale-110 transition-transform">
                        <Play size={32} className="text-white ml-1" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-300/20">
                    <Play size={60} />
                  </div>
                )}
              </div>
              <p className="text-purple-300/50 text-lg mb-8">Watch Our Videos</p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-8 text-lg rounded-xl shadow-lg shadow-purple-500/10 transition-all"
                onClick={() => setVideoOpen(true)}
              >
                <Play size={24} className="mr-3" />
                View Videos
              </Button>
            </div>

            {/* PDF Documents Card */}
            <div className="bg-purple-950/20 rounded-2xl overflow-hidden border border-white/5 p-10 shadow-2xl hover:border-purple-500/30 transition-all group">
              <h3 className="text-2xl font-bold text-white mb-8 tracking-tight">PDF Documents</h3>
              <div className="flex gap-6 mb-8">
                {pdfs.map((pdf) => (
                  <div
                    key={pdf.id}
                    className="flex-1 flex flex-col items-center p-6 bg-purple-900/20 rounded-xl border border-white/5 shadow-inner"
                  >
                    <FileText size={64} className="text-purple-500 mb-4" />
                    <span className="text-sm text-purple-300/60 text-center font-medium">{pdf.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-purple-300/50 text-lg mb-8">Download Resources</p>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-8 text-lg rounded-xl shadow-lg shadow-purple-500/10 transition-all"
                onClick={() => setPdfOpen(true)}
              >
                <FileText size={24} className="mr-3" />
                View PDFs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-5xl bg-purple-950/95 backdrop-blur-2xl border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-white mb-6">Image Gallery</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-4 max-h-[70vh] overflow-y-auto p-2">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-xl border border-white/5"
                onClick={() => setSelectedImage(img.url)}
              >
                <FallbackImage
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  fallbackClassName="w-full h-full"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl bg-black/90 border-none p-0 overflow-hidden rounded-3xl">
          {selectedImage && (
            <FallbackImage
              src={selectedImage}
              alt="Preview"
              className="w-full h-auto"
              fallbackClassName="w-full h-96 rounded-3xl"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl bg-purple-950/95 backdrop-blur-2xl border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-white mb-6">Video Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-8 mt-4 max-h-[70vh] overflow-y-auto p-2">
            {videos.length === 0 ? (
              <p className="text-purple-300/40 text-center py-16 text-xl">No videos available yet.</p>
            ) : (
              videos.map((video) => (
                <div key={video.id} className="space-y-4">
                  <p className="text-lg font-semibold text-purple-100/80">{video.title}</p>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black/40 shadow-2xl border border-white/5">
                    <FallbackVideo
                      src={video.url}
                      poster={video.thumbnail}
                      className="w-full h-full"
                      fallbackClassName="w-full h-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Modal */}
      <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
        <DialogContent className="max-w-3xl bg-purple-950/95 backdrop-blur-2xl border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-white mb-6">PDF Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto p-2">
            {pdfs.length === 0 ? (
              <p className="text-purple-300/40 text-center py-16 text-xl">No PDFs available yet.</p>
            ) : (
              pdfs.map((pdf) => (
                <div key={pdf.id} className="bg-purple-900/20 p-6 rounded-2xl border border-white/5 hover:bg-purple-900/30 transition-colors">
                  <FallbackPdfLink src={pdf.url} title={pdf.title} />
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
