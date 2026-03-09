import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GalleryImage {
  id: string;
  title: string | null;
  caption: string | null;
  image_url: string;
  created_at: string;
}

const GallerySection: React.FC = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching images:', error);
    } else {
      setImages(data || []);
    }
    setIsLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('gallery_images')
        .insert({ image_url: publicUrl });

      if (dbError) throw dbError;

      toast({
        title: "Photo uploaded! 📸",
        description: "Your memory has been added to the gallery",
      });

      fetchImages();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload the photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    try {
      // Extract file path from URL
      const urlParts = image.image_url.split('/');
      const filePath = urlParts.slice(-2).join('/');

      // Delete from storage
      await supabase.storage.from('gallery-images').remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      setSelectedImage(null);
      toast({
        title: "Photo removed",
        description: "The memory has been deleted",
      });

      fetchImages();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const placeholderCount = Math.max(0, 6 - images.length);

  return (
    <section className="py-12 px-4 w-full max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 font-body">
          Captured in time
        </p>
        <h2 className="text-3xl md:text-5xl font-display text-gradient-sunset">
          Moments Gallery
        </h2>
        <p className="text-muted-foreground mt-4 font-body text-sm">
          Our photos together ♥ Click the + to add more
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {/* Upload button */}
        <motion.label
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          className="relative aspect-[4/5] rounded-xl overflow-hidden bg-card/40 border-2 border-dashed border-primary/20 backdrop-blur-sm cursor-pointer group flex items-center justify-center hover:border-primary/40 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className="text-center">
            {uploading ? (
              <div className="animate-spin text-4xl">⏳</div>
            ) : (
              <>
                <Plus className="w-12 h-12 mx-auto text-primary/40 group-hover:text-primary/60 transition-colors" />
                <p className="text-xs text-muted-foreground mt-2">Add Photo</p>
              </>
            )}
          </div>
        </motion.label>

        {/* Actual images */}
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.03, zIndex: 10 }}
            onClick={() => setSelectedImage(img)}
            className="relative aspect-[4/5] rounded-xl overflow-hidden bg-card/40 border border-primary/10 backdrop-blur-sm group cursor-pointer"
          >
            <img
              src={img.image_url}
              alt={img.title || 'Memory'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>
        ))}

        {/* Placeholders */}
        {Array.from({ length: placeholderCount }).map((_, i) => (
          <motion.div
            key={`placeholder-${i}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (images.length + i) * 0.05, duration: 0.3 }}
            className="relative aspect-[4/5] rounded-xl overflow-hidden bg-card/20 border border-primary/5 backdrop-blur-sm"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2 opacity-20">📷</div>
                <p className="text-xs text-muted-foreground/30">Empty slot</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] w-full"
            >
              <img
                src={selectedImage.image_url}
                alt={selectedImage.title || 'Memory'}
                className="w-full h-full object-contain rounded-xl"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedImage)}
                  className="p-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;