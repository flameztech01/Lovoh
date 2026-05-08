// adminScreen/AdminEditEvent.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaSave, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTag,
  FaDollarSign, FaUsers, FaImage, FaTrashAlt, FaPlus, FaEye, FaSpinner,
  FaStar, FaRegStar, FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter,
  FaAlignRight, FaListUl, FaListOl, FaLink, FaHeading, FaQuoteRight, FaVideo,
  FaTimes, FaLayerGroup, FaUser, FaMinus, FaCamera,
} from 'react-icons/fa';
import { useGetEventByIdQuery, useUpdateEventMutation } from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const ToolbarButton = ({ onClick, icon: Icon, title }) => (
  <button type="button" onClick={onClick} title={title}
    className="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors">
    <Icon className="text-sm" />
  </button>
);

const AdminEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const { data: event, isLoading: isLoadingEvent } = useGetEventByIdQuery(id);
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

  const [description, setDescription] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

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
    title: "", category: "", eventType: "", date: "", time: "",
    duration: "", location: "", venue: "", isVirtual: false,
    meetingLink: "", isPaid: false, price: "", maxAttendees: "",
    registrationDeadline: "", featured: false, tags: "",
    enableMultipleTickets: false, maxTicketsPerOrder: "10",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [imagesToKeep, setImagesToKeep] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [speakerFiles, setSpeakerFiles] = useState({});

  // Load event data
  useEffect(() => {
    if (event) {
      const eventDate = event.date ? new Date(event.date) : new Date();
      const dateStr = eventDate.toISOString().split('T')[0];
      let timeStr = event.time || "";
      if (!timeStr && event.date) timeStr = eventDate.toTimeString().slice(0, 5);

      setFormData({
        title: event.title || "", category: event.category || "",
        eventType: event.eventType || "", date: dateStr, time: timeStr,
        duration: event.duration || "", location: event.location || "",
        venue: event.venue || "", isVirtual: event.isVirtual || false,
        meetingLink: event.meetingLink || "", isPaid: event.isPaid || false,
        price: event.price || "", maxAttendees: event.maxAttendees || "",
        registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : "",
        featured: event.featured || false,
        tags: event.tags ? (Array.isArray(event.tags) ? event.tags.join(', ') : event.tags) : "",
        enableMultipleTickets: event.enableMultipleTickets || false,
        maxTicketsPerOrder: event.maxTicketsPerOrder || "10",
      });

      const desc = event.description || "";
      setDescription(desc);

      if (event.images && event.images.length > 0) {
        setExistingImages(event.images);
        setImagesToKeep(event.images);
      }
      if (event.ticketTypes && event.ticketTypes.length > 0) {
        setTicketTypes(event.ticketTypes);
      }
      if (event.speakers && event.speakers.length > 0) {
        setSpeakers(event.speakers.map(s => ({ ...s, imagePreview: s.image || '' })));
      }
    }
  }, [event]);

  // Set editor content when editor is ready and description is loaded
  const setEditorContent = useCallback(() => {
    if (editorRef.current && description && !editorReady) {
      editorRef.current.innerHTML = description;
      setEditorReady(true);
    }
  }, [description, editorReady]);

  useEffect(() => {
    setEditorContent();
  }, [setEditorContent]);

  const execCommand = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) setDescription(editorRef.current.innerHTML);
  }, []);

  const insertHeading = (level) => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const heading = document.createElement(`h${level}`);
      heading.style.marginBottom = "8px";
      heading.style.fontWeight = "bold";
      if (level === 1) heading.style.fontSize = "24px";
      if (level === 2) heading.style.fontSize = "20px";
      if (level === 3) heading.style.fontSize = "16px";
      heading.textContent = selection.toString();
      range.deleteContents();
      range.insertNode(heading);
      if (editorRef.current) setDescription(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      document.execCommand("createLink", false, url);
      if (editorRef.current) setDescription(editorRef.current.innerHTML);
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
      if (editorRef.current) setDescription(editorRef.current.innerHTML);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleEditorInput = (e) => {
    setDescription(e.currentTarget.innerHTML);
  };

  // Image handlers
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length + newImageFiles.length + files.length;
    if (total > 10) {
      toast.error(`Max 10 images. Currently ${existingImages.length + newImageFiles.length}.`);
      return;
    }
    const validFiles = [], previews = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} too large`); continue; }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) setNewImagePreviews(prev => [...prev, ...previews]);
      };
      reader.readAsDataURL(file);
    }
    setNewImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeExistingImage = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
    setImagesToKeep(updated);
  };

  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Ticket types
  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: '', capacity: '', description: '', seatsPerTicket: 1, soldCount: 0 }]);
  };
  const removeTicketType = (index) => setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  const updateTicketType = (index, field, value) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  // Speakers
  const addSpeaker = () => {
    setSpeakers([...speakers, { name: '', title: '', company: '', bio: '', image: '', imagePreview: '' }]);
  };
  const removeSpeaker = (index) => {
    setSpeakerFiles(prev => {
      const updated = { ...prev };
      delete updated[index];
      const reindexed = {};
      Object.keys(updated).sort((a, b) => Number(a) - Number(b)).forEach((key, i) => { reindexed[i] = updated[key]; });
      return reindexed;
    });
    setSpeakers(speakers.filter((_, i) => i !== index));
  };
  const updateSpeaker = (index, field, value) => {
    const updated = [...speakers];
    updated[index] = { ...updated[index], [field]: value };
    setSpeakers(updated);
  };
  const handleSpeakerImageSelect = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Invalid image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }
    setSpeakerFiles(prev => ({ ...prev, [index]: file }));
    const reader = new FileReader();
    reader.onloadend = () => updateSpeaker(index, 'imagePreview', reader.result);
    reader.readAsDataURL(file);
  };
  const removeSpeakerImage = (index) => {
    setSpeakerFiles(prev => { const u = { ...prev }; delete u[index]; return u; });
    updateSpeaker(index, 'imagePreview', '');
    updateSpeaker(index, 'image', '');
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) { toast.error("Title required"); return; }
    const textContent = editorRef.current?.textContent?.trim() || '';
    if (!description || description === "<br>" || textContent.length < 20) {
      toast.error("Description required (min 20 chars)"); return;
    }
    if (!formData.category) { toast.error("Category required"); return; }
    if (!formData.eventType) { toast.error("Event type required"); return; }
    if (!formData.date) { toast.error("Date required"); return; }
    if (!formData.time) { toast.error("Time required"); return; }
    if (!formData.location && !formData.venue) { toast.error("Location required"); return; }
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      toast.error("At least one image required"); return;
    }
    if (formData.isPaid && ticketTypes.length > 0) {
      for (const tt of ticketTypes) {
        if (!tt.name.trim()) { toast.error("All ticket types need a name"); return; }
        if (!tt.price || Number(tt.price) <= 0) { toast.error(`Price required for "${tt.name}"`); return; }
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
    if (formData.registrationDeadline) submitData.append("registrationDeadline", formData.registrationDeadline);
    if (imagesToKeep.length > 0) submitData.append("keepImages", JSON.stringify(imagesToKeep));
    newImageFiles.forEach(img => submitData.append("images", img));
    if (ticketTypes.length > 0) submitData.append("ticketTypes", JSON.stringify(ticketTypes));
    
    const speakersForSubmit = speakers.map(({ imagePreview, ...rest }) => ({
      ...rest,
      image: rest.image || ''
    }));
    if (speakersForSubmit.length > 0) submitData.append("speakers", JSON.stringify(speakersForSubmit));
    Object.entries(speakerFiles).forEach(([index, file]) => submitData.append(`speakerImages[${index}]`, file));

    try {
      await updateEvent({ id, formData: submitData }).unwrap();
      toast.success("Event updated!");
      navigate("/admin/events");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update event");
    }
  };

  if (isLoadingEvent) {
    return (
      <AdminSidebar>
        <div className="flex justify-center items-center min-h-[60vh]">
          <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" />
        </div>
      </AdminSidebar>
    );
  }

  if (!event) {
    return (
      <AdminSidebar>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <button onClick={() => navigate('/admin/events')} className="px-4 py-2 bg-[#1B3766] text-white rounded-lg">Back to Events</button>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <button onClick={() => navigate("/admin/events")} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-2 text-sm">
              <FaArrowLeft className="text-xs" /> Back to Events
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Event</h1>
            <p className="text-gray-500 mt-1 text-sm">{event.title}</p>
          </div>
          <button onClick={handleSubmit} disabled={isUpdating}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1B3766] text-white rounded-lg font-medium hover:bg-[#142952] transition-all disabled:opacity-50">
            {isUpdating ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save Changes</>}
          </button>
        </div>

        <form className="grid lg:grid-cols-5 gap-6" onSubmit={(e) => e.preventDefault()}>
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                className="w-full px-4 py-3 text-lg font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${previewMode ? "bg-[#1B3766] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  <FaEye className="text-xs" /> {previewMode ? "Edit" : "Preview"}
                </button>
              </div>
              {!previewMode && (
                <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 rounded-t-lg border border-gray-200 border-b-0">
                  <ToolbarButton onClick={() => execCommand("bold")} icon={FaBold} title="Bold" />
                  <ToolbarButton onClick={() => execCommand("italic")} icon={FaItalic} title="Italic" />
                  <ToolbarButton onClick={() => execCommand("underline")} icon={FaUnderline} title="Underline" />
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <ToolbarButton onClick={() => execCommand("justifyLeft")} icon={FaAlignLeft} title="Left" />
                  <ToolbarButton onClick={() => execCommand("justifyCenter")} icon={FaAlignCenter} title="Center" />
                  <ToolbarButton onClick={() => execCommand("justifyRight")} icon={FaAlignRight} title="Right" />
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <ToolbarButton onClick={() => execCommand("insertUnorderedList")} icon={FaListUl} title="Bullets" />
                  <ToolbarButton onClick={() => execCommand("insertOrderedList")} icon={FaListOl} title="Numbers" />
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <ToolbarButton onClick={() => insertHeading(2)} icon={FaHeading} title="Heading" />
                  <ToolbarButton onClick={insertQuote} icon={FaQuoteRight} title="Quote" />
                  <ToolbarButton onClick={insertLink} icon={FaLink} title="Link" />
                </div>
              )}
              {previewMode ? (
                <div className="min-h-[300px] p-4 border border-gray-200 rounded-b-lg bg-white prose prose-sm max-w-none overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: description || '<p class="text-gray-400">No content</p>' }} />
              ) : (
                <div ref={editorRef} contentEditable suppressContentEditableWarning
                  className="min-h-[300px] p-4 border border-gray-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-gray-700 leading-relaxed overflow-y-auto"
                  onInput={handleEditorInput} onBlur={handleEditorInput}
                  data-placeholder="Describe your event in detail..." />
              )}
              <style jsx>{`[contenteditable]:empty:before { content: attr(data-placeholder); color: #9CA3AF; pointer-events: none; }`}</style>
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4"><FaCalendarAlt className="inline text-[#1B3766] mr-2" />Date & Time <span className="text-red-500">*</span></h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><label className="block text-xs text-gray-600 mb-1">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                <div><label className="block text-xs text-gray-600 mb-1">Time</label><input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                <div><label className="block text-xs text-gray-600 mb-1">Duration</label><input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 2 hours" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" /></div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4"><FaMapMarkerAlt className="inline text-[#1B3766] mr-2" />Location <span className="text-red-500">*</span></h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs text-gray-600 mb-1">Venue</label><input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g., Eko Convention Centre" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                  <div><label className="block text-xs text-gray-600 mb-1">City/Address</label><input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Victoria Island, Lagos" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isVirtual" checked={formData.isVirtual} onChange={handleChange} className="text-[#1B3766] rounded" />
                  <span className="text-sm text-gray-700"><FaVideo className="inline text-blue-500 mr-1" />Virtual Event</span>
                </label>
                {formData.isVirtual && (
                  <div><label className="block text-xs text-gray-600 mb-1">Meeting Link</label><input type="url" name="meetingLink" value={formData.meetingLink} onChange={handleChange} placeholder="https://meet.google.com/xxx" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" /></div>
                )}
              </div>
            </div>

            {/* Speakers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900"><FaUser className="inline text-[#1B3766] mr-2" />Speakers</h3>
                <button type="button" onClick={addSpeaker} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-[#1B3766] text-white rounded-lg hover:bg-[#142952]"><FaPlus /> Add</button>
              </div>
              {speakers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No speakers</p>
              ) : (
                <div className="space-y-4">
                  {speakers.map((speaker, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium">Speaker {idx + 1}</h4>
                        <button type="button" onClick={() => removeSpeaker(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><FaTrashAlt className="text-xs" /></button>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs text-gray-500 mb-2">Photo</label>
                        <div className="flex items-center gap-4">
                          {speaker.imagePreview ? (
                            <div className="relative group">
                              <img src={speaker.imagePreview} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                              <button type="button" onClick={() => removeSpeakerImage(idx)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><FaTimes className="text-[10px]" /></button>
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300"><FaUser className="text-2xl text-gray-400" /></div>
                          )}
                          <label className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"><FaCamera className="text-xs" />{speaker.imagePreview ? 'Change' : 'Upload'}</div>
                            <input type="file" accept="image/*" onChange={(e) => handleSpeakerImageSelect(idx, e)} className="hidden" />
                          </label>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div><label className="block text-xs text-gray-500 mb-1">Name</label><input type="text" value={speaker.name} onChange={(e) => updateSpeaker(idx, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Title</label><input type="text" value={speaker.title} onChange={(e) => updateSpeaker(idx, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Company</label><input type="text" value={speaker.company} onChange={(e) => updateSpeaker(idx, 'company', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                      </div>
                      <div className="mt-3"><label className="block text-xs text-gray-500 mb-1">Bio</label><textarea value={speaker.bio} onChange={(e) => updateSpeaker(idx, 'bio', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Registration Deadline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Deadline</label>
              <input type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3"><FaImage className="inline text-[#1B3766] mr-2" />Images ({existingImages.length + newImageFiles.length}/10)</h3>
              {(existingImages.length + newImageFiles.length) < 10 && (
                <label className="block w-full cursor-pointer mb-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1B3766]"><FaPlus className="text-xl text-gray-400 mx-auto mb-1" /><p className="text-xs text-gray-600">Add Images</p></div>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </label>
              )}
              <div className="grid grid-cols-2 gap-2">
                {existingImages.map((img, idx) => (
                  <div key={`e-${idx}`} className="relative group">
                    <img src={img} alt="" className="w-full h-28 object-cover rounded-lg border" />
                    <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><FaTrashAlt className="text-[10px]" /></button>
                  </div>
                ))}
                {newImagePreviews.map((preview, idx) => (
                  <div key={`n-${idx}`} className="relative group">
                    <img src={preview} alt="" className="w-full h-28 object-cover rounded-lg border" />
                    <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><FaTrashAlt className="text-[10px]" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Category & Type */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4"><FaTag className="inline text-[#1B3766] mr-2" />Category & Type</h3>
              <div className="space-y-4">
                <div><label className="block text-xs text-gray-600 mb-1">Category *</label><select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"><option value="">Select</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                <div><label className="block text-xs text-gray-600 mb-1">Event Type *</label><select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm"><option value="">Select</option>{eventTypes.map(type => <option key={type} value={type}>{type}</option>)}</select></div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., tech, startup (comma separated)" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>

            {/* Pricing & Ticket Types */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4"><FaDollarSign className="inline text-[#1B3766] mr-2" />Pricing & Tickets</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleChange} className="text-[#1B3766] rounded" />
                  <span className="text-sm font-medium">Paid event</span>
                </label>
                {formData.isPaid && (
                  <>
                    {ticketTypes.length === 0 && (
                      <div><label className="block text-xs text-gray-600 mb-1">Price (₦) *</label><input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="5000" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" /></div>
                    )}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium"><FaLayerGroup className="inline text-[#1B3766] mr-1" />Ticket Types</h4>
                        <button type="button" onClick={addTicketType} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-[#1B3766] text-white rounded-lg"><FaPlus /> Add</button>
                      </div>
                      {ticketTypes.map((tt, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 border mb-2">
                          <div className="flex justify-between mb-2"><h5 className="text-xs font-medium">Type {idx + 1}</h5><button type="button" onClick={() => removeTicketType(idx)} className="p-1 text-red-500"><FaMinus className="text-[10px]" /></button></div>
                          <div className="grid grid-cols-2 gap-2">
                            <div><label className="text-[10px] text-gray-500">Name *</label><input type="text" value={tt.name} onChange={(e) => updateTicketType(idx, 'name', e.target.value)} placeholder="VIP" className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" /></div>
                            <div><label className="text-[10px] text-gray-500">Price (₦) *</label><input type="number" value={tt.price} onChange={(e) => updateTicketType(idx, 'price', e.target.value)} placeholder="5000" className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" /></div>
                            <div><label className="text-[10px] text-gray-500">Capacity</label><input type="number" value={tt.capacity} onChange={(e) => updateTicketType(idx, 'capacity', e.target.value)} placeholder="100" className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" /></div>
                            <div><label className="text-[10px] text-gray-500">Seats/Ticket</label><input type="number" value={tt.seatsPerTicket} onChange={(e) => updateTicketType(idx, 'seatsPerTicket', e.target.value)} placeholder="1" className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" /></div>
                          </div>
                          <div className="mt-2"><label className="text-[10px] text-gray-500">Description</label><input type="text" value={tt.description} onChange={(e) => updateTicketType(idx, 'description', e.target.value)} placeholder="Includes VIP seating" className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs" /></div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input type="checkbox" name="enableMultipleTickets" checked={formData.enableMultipleTickets} onChange={handleChange} className="text-[#1B3766] rounded" />
                        <span className="text-sm">Allow multiple tickets per order</span>
                      </label>
                      {formData.enableMultipleTickets && (
                        <div><label className="block text-xs text-gray-600 mb-1">Max Per Order</label><input type="number" name="maxTicketsPerOrder" value={formData.maxTicketsPerOrder} onChange={handleChange} min="1" max="100" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Capacity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3"><FaUsers className="inline text-[#1B3766] mr-2" />Capacity</h3>
              <input type="number" name="maxAttendees" value={formData.maxAttendees} onChange={handleChange} placeholder="0 = unlimited" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm" />
            </div>

            {/* Featured */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="text-yellow-500 rounded" />
                <span className="text-sm font-medium">{formData.featured ? <FaStar className="inline text-yellow-500 mr-1" /> : <FaRegStar className="inline text-gray-400 mr-1" />}Feature this event</span>
              </label>
            </div>

            <button type="button" onClick={handleSubmit} disabled={isUpdating}
              className="w-full py-3 bg-[#1B3766] text-white rounded-lg font-medium hover:bg-[#142952] transition-all disabled:opacity-50 lg:hidden">
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </AdminSidebar>
  );
};

export default AdminEditEvent;