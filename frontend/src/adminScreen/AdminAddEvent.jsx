// adminScreen/AdminAddEvent.jsx - Speaker images as file uploads
import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaTag,
  FaDollarSign,
  FaInfoCircle,
  FaUsers,
  FaImage,
  FaTrashAlt,
  FaPlus,
  FaBold,
  FaItalic,
  FaUnderline,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaListUl,
  FaListOl,
  FaLink,
  FaHeading,
  FaEye,
  FaQuoteRight,
  FaTimes,
  FaVideo,
  FaGlobe,
  FaStar,
  FaRegStar,
  FaLayerGroup,
  FaUser,
  FaTicketAlt,
  FaMinus,
  FaSpinner,
  FaCamera,
} from "react-icons/fa";
import { useCreateEventMutation } from "../slices/eventApiSlice";
import { toast } from "react-toastify";
import AdminSidebar from "../adminComponents/AdminSidebar";

// Toolbar button component
const ToolbarButton = ({ onClick, active, icon: Icon, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded hover:bg-gray-200 transition-colors ${
      active ? "bg-gray-200 text-[#1B3766]" : "text-gray-600"
    }`}
  >
    <Icon className="text-sm" />
  </button>
);

const AdminAddEvent = () => {
  const navigate = useNavigate();
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const editorRef = useRef(null);

  // Rich text editor state
  const [description, setDescription] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const categories = [
    "Business", "Technology", "Lifestyle", "Education", "Entertainment",
    "Art & Culture", "Health & Wellness", "Sports", "Food & Drink",
    "Networking", "Career Development", "Faith & Spirituality",
    "Fashion & Beauty", "Music", "Film & Media", "Travel",
    "Real Estate", "Finance", "Agriculture", "Other"
  ];

  const eventTypes = [
    "Conference", "Workshop", "Seminar", "Webinar", "Networking",
    "Training", "Meetup", "Panel Discussion", "Keynote", "Hackathon",
    "Awards Ceremony", "Product Launch", "Fundraiser", "Exhibition",
    "Masterclass", "Bootcamp", "Retreat", "Gala", "Competition", "Other"
  ];

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    eventType: "",
    date: "",
    time: "",
    duration: "",
    location: "",
    venue: "",
    isVirtual: false,
    meetingLink: "",
    isPaid: false,
    price: "",
    maxAttendees: "",
    registrationDeadline: "",
    featured: false,
    tags: "",
    enableMultipleTickets: false,
    maxTicketsPerOrder: "10",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Ticket Types
  const [ticketTypes, setTicketTypes] = useState([]);
  
  // Speakers
  const [speakers, setSpeakers] = useState([]);
  const [speakerFiles, setSpeakerFiles] = useState({}); // Store actual File objects

  // Rich text formatting functions
  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
    }
  }, []);

  const insertHeading = (level) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const heading = document.createElement(`h${level}`);
      heading.style.marginBottom = "8px";
      heading.style.fontWeight = "bold";
      heading.style.lineHeight = "1.4";
      if (level === 1) heading.style.fontSize = "24px";
      if (level === 2) heading.style.fontSize = "20px";
      if (level === 3) heading.style.fontSize = "16px";
      heading.textContent = selection.toString();
      range.deleteContents();
      range.insertNode(heading);
      if (editorRef.current) {
        setDescription(editorRef.current.innerHTML);
      }
    }
  };

  const insertLink = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const url = prompt("Enter URL:");
      if (url) {
        document.execCommand("createLink", false, url);
        if (editorRef.current) {
          setDescription(editorRef.current.innerHTML);
        }
      }
    }
  };

  const insertQuote = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const blockquote = document.createElement("blockquote");
      blockquote.style.borderLeft = "3px solid #1B3766";
      blockquote.style.paddingLeft = "16px";
      blockquote.style.margin = "12px 0";
      blockquote.style.color = "#4B5563";
      blockquote.style.fontStyle = "italic";
      blockquote.textContent = selection.toString();
      range.deleteContents();
      range.insertNode(blockquote);
      if (editorRef.current) {
        setDescription(editorRef.current.innerHTML);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 10 - images.length;

    if (files.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s). Max 10 images.`);
      return;
    }

    const newImages = [];
    const newPreviews = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10MB`);
        continue;
      }
      newImages.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === newImages.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Ticket Types Management
  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { 
      name: '', 
      price: '', 
      capacity: '', 
      description: '', 
      seatsPerTicket: 1 
    }]);
  };

  const removeTicketType = (index) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const updateTicketType = (index, field, value) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  // Speakers Management
  const addSpeaker = () => {
    setSpeakers([...speakers, { name: '', title: '', company: '', bio: '', imagePreview: '' }]);
  };

  const removeSpeaker = (index) => {
    // Remove speaker file if exists
    setSpeakerFiles(prev => {
      const updated = { ...prev };
      delete updated[index];
      // Re-index remaining files
      const reindexed = {};
      Object.keys(updated).sort((a, b) => Number(a) - Number(b)).forEach((key, i) => {
        reindexed[i] = updated[key];
      });
      return reindexed;
    });
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const updateSpeaker = (index, field, value) => {
    const updated = [...speakers];
    updated[index] = { ...updated[index], [field]: value };
    setSpeakers(updated);
  };

  // Handle speaker image upload - stores actual File object
  const handleSpeakerImageSelect = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Speaker image must be less than 5MB");
      return;
    }

    // Store the actual File object for upload
    setSpeakerFiles(prev => ({ ...prev, [index]: file }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      updateSpeaker(index, 'imagePreview', reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeSpeakerImage = (index) => {
    setSpeakerFiles(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
    updateSpeaker(index, 'imagePreview', '');
  };

  const handleEditorInput = (e) => {
    setDescription(e.currentTarget.innerHTML);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Event title is required");
      return;
    }
    
    const textContent = editorRef.current?.textContent?.trim() || '';
    if (!description || description === "<br>" || textContent.length < 20) {
      toast.error("Please add a detailed event description (minimum 20 characters)");
      return;
    }
    if (!formData.category) {
      toast.error("Category is required");
      return;
    }
    if (!formData.eventType) {
      toast.error("Event type is required");
      return;
    }
    if (!formData.date) {
      toast.error("Event date is required");
      return;
    }
    if (!formData.time) {
      toast.error("Event time is required");
      return;
    }
    if (!formData.location && !formData.venue) {
      toast.error("Location is required");
      return;
    }
    if (images.length === 0) {
      toast.error("At least one event image is required");
      return;
    }

    // Validate ticket types for paid events
    if (formData.isPaid) {
      if (ticketTypes.length > 0) {
        for (const tt of ticketTypes) {
          if (!tt.name.trim()) {
            toast.error("All ticket types must have a name");
            return;
          }
          if (!tt.price || Number(tt.price) <= 0) {
            toast.error(`Price is required for "${tt.name}" ticket type`);
            return;
          }
        }
      } else {
        if (!formData.price || Number(formData.price) <= 0) {
          toast.error("Please set a valid price for the paid event");
          return;
        }
      }
    }

    const submitData = new FormData();
    submitData.append("title", formData.title.trim());
    submitData.append("description", description);
    submitData.append("category", formData.category);
    submitData.append("eventType", formData.eventType);
    submitData.append("date", formData.date);
    submitData.append("time", formData.time);
    submitData.append("duration", formData.duration || "");
    submitData.append("location", formData.location || "");
    submitData.append("venue", formData.venue || formData.location || "");
    submitData.append("isVirtual", formData.isVirtual);
    submitData.append("meetingLink", formData.meetingLink || "");
    submitData.append("isPaid", formData.isPaid);
    submitData.append("price", formData.isPaid && !ticketTypes.length ? formData.price : "0");
    submitData.append("maxAttendees", formData.maxAttendees || "0");
    submitData.append("featured", formData.featured);
    submitData.append("tags", formData.tags || "");
    submitData.append("enableMultipleTickets", formData.enableMultipleTickets);
    submitData.append("maxTicketsPerOrder", formData.enableMultipleTickets ? formData.maxTicketsPerOrder : "1");
    
    // Append ticket types as JSON
    if (ticketTypes.length > 0) {
      submitData.append("ticketTypes", JSON.stringify(ticketTypes));
    }
    
    // Clean speakers data - remove imagePreview, image will come from file upload
    const speakersForSubmit = speakers.map(({ imagePreview, ...rest }) => ({
      ...rest,
      image: '' // Image URL will be set by multer/cloudinary
    }));
    
    // Append speakers as JSON (without image data)
    if (speakersForSubmit.length > 0) {
      submitData.append("speakers", JSON.stringify(speakersForSubmit));
    }
    
    // Append speaker images as FILES using indexed field names
    Object.entries(speakerFiles).forEach(([index, file]) => {
      submitData.append(`speakerImages[${index}]`, file);
    });
    
    if (formData.registrationDeadline) {
      submitData.append("registrationDeadline", formData.registrationDeadline);
    }

    // Append event images
    images.forEach((image) => {
      submitData.append("images", image);
    });

    try {
      await createEvent(submitData).unwrap();
      toast.success("Event created successfully!");
      navigate("/admin/events");
    } catch (error) {
      console.error("Create event error:", error);
      toast.error(error?.data?.message || "Failed to create event");
    }
  };

  return (
    <AdminSidebar>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate("/admin/events")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-2 transition-colors text-sm"
            >
              <FaArrowLeft className="text-xs" />
              Back to Events
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Event</h1>
            <p className="text-gray-500 mt-1 text-sm">Fill in the details below to publish your event</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1B3766] text-white rounded-lg font-medium hover:bg-[#142952] transition-all disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <FaSpinner className="animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <FaSave />
                Publish Event
              </>
            )}
          </button>
        </div>

        <form className="grid lg:grid-cols-5 gap-6" onSubmit={(e) => e.preventDefault()}>
          {/* Main Content - Left 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Event Title */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Give your event a clear, compelling title..."
                className="w-full px-4 py-3 text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent"
              />
            </div>

            {/* Rich Text Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Event Description <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    previewMode
                      ? "bg-[#1B3766] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <FaEye className="text-xs" />
                  {previewMode ? "Edit" : "Preview"}
                </button>
              </div>

              {/* Toolbar */}
              {!previewMode && (
                <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 rounded-t-lg border border-gray-200 border-b-0">
                  <ToolbarButton onClick={() => execCommand("bold")} icon={FaBold} title="Bold (Ctrl+B)" />
                  <ToolbarButton onClick={() => execCommand("italic")} icon={FaItalic} title="Italic (Ctrl+I)" />
                  <ToolbarButton onClick={() => execCommand("underline")} icon={FaUnderline} title="Underline (Ctrl+U)" />
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <ToolbarButton onClick={() => execCommand("justifyLeft")} icon={FaAlignLeft} title="Align Left" />
                  <ToolbarButton onClick={() => execCommand("justifyCenter")} icon={FaAlignCenter} title="Align Center" />
                  <ToolbarButton onClick={() => execCommand("justifyRight")} icon={FaAlignRight} title="Align Right" />
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <ToolbarButton onClick={() => execCommand("insertUnorderedList")} icon={FaListUl} title="Bullet List" />
                  <ToolbarButton onClick={() => execCommand("insertOrderedList")} icon={FaListOl} title="Numbered List" />
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <ToolbarButton onClick={() => insertHeading(2)} icon={FaHeading} title="Heading" />
                  <ToolbarButton onClick={insertQuote} icon={FaQuoteRight} title="Quote Block" />
                  <ToolbarButton onClick={insertLink} icon={FaLink} title="Insert Link" />
                </div>
              )}

              {/* Editor / Preview */}
              {previewMode ? (
                <div
                  className="min-h-[300px] p-4 border border-gray-200 rounded-b-lg bg-white prose prose-sm max-w-none overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: description || '<p class="text-gray-400">No content yet...</p>' }}
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className="min-h-[300px] p-4 border border-gray-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-gray-700 leading-relaxed overflow-y-auto"
                  onInput={handleEditorInput}
                  onBlur={handleEditorInput}
                  data-placeholder="Describe your event in detail... What should attendees expect? What will they learn? Include an agenda or schedule if possible."
                />
              )}

              <style jsx>{`
                [contenteditable]:empty:before {
                  content: attr(data-placeholder);
                  color: #9CA3AF;
                  pointer-events: none;
                }
              `}</style>

              <p className="text-xs text-gray-500 mt-2">
                {previewMode
                  ? "Switch back to edit mode to make changes."
                  : "Tip: Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline."}
              </p>
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-[#1B3766]" />
                Date & Time <span className="text-red-500">*</span>
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                  <input type="time" name="time" value={formData.time} onChange={handleChange} required
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Duration (optional)</label>
                  <input type="text" name="duration" value={formData.duration} onChange={handleChange}
                    placeholder="e.g., 2 hours"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#1B3766]" />
                Location <span className="text-red-500">*</span>
              </h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Venue / Location</label>
                    <input type="text" name="venue" value={formData.venue} onChange={handleChange}
                      placeholder="e.g., Eko Convention Centre"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">City / Address</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange}
                      placeholder="e.g., Victoria Island, Lagos"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isVirtual" checked={formData.isVirtual} onChange={handleChange}
                      className="text-[#1B3766] focus:ring-[#1B3766] rounded" />
                    <span className="text-sm text-gray-700 flex items-center gap-1.5">
                      <FaVideo className="text-blue-500" />
                      This is a virtual / online event
                    </span>
                  </label>
                </div>

                {formData.isVirtual && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Meeting Link</label>
                    <input type="url" name="meetingLink" value={formData.meetingLink} onChange={handleChange}
                      placeholder="https://meet.google.com/xxx or https://zoom.us/xxx"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
                  </div>
                )}
              </div>
            </div>

            {/* Speakers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FaUser className="text-[#1B3766]" />
                  Speakers
                </h3>
                <button type="button" onClick={addSpeaker}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1B3766] text-white rounded-lg hover:bg-[#142952] transition-colors">
                  <FaPlus /> Add Speaker
                </button>
              </div>

              {speakers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No speakers added yet</p>
              ) : (
                <div className="space-y-4">
                  {speakers.map((speaker, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Speaker {idx + 1}</h4>
                        <button type="button" onClick={() => removeSpeaker(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
                      
                      {/* Speaker Image Upload */}
                      <div className="mb-4">
                        <label className="block text-xs text-gray-500 mb-2">Speaker Photo</label>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {speaker.imagePreview ? (
                              <div className="relative group">
                                <img src={speaker.imagePreview} alt="Speaker preview"
                                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                                <button type="button" onClick={() => removeSpeakerImage(idx)}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <FaTimes className="text-[10px]" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300">
                                <FaUser className="text-2xl text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label className="cursor-pointer">
                              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                                <FaCamera className="text-xs" />
                                {speaker.imagePreview ? 'Change Photo' : 'Upload Photo'}
                              </div>
                              <input type="file" accept="image/*"
                                onChange={(e) => handleSpeakerImageSelect(idx, e)} className="hidden" />
                            </label>
                            <p className="text-[10px] text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Name</label>
                          <input type="text" value={speaker.name}
                            onChange={(e) => updateSpeaker(idx, 'name', e.target.value)}
                            placeholder="Full name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Title/Role</label>
                          <input type="text" value={speaker.title}
                            onChange={(e) => updateSpeaker(idx, 'title', e.target.value)}
                            placeholder="e.g., CEO, Senior Developer"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Company</label>
                          <input type="text" value={speaker.company}
                            onChange={(e) => updateSpeaker(idx, 'company', e.target.value)}
                            placeholder="Company name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="block text-xs text-gray-500 mb-1">Bio</label>
                        <textarea value={speaker.bio}
                          onChange={(e) => updateSpeaker(idx, 'bio', e.target.value)}
                          placeholder="Brief bio..." rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Registration Deadline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Deadline</label>
              <input type="date" name="registrationDeadline" value={formData.registrationDeadline}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
              <p className="text-xs text-gray-400 mt-1">If not set, registration closes on event date</p>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaImage className="text-[#1B3766]" />
                Event Images <span className="text-red-500">*</span>
                <span className="text-xs text-gray-400 font-normal">({images.length}/10)</span>
              </h3>

              {images.length < 10 && (
                <label className="block w-full cursor-pointer mb-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1B3766] transition-colors">
                    <FaPlus className="text-2xl text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (Max 10MB each)</p>
                    <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                  </div>
                </label>
              )}

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-28 object-cover rounded-lg border border-gray-200" />
                      <button type="button" onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaTrashAlt className="text-[10px]" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#1B3766] text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category & Type */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaTag className="text-[#1B3766]" />Category & Type
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category <span className="text-red-500">*</span></label>
                  <select name="category" value={formData.category} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm">
                    <option value="">Select category</option>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Event Type <span className="text-red-500">*</span></label>
                  <select name="eventType" value={formData.eventType} onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm">
                    <option value="">Select type</option>
                    {eventTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange}
                placeholder="e.g., tech, startup, AI, networking (comma separated)"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
              <p className="text-xs text-gray-400 mt-1">Help people find your event</p>
            </div>

            {/* Pricing & Ticket Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaDollarSign className="text-[#1B3766]" />Pricing & Tickets
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleChange}
                    className="text-[#1B3766] focus:ring-[#1B3766] rounded" />
                  <span className="text-sm text-gray-700 font-medium">This is a paid event</span>
                </label>

                {formData.isPaid && (
                  <>
                    {ticketTypes.length === 0 && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Ticket Price (₦) <span className="text-red-500">*</span></label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange}
                          placeholder="e.g., 5000" min="100"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FaLayerGroup className="text-[#1B3766]" />Ticket Types
                        </h4>
                        <button type="button" onClick={addTicketType}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-[#1B3766] text-white rounded-lg hover:bg-[#142952] transition-colors">
                          <FaPlus /> Add Type
                        </button>
                      </div>

                      {ticketTypes.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">Add ticket types or use single price above</p>
                      ) : (
                        <div className="space-y-3">
                          {ticketTypes.map((tt, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="text-xs font-medium text-gray-700">Ticket Type {idx + 1}</h5>
                                <button type="button" onClick={() => removeTicketType(idx)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors">
                                  <FaMinus className="text-[10px]" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] text-gray-500">Name *</label>
                                  <input type="text" value={tt.name}
                                    onChange={(e) => updateTicketType(idx, 'name', e.target.value)}
                                    placeholder="e.g., VIP"
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500">Price (₦) *</label>
                                  <input type="number" value={tt.price}
                                    onChange={(e) => updateTicketType(idx, 'price', e.target.value)}
                                    placeholder="5000" min="0"
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500">Capacity (0=unlimited)</label>
                                  <input type="number" value={tt.capacity}
                                    onChange={(e) => updateTicketType(idx, 'capacity', e.target.value)}
                                    placeholder="100" min="0"
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-gray-500">Seats per Ticket</label>
                                  <input type="number" value={tt.seatsPerTicket}
                                    onChange={(e) => updateTicketType(idx, 'seatsPerTicket', e.target.value)}
                                    placeholder="1" min="1"
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                                </div>
                              </div>
                              <div className="mt-2">
                                <label className="text-[10px] text-gray-500">Description</label>
                                <input type="text" value={tt.description}
                                  onChange={(e) => updateTicketType(idx, 'description', e.target.value)}
                                  placeholder="e.g., Includes VIP seating"
                                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" name="enableMultipleTickets"
                          checked={formData.enableMultipleTickets} onChange={handleChange}
                          className="text-[#1B3766] focus:ring-[#1B3766] rounded" />
                        <span className="text-sm text-gray-700">Allow multiple tickets per order</span>
                      </label>
                      {formData.enableMultipleTickets && (
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Max Tickets Per Order</label>
                          <input type="number" name="maxTicketsPerOrder" value={formData.maxTicketsPerOrder}
                            onChange={handleChange} min="1" max="100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!formData.isPaid && (
                  <p className="text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">Free events get instant registration.</p>
                )}
              </div>
            </div>

            {/* Capacity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaUsers className="text-[#1B3766]" />Capacity
              </h3>
              <input type="number" name="maxAttendees" value={formData.maxAttendees} onChange={handleChange}
                placeholder="Leave empty for unlimited"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
              <p className="text-xs text-gray-400 mt-1">0 means unlimited</p>
            </div>

            {/* Featured */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange}
                  className="text-yellow-500 focus:ring-yellow-500 rounded" />
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  {formData.featured ? <FaStar className="text-yellow-500" /> : <FaRegStar className="text-gray-400" />}
                  Feature this event
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-1 ml-6">Featured events appear at the top of event listings</p>
            </div>

            {/* Quick Preview */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Quick Preview</h3>
              <ul className="space-y-1 text-xs text-gray-500">
                <li>Title: {formData.title || "(Not set)"}</li>
                <li>Category: {formData.category || "(Not set)"} • {formData.eventType || "(Not set)"}</li>
                <li>Date: {formData.date || "(Not set)"} {formData.time ? `at ${formData.time}` : ""}</li>
                <li>Location: {formData.venue || formData.location || "(Not set)"}</li>
                <li>Price: {formData.isPaid ? (ticketTypes.length > 0 ? `${ticketTypes.length} ticket types` : `₦${Number(formData.price || 0).toLocaleString()}`) : "Free"}</li>
                <li>Images: {images.length}/10</li>
                <li>Speakers: {speakers.length}</li>
                <li>Featured: {formData.featured ? "Yes ⭐" : "No"}</li>
              </ul>
            </div>

            {/* Submit Button for Mobile */}
            <button type="button" onClick={handleSubmit} disabled={isCreating}
              className="w-full py-3 bg-[#1B3766] text-white rounded-lg font-medium hover:bg-[#142952] transition-all disabled:opacity-50 lg:hidden flex items-center justify-center gap-2">
              {isCreating ? (<><FaSpinner className="animate-spin" />Publishing...</>) : (<><FaSave />Publish Event</>)}
            </button>
          </div>
        </form>
      </div>
    </AdminSidebar>
  );
};

export default AdminAddEvent;