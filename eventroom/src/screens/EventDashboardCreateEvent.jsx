// screens/EventDashboardCreateEvent.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft, FaSave, FaCalendarAlt, FaClock, FaMapMarkerAlt,
  FaTag, FaDollarSign, FaImage, FaTrashAlt, FaPlus,
  FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaListUl, FaListOl, FaLink, FaHeading, FaEye, FaQuoteRight,
  FaVideo, FaTicketAlt, FaTimes, FaUsers, FaUser, FaCamera,
  FaClipboardList, FaCheckSquare, FaDotCircle, FaFont, FaHashtag,
  FaCalendar, FaEnvelope, FaPhone, FaChevronDown, FaChevronUp,
} from "react-icons/fa";
import { useCreateEventMutation } from "../slices/eventApiSlice";
import { toast } from "react-toastify";
import EventDashboardSidebar from "../components/EventDashboardSidebar";

const ToolbarButton = ({ onClick, active, icon: Icon, title }) => (
  <button type="button" onClick={onClick} title={title}
    className={`p-2 rounded hover:bg-gray-200 transition-colors ${active ? "bg-gray-200 text-[#1B3766]" : "text-gray-600"}`}>
    <Icon className="text-sm" />
  </button>
);

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: FaFont },
  { value: 'textarea', label: 'Long Text', icon: FaAlignLeft },
  { value: 'number', label: 'Number', icon: FaHashtag },
  { value: 'email', label: 'Email', icon: FaEnvelope },
  { value: 'phone', label: 'Phone', icon: FaPhone },
  { value: 'date', label: 'Date', icon: FaCalendar },
  { value: 'dropdown', label: 'Dropdown', icon: FaChevronDown },
  { value: 'checkbox', label: 'Checkbox', icon: FaCheckSquare },
  { value: 'radio', label: 'Radio', icon: FaDotCircle },
];

