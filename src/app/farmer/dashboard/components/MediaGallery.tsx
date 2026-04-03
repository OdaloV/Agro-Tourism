// src/app/farmer/dashboard/components/MediaGallery.tsx
"use client";

import { useState, useEffect } from "react";
import { Camera, Trash2, Upload, X, Video, Plus } from "lucide-react";
import Link from "next/link";

interface Photo {
  id: number;
  url: string;
  sort_order: number;
  uploaded_at: string;
}

export default function MediaGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/farmer/photos');
      const data = await response.json();
      if (data.success) {
        setPhotos(data.photos || []);
        setVideoLink(data.videoLink);
      } else {
        console.error("Failed to fetch photos:", data.error);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check limit (max 10 photos)
    if (photos.length + files.length > 10) {
      alert(`You can only have up to 10 photos. You currently have ${photos.length}.`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        continue;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} exceeds 5MB limit`);
        continue;
      }
      
      formData.append('photos', file);
    }

    try {
      const response = await fetch('/api/farmer/photos', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchPhotos(); // Refresh photos
        alert('Photos uploaded successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload photos');
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const deletePhoto = async (photoId: number) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    
    try {
      const response = await fetch(`/api/farmer/photos?id=${photoId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPhotos(photos.filter(p => p.id !== photoId));
        alert('Photo deleted successfully');
      } else {
        alert('Failed to delete photo');
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert('Failed to delete photo');
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Media Gallery</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your farm photos and videos ({photos.length}/10 photos)
            </p>
          </div>
          <label className="cursor-pointer bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
            <Upload className="h-4 w-4" />
            Upload Photos
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              multiple
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Uploading Indicator */}
      {uploading && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uploading photos...</p>
          </div>
        </div>
      )}

      {/* Photos Grid */}
      <div className="p-6">
        {photos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No photos yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Upload photos of your farm to attract more visitors
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div 
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-700"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt="Farm"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Delete photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Video Section */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Farm Video Tour
          </h4>
          
          {videoLink ? (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <iframe
                src={videoLink.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                className="w-full h-full"
                allowFullScreen
                title="Farm Video Tour"
              />
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No video tour added</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add a YouTube or Vimeo link to showcase your farm
              </p>
              <Link href="/farmer/profile/edit">
                <button className="mt-4 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-lg text-sm transition">
                  Add Video Link
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Photo Preview */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-5xl w-full">
            <img
              src={selectedPhoto.url}
              alt="Farm preview"
              className="w-full h-auto rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}