import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, FileText, Image } from 'lucide-react';

export default function MaterialsPage() {
  const { galleryImages, videos, pdfs } = useData();
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section 
        className="py-20 relative"
        style={{
          backgroundImage: 'linear-gradient(to bottom, rgba(5, 8, 16, 0.7), rgba(10, 14, 26, 0.9)), url(/images/materials-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Our Materials
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore and access our collection of resources related to space science and astronomy.
          </p>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Image Gallery Card */}
            <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Image Gallery</h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {galleryImages.slice(0, 4).map((img) => (
                  <div key={img.id} className="aspect-square rounded-lg overflow-hidden">
                    <img 
                      src={img.url} 
                      alt={img.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                      onClick={() => {
                        setSelectedImage(img.url);
                        setGalleryOpen(true);
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm mb-4">Browse Our Photos</p>
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setGalleryOpen(true)}
              >
                <Image size={18} className="mr-2" />
                View Gallery
              </Button>
            </div>

            {/* Video Collection Card */}
            <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Video Collection</h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-slate-800 relative mb-4 group cursor-pointer" onClick={() => setVideoOpen(true)}>
                {videos[0] && (
                  <>
                    <img 
                      src={videos[0].thumbnail} 
                      alt={videos[0].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
                      <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                        <Play size={24} className="text-white ml-1" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-4">Watch Our Videos</p>
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setVideoOpen(true)}
              >
                <Play size={18} className="mr-2" />
                View Videos
              </Button>
            </div>

            {/* PDF Documents Card */}
            <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">PDF Documents</h3>
              <div className="flex gap-4 mb-4">
                {pdfs.map((pdf) => (
                  <div key={pdf.id} className="flex-1 flex flex-col items-center p-4 bg-slate-800 rounded-lg">
                    <FileText size={48} className="text-orange-500 mb-2" />
                    <span className="text-xs text-gray-400 text-center">{pdf.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-400 text-sm mb-4">Download Resources</p>
              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => setPdfOpen(true)}
              >
                <FileText size={18} className="mr-2" />
                View PDFs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-4xl bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Image Gallery</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {galleryImages.map((img) => (
              <div key={img.id} className="aspect-square rounded-lg overflow-hidden cursor-pointer" onClick={() => setSelectedImage(img.url)}>
                <img src={img.url} alt={img.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl bg-slate-900 border-white/10 p-0">
          {selectedImage && (
            <img src={selectedImage} alt="Preview" className="w-full h-auto rounded-lg" />
          )}
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-3xl bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Video Collection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {videos.map((video) => (
              <div key={video.id} className="aspect-video rounded-lg overflow-hidden bg-slate-800">
                <video 
                  src={video.url} 
                  controls 
                  poster={video.thumbnail}
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* PDF Modal */}
      <Dialog open={pdfOpen} onOpenChange={setPdfOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">PDF Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {pdfs.map((pdf) => (
              <a 
                key={pdf.id}
                href={pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <FileText size={32} className="text-orange-500" />
                <div>
                  <h4 className="text-white font-medium">{pdf.title}</h4>
                  <p className="text-gray-400 text-sm">Click to download</p>
                </div>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