const EventDashboardCreateEvent = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();

  const [description, setDescription] = useState("");
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false });
  const [previewMode, setPreviewMode] = useState(false);
  const [hasTicketTypes, setHasTicketTypes] = useState(false);
  const [enableMultipleTickets, setEnableMultipleTickets] = useState(false);

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
    registrationDeadline: "", featured: false, tags: "", maxTicketsPerOrder: 10,
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [speakerFiles, setSpeakerFiles] = useState({});

  // Custom form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFields, setFormFields] = useState([]);

  // ---------- Ticket Types ----------
  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: '', capacity: '', seatsPerTicket: 1, description: '' }]);
  };
  const removeTicketType = (index) => setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  const updateTicketType = (index, field, value) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  // ---------- Speakers ----------
  const addSpeaker = () => {
    setSpeakers([...speakers, { name: '', title: '', company: '', bio: '', imagePreview: '' }]);
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
  };

  // ---------- Rich text helpers ----------
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    updateActiveFormats();
    editorRef.current?.focus();
  };
  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  };
  const insertHeading = (level) => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      const heading = document.createElement(`h${level}`);
      heading.style.marginBottom = "8px"; heading.style.fontWeight = "bold"; heading.style.lineHeight = "1.4";
      if (level === 1) heading.style.fontSize = "24px";
      if (level === 2) heading.style.fontSize = "20px";
      if (level === 3) heading.style.fontSize = "16px";
      heading.textContent = selection.toString();
      range.deleteContents(); range.insertNode(heading);
    }
    editorRef.current?.focus();
  };
  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) execCommand("createLink", url);
    editorRef.current?.focus();
  };
  const insertQuote = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      const blockquote = document.createElement("blockquote");
      blockquote.style.borderLeft = "3px solid #1B3766"; blockquote.style.paddingLeft = "16px";
      blockquote.style.margin = "12px 0"; blockquote.style.color = "#4B5563"; blockquote.style.fontStyle = "italic";
      blockquote.textContent = selection.toString();
      range.deleteContents(); range.insertNode(blockquote);
    }
    editorRef.current?.focus();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 10 - images.length;
    if (files.length > remainingSlots) { toast.error(`Only ${remainingSlots} more image(s). Max 10.`); return; }
    const newImages = []; const newPreviews = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) { toast.error(`${file.name} is not an image`); continue; }
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} is larger than 10MB`); continue; }
      newImages.push(file);
      const reader = new FileReader();
      reader.onloadend = () => { newPreviews.push(reader.result); if (newPreviews.length === newImages.length) setImagePreviews(prev => [...prev, ...newPreviews]); };
      reader.readAsDataURL(file);
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ---------- Custom form field handlers ----------
  const addFormField = () => {
    setFormFields([...formFields, {
      label: '',
      type: 'text',
      required: false,
      options: [],
      placeholder: '',
      order: formFields.length,
    }]);
  };
  const removeFormField = (index) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };
  const updateFormField = (index, key, value) => {
    const updated = [...formFields];
    updated[index] = { ...updated[index], [key]: value };
    if (key === 'type' && !['dropdown', 'checkbox', 'radio'].includes(value)) {
      updated[index].options = [];
    }
    setFormFields(updated);
  };
  const addOption = (fieldIndex) => {
    const updated = [...formFields];
    updated[fieldIndex].options = [...(updated[fieldIndex].options || []), ''];
    setFormFields(updated);
  };
  const updateOption = (fieldIndex, optionIndex, value) => {
    const updated = [...formFields];
    updated[fieldIndex].options[optionIndex] = value;
    setFormFields(updated);
  };
  const removeOption = (fieldIndex, optionIndex) => {
    const updated = [...formFields];
    updated[fieldIndex].options.splice(optionIndex, 1);
    setFormFields(updated);
  };

  // NEW – reorder functions
  const moveFieldUp = (index) => {
    if (index === 0) return;
    const updated = [...formFields];
    [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    setFormFields(updated);
  };

  const moveFieldDown = (index) => {
    if (index === formFields.length - 1) return;
    const updated = [...formFields];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setFormFields(updated);
  };

  // ---------- Form submission ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic checks
    if (!formData.title.trim()) { toast.error("Event title is required"); return; }
    if (!description || description === "<br>" || description.trim().length < 20) { toast.error("Please add a detailed event description"); return; }
    if (!formData.category) { toast.error("Category is required"); return; }
    if (!formData.eventType) { toast.error("Event type is required"); return; }
    if (!formData.date) { toast.error("Event date is required"); return; }
    if (!formData.time) { toast.error("Event time is required"); return; }

    // Location validation: only required if NOT virtual
    if (!formData.isVirtual) {
      if (!formData.location.trim() && !formData.venue.trim()) {
        toast.error("Location is required for in‑person events");
        return;
      }
    }

    if (images.length === 0) { toast.error("At least one event image is required"); return; }

    // Price validation for paid events
    if (formData.isPaid) {
      if (hasTicketTypes && ticketTypes.length > 0) {
        for (const tt of ticketTypes) {
          if (!tt.name.trim()) { toast.error("All ticket types must have a name"); return; }
          if (!tt.price || Number(tt.price) <= 0) { toast.error(`Price is required for "${tt.name}" ticket type`); return; }
        }
      } else if (!formData.price || Number(formData.price) <= 0) {
        toast.error("Please set a valid ticket price"); return;
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

    // Location handling for virtual events
    if (formData.isVirtual) {
      submitData.append("location", formData.location?.trim() || formData.venue?.trim() || "Online");
      submitData.append("venue", formData.venue?.trim() || formData.location?.trim() || "Online");
    } else {
      submitData.append("location", formData.location?.trim() || formData.venue?.trim() || "");
      submitData.append("venue", formData.venue?.trim() || formData.location?.trim() || "");
    }

    submitData.append("isVirtual", formData.isVirtual);
    submitData.append("meetingLink", formData.meetingLink || "");
    submitData.append("isPaid", formData.isPaid);
    submitData.append("price", formData.isPaid && !hasTicketTypes ? formData.price : "0");
    submitData.append("maxAttendees", formData.maxAttendees || "0");
    submitData.append("featured", formData.featured);
    submitData.append("tags", formData.tags || "");
    submitData.append("enableMultipleTickets", enableMultipleTickets);
    submitData.append("maxTicketsPerOrder", formData.maxTicketsPerOrder || 10);

    if (formData.registrationDeadline) {
      submitData.append("registrationDeadline", formData.registrationDeadline);
    }

    if (hasTicketTypes && ticketTypes.length > 0) {
      submitData.append("ticketTypes", JSON.stringify(ticketTypes));
    }

    // Speakers
    const speakersForSubmit = speakers.map(({ imagePreview, ...rest }) => ({ ...rest, image: '' }));
    if (speakersForSubmit.length > 0) {
      submitData.append("speakers", JSON.stringify(speakersForSubmit));
    }
    Object.entries(speakerFiles).forEach(([index, file]) => {
      submitData.append(`speakerImages[${index}]`, file);
    });

    // Custom Form (if fields exist)
    if (formFields.length > 0) {
      submitData.append("customForm", JSON.stringify({
        title: formTitle || 'Additional Information',
        description: formDescription || '',
        fields: formFields,
      }));
    }

    images.forEach(img => submitData.append("images", img));

    try {
      await createEvent(submitData).unwrap();
      toast.success("Event created successfully!");
      navigate("/dashboard/events");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create event");
    }
  };

  return (
    <EventDashboardSidebar>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <button onClick={() => navigate("/dashboard/events")} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-2 transition-colors text-sm">
              <FaArrowLeft className="text-xs" /> Back to My Events
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Event</h1>
            <p className="text-gray-500 mt-1 text-sm">Fill in the details below to publish your event</p>
          </div>
          <button onClick={handleSubmit} disabled={isCreating} className="flex items-center gap-2 px-6 py-2.5 bg-[#1B3766] text-white rounded-lg font-medium hover:bg-[#142952] transition-all disabled:opacity-50">
            <FaSave /> {isCreating ? "Publishing..." : "Publish Event"}
          </button>
        </div>

        <form className="grid lg:grid-cols-5 gap-6" onSubmit={(e) => e.preventDefault()}>
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange}
                placeholder="Give your event a clear, compelling title..."
                className="w-full px-4 py-3 text-lg font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">Event Description <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${previewMode ? "bg-[#1B3766] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  <FaEye className="text-xs" /> {previewMode ? "Editing" : "Preview"}
                </button>
              </div>
              {!previewMode && (
                <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 rounded-t-lg border border-gray-200 border-b-0">
                  <ToolbarButton onClick={() => execCommand("bold")} active={activeFormats.bold} icon={FaBold} title="Bold" />
                  <ToolbarButton onClick={() => execCommand("italic")} active={activeFormats.italic} icon={FaItalic} title="Italic" />
                  <ToolbarButton onClick={() => execCommand("underline")} active={activeFormats.underline} icon={FaUnderline} title="Underline" />
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
                <div className="min-h-[300px] p-4 border border-gray-200 rounded-b-lg bg-white prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <div ref={editorRef} contentEditable suppressContentEditableWarning
                  className="min-h-[300px] p-4 border border-gray-200 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-gray-700 leading-relaxed"
                  onInput={(e) => setDescription(e.currentTarget.innerHTML)}
                  onKeyUp={updateActiveFormats} onMouseUp={updateActiveFormats} />
              )}
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaCalendarAlt className="text-[#1B3766]" /> Date & Time <span className="text-red-500">*</span></h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Time</label><input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Duration</label><input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 2 hours" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" /></div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaMapMarkerAlt className="text-[#1B3766]" /> Location <span className={`${!formData.isVirtual ? 'text-red-500' : 'text-gray-400'} text-xs`}> {formData.isVirtual ? '(optional)' : '*'}</span></h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Venue</label><input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g., Eko Convention Centre" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">City / Address</label><input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Victoria Island, Lagos" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" /></div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isVirtual" checked={formData.isVirtual} onChange={handleChange} className="text-[#1B3766] rounded" /><span className="text-sm text-gray-700"><FaVideo className="inline text-blue-500 mr-1" />Virtual / Online Event</span></label>
                {formData.isVirtual && <div><label className="block text-xs font-medium text-gray-600 mb-1">Meeting Link</label><input type="url" name="meetingLink" value={formData.meetingLink} onChange={handleChange} placeholder="https://meet.google.com/xxx" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" /></div>}
              </div>
            </div>

            {/* Speakers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><FaUser className="text-[#1B3766]" /> Speakers</h3>
                <button type="button" onClick={addSpeaker} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#1B3766] text-white rounded-lg hover:bg-[#142952] transition-colors"><FaPlus /> Add Speaker</button>
              </div>
              {speakers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No speakers added yet</p>
              ) : (
                <div className="space-y-4">
                  {speakers.map((speaker, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Speaker {idx + 1}</h4>
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
                        <div><label className="block text-xs text-gray-500 mb-1">Name</label><input type="text" value={speaker.name} onChange={(e) => updateSpeaker(idx, 'name', e.target.value)} placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Title/Role</label><input type="text" value={speaker.title} onChange={(e) => updateSpeaker(idx, 'title', e.target.value)} placeholder="e.g., CEO" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Company</label><input type="text" value={speaker.company} onChange={(e) => updateSpeaker(idx, 'company', e.target.value)} placeholder="Company name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                      </div>
                      <div className="mt-3"><label className="block text-xs text-gray-500 mb-1">Bio</label><textarea value={speaker.bio} onChange={(e) => updateSpeaker(idx, 'bio', e.target.value)} placeholder="Brief bio..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Registration Deadline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Deadline</label>
              <input type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
              <p className="text-xs text-gray-400 mt-1">If not set, registration closes on event date</p>
            </div>

            {/* Custom Registration Form Builder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><FaClipboardList className="text-[#1B3766]" /> Custom Registration Form</h3>
                {/* Top add field button removed */}
              </div>
              <p className="text-xs text-gray-500 mb-4">Collect extra info from attendees (e.g., "What do you hope to learn?"). These questions will appear during registration.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Form Title</label>
                  <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g., Extra Details" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Form Description</label>
                  <input type="text" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Optional instructions" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>

                {formFields.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No fields added yet.</p>
                ) : (
                  formFields.map((field, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700">Field {idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveFieldUp(idx)} disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Move up">
                            <FaChevronUp className="text-xs" />
                          </button>
                          <button type="button" onClick={() => moveFieldDown(idx)} disabled={idx === formFields.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Move down">
                            <FaChevronDown className="text-xs" />
                          </button>
                          <button type="button" onClick={() => removeFormField(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><FaTrashAlt className="text-xs" /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] text-gray-500 mb-0.5">Label *</label>
                          <input type="text" value={field.label} onChange={(e) => updateFormField(idx, 'label', e.target.value)} placeholder="e.g., How did you hear about us?" className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-0.5">Type</label>
                          <select value={field.type} onChange={(e) => updateFormField(idx, 'type', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs">
                            {FIELD_TYPES.map(ft => (
                              <option key={ft.value} value={ft.value}>{ft.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end mb-1">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input type="checkbox" checked={field.required || false} onChange={(e) => updateFormField(idx, 'required', e.target.checked)} className="text-[#1B3766] rounded w-3.5 h-3.5" />
                            <span className="text-xs text-gray-600">Required</span>
                          </label>
                        </div>
                        {['dropdown', 'checkbox', 'radio'].includes(field.type) && (
                          <div className="col-span-2">
                            <label className="block text-[10px] text-gray-500 mb-1">Options</label>
                            {field.options?.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-1 mb-1">
                                <input type="text" value={opt} onChange={(e) => updateOption(idx, optIdx, e.target.value)} placeholder={`Option ${optIdx + 1}`} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" />
                                <button type="button" onClick={() => removeOption(idx, optIdx)} className="text-red-500"><FaTimes className="text-xs" /></button>
                              </div>
                            ))}
                            <button type="button" onClick={() => addOption(idx)} className="text-xs text-[#1B3766] underline">+ Add option</button>
                          </div>
                        )}
                        {!['dropdown', 'checkbox', 'radio'].includes(field.type) && (
                          <div className="col-span-2">
                            <label className="block text-[10px] text-gray-500 mb-0.5">Placeholder</label>
                            <input type="text" value={field.placeholder || ''} onChange={(e) => updateFormField(idx, 'placeholder', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {/* Add Field button placed at the bottom */}
                <button type="button" onClick={addFormField} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-[#1B3766] hover:text-[#1B3766] transition-colors">
                  <FaPlus className="inline mr-1 text-xs" /> Add Field
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaImage className="text-[#1B3766]" /> Event Images <span className="text-red-500">*</span> <span className="text-xs text-gray-400 font-normal">({images.length}/10)</span></h3>
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
                      <img src={preview} alt="" className="w-full h-28 object-cover rounded-lg border border-gray-200" />
                      <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><FaTrashAlt className="text-[10px]" /></button>
                      {index === 0 && <span className="absolute bottom-1 left-1 bg-[#1B3766] text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category & Type */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaTag className="text-[#1B3766]" /> Category & Type</h3>
              <div className="space-y-4">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Category <span className="text-red-500">*</span></label><select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm"><option value="">Select category</option>{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Event Type <span className="text-red-500">*</span></label><select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm"><option value="">Select type</option>{eventTypes.map(type => <option key={type} value={type}>{type}</option>)}</select></div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., tech, startup, AI (comma separated)" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
            </div>

            {/* Tickets & Pricing */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaTicketAlt className="text-[#1B3766]" /> Tickets & Pricing</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleChange} className="text-[#1B3766] rounded" /><span className="text-sm text-gray-700 font-medium">This is a paid event</span></label>

                {formData.isPaid && (
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={hasTicketTypes} onChange={(e) => setHasTicketTypes(e.target.checked)} className="text-[#1B3766] rounded" /><span className="text-sm text-gray-700">Enable multiple ticket types</span></label>
                )}

                {formData.isPaid && !hasTicketTypes && (
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Ticket Price (₦) <span className="text-red-500">*</span></label><input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="e.g., 5000" min="100" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" /></div>
                )}

                {hasTicketTypes && (
                  <div className="space-y-3">
                    {ticketTypes.map((tt, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-gray-700">Type #{index + 1}</span><button type="button" onClick={() => removeTicketType(index)} className="text-red-500"><FaTimes className="text-xs" /></button></div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2"><label className="text-[10px] text-gray-500">Name *</label><input type="text" value={tt.name} onChange={(e) => updateTicketType(index, 'name', e.target.value)} placeholder="VIP" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3766]" /></div>
                          <div><label className="text-[10px] text-gray-500">Price (₦) *</label><input type="number" value={tt.price} onChange={(e) => updateTicketType(index, 'price', e.target.value)} placeholder="5000" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs" /></div>
                          <div><label className="text-[10px] text-gray-500">Capacity</label><input type="number" value={tt.capacity} onChange={(e) => updateTicketType(index, 'capacity', e.target.value)} placeholder="0=unlimited" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs" /></div>
                          <div><label className="text-[10px] text-gray-500">Seats/Ticket</label><input type="number" value={tt.seatsPerTicket} onChange={(e) => updateTicketType(index, 'seatsPerTicket', e.target.value)} min="1" placeholder="1" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs" /></div>
                          <div className="col-span-2"><label className="text-[10px] text-gray-500">Description</label><input type="text" value={tt.description} onChange={(e) => updateTicketType(index, 'description', e.target.value)} placeholder="Short description" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs" /></div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addTicketType} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-[#1B3766] hover:text-[#1B3766]"><FaPlus className="inline mr-1 text-xs" /> Add Ticket Type</button>
                  </div>
                )}
              </div>
            </div>

            {/* Multiple Tickets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Ticket Purchase Options</h3>
              <label className="flex items-center gap-2 cursor-pointer mb-3"><input type="checkbox" checked={enableMultipleTickets} onChange={(e) => setEnableMultipleTickets(e.target.checked)} className="text-[#1B3766] rounded" /><span className="text-sm text-gray-700">Allow buying multiple tickets per order</span></label>
              {enableMultipleTickets && <div><label className="block text-xs font-medium text-gray-600 mb-1">Max Tickets Per Order</label><input type="number" name="maxTicketsPerOrder" value={formData.maxTicketsPerOrder} onChange={handleChange} min="1" max="100" placeholder="10" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" /></div>}
            </div>

            {/* Capacity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaUsers className="text-[#1B3766]" /> Capacity</h3>
              <input type="number" name="maxAttendees" value={formData.maxAttendees} onChange={handleChange} placeholder="Leave empty for unlimited" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" />
              <p className="text-xs text-gray-400 mt-1">0 means unlimited</p>
            </div>

            <button type="button" onClick={handleSubmit} disabled={isCreating} className="w-full py-3 bg-[#1B3766] text-white rounded-lg font-medium hover:bg-[#142952] transition-all disabled:opacity-50 lg:hidden">
              {isCreating ? "Publishing..." : "Publish Event"}
            </button>
          </div>
        </form>
      </div>
    </EventDashboardSidebar>
  );
};

export default EventDashboardCreateEvent;