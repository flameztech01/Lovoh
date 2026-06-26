// screens/PosterGeneratorPage.jsx
import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaSpinner, FaCheckCircle, FaImage, FaUserCircle,
  FaPaintBrush, FaDownload, FaTimes, FaEye, FaArrowLeft,
} from 'react-icons/fa';
import {
  useGetPublicRegistrationQuery,
  useGeneratePosterMutation,
} from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import AllEventsNavbar from '../components/AllEventsNavbar';
import Footer from '../components/Footer';

const PosterGeneratorPage = () => {
  const { registrationId } = useParams();
  const fileInputRef = useRef(null);

  // Fetch registration data
  const {
    data: registrationData,
    isLoading,
    error,
  } = useGetPublicRegistrationQuery(registrationId);

  const [generatePoster, { isLoading: isGenerating }] = useGeneratePosterMutation();

  // Local state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [name, setName] = useState('');
  const [generatedPosterUrl, setGeneratedPosterUrl] = useState(null);

  // When registration data loads, pre-fill name
  React.useEffect(() => {
    if (registrationData?.name) {
      setName(registrationData.name);
    }
    if (registrationData?.posterImage) {
      setGeneratedPosterUrl(registrationData.posterImage);
    }
  }, [registrationData]);

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max 5MB');
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!photoFile && !photoPreview) {
      toast.error('Please upload a photo');
      return;
    }
    if (!name.trim()) {
      toast.error('Please enter your name for the poster');
      return;
    }

    try {
      const formData = new FormData();
      if (photoFile) formData.append('photo', photoFile);
      formData.append('name', name.trim());

      const result = await generatePoster({
        id: registrationData.event._id,
        registrationId: registrationId,
        formData,
      }).unwrap();

      setGeneratedPosterUrl(result.posterImage);
      toast.success('Poster generated successfully!');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to generate poster');
    }
  };

  const downloadPoster = async () => {
    if (!generatedPosterUrl) return;
    try {
      const response = await fetch(generatedPosterUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `poster_${registrationData?.event?.title?.replace(/\s+/g, '_') || 'poster'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      window.open(generatedPosterUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AllEventsNavbar />
        <div className="flex justify-center items-center h-96 pt-20">
          <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !registrationData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AllEventsNavbar />
        <div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Poster Not Found</h1>
            <p className="text-gray-600 mb-6">
              The poster link you followed is invalid or expired.
            </p>
            <Link to="/" className="inline-block px-6 py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all">
              Browse Events
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { event } = registrationData;
  const template = event?.posterTemplate;

  if (!template || !template.image) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AllEventsNavbar />
        <div className="max-w-4xl mx-auto px-4 py-20 pt-24 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Poster Not Available</h1>
            <p className="text-gray-600 mb-6">
              This event does not have a poster template.
            </p>
            <Link to="/" className="inline-block px-6 py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all">
              Browse Events
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AllEventsNavbar />
      <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1B3766] transition-colors text-sm mb-4">
          <FaArrowLeft className="text-xs" /> Browse Events
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {generatedPosterUrl ? 'Your Poster is Ready! 🎨' : 'Create Your "I\'m Attending" Poster'}
            </h1>
            <p className="text-gray-600">
              {event.title}
            </p>
          </div>

          {/* Poster Preview / Generated Poster */}
          <div className="relative bg-gray-50 rounded-xl p-4 mb-4 flex justify-center">
            {generatedPosterUrl ? (
              <img
                src={generatedPosterUrl}
                alt="Your poster"
                className="max-w-full max-h-[400px] rounded-lg shadow-md object-contain"
              />
            ) : (
              <div className="relative w-full max-w-[400px]">
                <img
                  src={template.image}
                  alt="Poster template"
                  className="w-full h-auto rounded-lg shadow-md"
                />
                {/* Overlay placeholders */}
                <div
                  className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 rounded flex items-center justify-center text-xs text-blue-600 font-medium"
                  style={{
                    left: `${(template.photoPlaceholder.x / 736) * 100}%`,
                    top: `${(template.photoPlaceholder.y / 736) * 100}%`,
                    width: `${(template.photoPlaceholder.width / 736) * 100}%`,
                    height: `${(template.photoPlaceholder.height / 736) * 100}%`,
                    borderRadius: `${template.photoPlaceholder.borderRadius || 0}px`,
                  }}
                >
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">📷 Your Photo</span>
                </div>
                <div
                  className="absolute border-2 border-dashed border-green-500 bg-green-500/10 flex items-center justify-center text-xs text-green-700 font-bold"
                  style={{
                    left: `${(template.namePlaceholder.x / 736) * 100}%`,
                    top: `${(template.namePlaceholder.y / 736) * 100}%`,
                    fontSize: `${(template.namePlaceholder.fontSize / 736) * 100}vh`,
                    color: template.namePlaceholder.color,
                    fontFamily: template.namePlaceholder.fontFamily,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Your Name
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FaEye className="text-[10px]" /> Preview
                </div>
              </div>
            )}
          </div>

          {!generatedPosterUrl && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Personalise your poster with your photo and name. Share it on social media!
              </p>

              {/* Photo upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Photo</label>
                <div className="flex items-center gap-4">
                  {photoPreview ? (
                    <div className="relative group">
                      <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-[#1B3766]" />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="text-[10px]" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <FaUserCircle className="text-4xl text-gray-400" />
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                      <FaImage className="text-xs" /> {photoPreview ? 'Change' : 'Upload Photo'}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG (max 5MB)</p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name on Poster</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter the name you want on the poster"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? <FaSpinner className="animate-spin" /> : <FaPaintBrush />}
                {isGenerating ? 'Generating...' : 'Generate Poster'}
              </button>
            </div>
          )}

          {generatedPosterUrl && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={downloadPoster}
                className="flex-1 py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-all flex items-center justify-center gap-2"
              >
                <FaDownload /> Download Poster
              </button>
              <Link
                to="/"
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all text-center"
              >
                Back to Events
              </Link>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center mt-4">
            {generatedPosterUrl
              ? 'Your poster is also available in your dashboard.'
              : 'You can also generate your poster later from your dashboard.'}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PosterGeneratorPage;