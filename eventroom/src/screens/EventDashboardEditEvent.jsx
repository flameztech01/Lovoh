// screens/EventDashboardEditEvent.jsx – Redesigned with poster builder & modern UI
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaSave, FaCalendarAlt, FaClock, FaMapMarkerAlt,
  FaTag, FaDollarSign, FaImage, FaTrashAlt, FaPlus,
  FaEye, FaSpinner, FaStar, FaRegStar,
  FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaListUl, FaListOl, FaLink, FaHeading, FaQuoteRight, FaVideo,
  FaTicketAlt, FaTimes, FaUsers, FaUser, FaCamera,
  FaClipboardList, FaCheckSquare, FaDotCircle, FaFont, FaHashtag,
  FaCalendar, FaEnvelope, FaPhone, FaChevronDown, FaChevronUp,
  FaSyncAlt, FaExclamationCircle, FaPaintBrush, FaUserCircle,
  FaArrowsAlt, FaInfoCircle, FaMagic, FaPen,
} from 'react-icons/fa';
import {
  useGetEventByIdQuery,
  useUpdateEventMutation,
  useGetEventCustomFormQuery,
  useUpdateEventCustomFormMutation
} from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import EventDashboardSidebar from '../components/EventDashboardSidebar';

// ---- SAMPLE POSTER TEMPLATES (same as Create) ----
const SAMPLE_BACKGROUNDS = [
  { label: 'Modern Gradient', url: 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?auto=format&fit=crop&w=600&q=80' },
  { label: 'City Night', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80' },
  { label: 'Abstract Art', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
  { label: 'Minimal White', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80' },
];

const ToolbarButton = ({ onClick, active, icon: Icon, title }) => (
  <button type="button" onClick={onClick} title={title}
    className={`p-2 rounded hover:bg-blue-100 transition-colors ${active ? "bg-blue-200 text-[#1B3766]" : "text-gray-600"}`}>
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

const EventDashboardEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const { data: event, isLoading: isLoadingEvent } = useGetEventByIdQuery(id);
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const { data: customFormData, isLoading: isLoadingForm } = useGetEventCustomFormQuery(id);
  const [updateCustomForm, { isLoading: isUpdatingForm }] = useUpdateEventCustomFormMutation();

  const [description, setDescription] = useState("");
  const [showReloadInstruction, setShowReloadInstruction] = useState(false);
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, underline: false });
  const [previewMode, setPreviewMode] = useState(false);
  const [hasTicketTypes, setHasTicketTypes] = useState(false);
  const [enableMultipleTickets, setEnableMultipleTickets] = useState(false);

  // Custom form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFields, setFormFields] = useState([]);
  const [formChanged, setFormChanged] = useState(false);

  // ===== Poster template state (with drag & drop) =====
  const [posterTemplate, setPosterTemplate] = useState({
    image: '',
    photoPlaceholder: { x: 100, y: 150, width: 200, height: 200, borderRadius: 0 },
    namePlaceholder: { x: 100, y: 400, fontSize: 48, color: '#FFFFFF', fontFamily: 'Arial' },
  });
  const [posterImageFile, setPosterImageFile] = useState(null);
  const [posterImagePreview, setPosterImagePreview] = useState('');
  const [posterChanged, setPosterChanged] = useState(false);
  const [removePoster, setRemovePoster] = useState(false);
  const [selectedSample, setSelectedSample] = useState(0);

  // Drag & drop refs
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 1, height: 1 });
  const dragState = useRef({
    active: false,
    type: null,
    startX: 0,
    startY: 0,
    startElX: 0,
    startElY: 0,
    startW: 0,
    startH: 0,
    isResize: false,
  });

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

  const [existingImages, setExistingImages] = useState([]);
  const [imagesToKeep, setImagesToKeep] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [speakerFiles, setSpeakerFiles] = useState({});

  // Populate form – also load custom form and poster template
  useEffect(() => {
    if (event) {
      const eventDate = event.date ? new Date(event.date) : new Date();
      const dateStr = eventDate.toISOString().split('T')[0];
      let timeStr = event.time || "";
      if (!timeStr && event.date) timeStr = eventDate.toTimeString().slice(0, 5);

      setFormData({
        title: event.title || "", category: event.category || "", eventType: event.eventType || "",
        date: dateStr, time: timeStr, duration: event.duration || "",
        location: event.location || "", venue: event.venue || "",
        isVirtual: event.isVirtual || false, meetingLink: event.meetingLink || "",
        isPaid: event.isPaid || false, price: event.price || "",
        maxAttendees: event.maxAttendees || "", registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline).toISOString().split('T')[0] : "",
        featured: event.featured || false, tags: event.tags ? (Array.isArray(event.tags) ? event.tags.join(', ') : event.tags) : "",
        maxTicketsPerOrder: event.maxTicketsPerOrder || 10,
      });

      setDescription(event.description || "");

      if (event.ticketTypes && event.ticketTypes.length > 0) {
        setHasTicketTypes(true);
        setTicketTypes(event.ticketTypes);
      }
      if (event.enableMultipleTickets) setEnableMultipleTickets(true);

      if (event.images && event.images.length > 0) {
        setExistingImages(event.images);
        setImagesToKeep(event.images);
      }

      if (event.speakers && event.speakers.length > 0) {
        setSpeakers(event.speakers.map(s => ({ ...s, imagePreview: s.image || '' })));
      }

      // Load poster template (including borderRadius)
      if (event.posterTemplate && event.posterTemplate.image) {
        setPosterTemplate({
          image: event.posterTemplate.image,
          photoPlaceholder: event.posterTemplate.photoPlaceholder || { x: 100, y: 150, width: 200, height: 200, borderRadius: 0 },
          namePlaceholder: event.posterTemplate.namePlaceholder || { x: 100, y: 400, fontSize: 48, color: '#FFFFFF', fontFamily: 'Arial' },
        });
        setPosterImagePreview(event.posterTemplate.image);
        setRemovePoster(false);
        // Set natural size after loading image
        const img = new Image();
        img.onload = () => {
          setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.src = event.posterTemplate.image;
      } else {
        setPosterTemplate({
          image: '',
          photoPlaceholder: { x: 100, y: 150, width: 200, height: 200, borderRadius: 0 },
          namePlaceholder: { x: 100, y: 400, fontSize: 48, color: '#FFFFFF', fontFamily: 'Arial' },
        });
        setPosterImagePreview('');
        setRemovePoster(true);
        setImageNaturalSize({ width: 1, height: 1 });
      }
    }
  }, [event]);

  // Load custom form data
  useEffect(() => {
    if (customFormData && customFormData._id) {
      setFormTitle(customFormData.title || "");
      setFormDescription(customFormData.description || "");
      setFormFields(customFormData.fields || []);
    } else {
      setFormTitle("");
      setFormDescription("");
      setFormFields([]);
    }
  }, [customFormData]);

  // Track changes to form
  useEffect(() => {
    if (!customFormData) return;
    const originalFields = customFormData.fields ? JSON.stringify(customFormData.fields) : '[]';
    const currentFields = JSON.stringify(formFields);
    setFormChanged(
      formTitle !== (customFormData.title || "") ||
      formDescription !== (customFormData.description || "") ||
      originalFields !== currentFields
    );
  }, [formTitle, formDescription, formFields, customFormData]);

  // Set editor content after load + check if it appeared
  useEffect(() => {
    if (editorRef.current && event?.description && !isLoadingEvent) {
      editorRef.current.innerHTML = event.description;
      if (editorRef.current.innerHTML === '') {
        setShowReloadInstruction(true);
      } else {
        setShowReloadInstruction(false);
      }
    }
  }, [event, isLoadingEvent]);

  // ---------- Poster drag & drop helpers ----------
  const getImageCoords = (clientX, clientY) => {
    const imgRect = imageRef.current?.getBoundingClientRect();
    if (!imgRect) return null;
    const scaleX = imageNaturalSize.width / imgRect.width;
    const scaleY = imageNaturalSize.height / imgRect.height;
    const x = (clientX - imgRect.left) * scaleX;
    const y = (clientY - imgRect.top) * scaleY;
    return { x, y };
  };

  const startDrag = (e, type, isResize = false) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    if (clientX == null) return;
    const coords = getImageCoords(clientX, clientY);
    if (!coords) return;
    dragState.current = {
      active: true,
      type,
      isResize,
      startX: clientX,
      startY: clientY,
      startElX: type === 'photo' ? posterTemplate.photoPlaceholder.x : posterTemplate.namePlaceholder.x,
      startElY: type === 'photo' ? posterTemplate.photoPlaceholder.y : posterTemplate.namePlaceholder.y,
      startW: posterTemplate.photoPlaceholder.width,
      startH: posterTemplate.photoPlaceholder.height,
    };
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  };

  const onDragMove = (e) => {
    if (!dragState.current.active) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    if (clientX == null) return;
    const coords = getImageCoords(clientX, clientY);
    if (!coords) return;
    const { type, isResize, startX, startY, startElX, startElY, startW, startH } = dragState.current;
    const imgRect = imageRef.current?.getBoundingClientRect();
    if (!imgRect) return;
    const scaleX = imageNaturalSize.width / imgRect.width;
    const scaleY = imageNaturalSize.height / imgRect.height;
    const pixelDx = (clientX - startX) * scaleX;
    const pixelDy = (clientY - startY) * scaleY;

    if (isResize) {
      let newW = Math.max(30, startW + pixelDx);
      let newH = Math.max(30, startH + pixelDy);
      newW = Math.min(newW, imageNaturalSize.width - posterTemplate.photoPlaceholder.x);
      newH = Math.min(newH, imageNaturalSize.height - posterTemplate.photoPlaceholder.y);
      setPosterTemplate(prev => ({
        ...prev,
        photoPlaceholder: { ...prev.photoPlaceholder, width: newW, height: newH },
      }));
      setPosterChanged(true);
    } else {
      let newX = startElX + pixelDx;
      let newY = startElY + pixelDy;
      if (type === 'photo') {
        newX = Math.max(0, Math.min(newX, imageNaturalSize.width - posterTemplate.photoPlaceholder.width));
        newY = Math.max(0, Math.min(newY, imageNaturalSize.height - posterTemplate.photoPlaceholder.height));
        setPosterTemplate(prev => ({
          ...prev,
          photoPlaceholder: { ...prev.photoPlaceholder, x: newX, y: newY },
        }));
      } else {
        newX = Math.max(0, Math.min(newX, imageNaturalSize.width));
        newY = Math.max(0, Math.min(newY, imageNaturalSize.height));
        setPosterTemplate(prev => ({
          ...prev,
          namePlaceholder: { ...prev.namePlaceholder, x: newX, y: newY },
        }));
      }
      setPosterChanged(true);
    }
  };

  const onDragEnd = () => {
    dragState.current.active = false;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      document.removeEventListener('touchmove', onDragMove);
      document.removeEventListener('touchend', onDragEnd);
    };
  }, []);

  // ---------- Poster handlers ----------
  const handlePosterImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setPosterImageFile(file);
    setRemovePoster(false);
    setPosterChanged(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPosterImagePreview(reader.result);
      const img = new Image();
      img.onload = () => setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const applySampleBackground = (index) => {
    setSelectedSample(index);
    setPosterImagePreview(SAMPLE_BACKGROUNDS[index].url);
    setPosterImageFile(null);
    setRemovePoster(false);
    setPosterChanged(true);
    const img = new Image();
    img.onload = () => setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = SAMPLE_BACKGROUNDS[index].url;
  };

  const removePosterImage = () => {
    setPosterImageFile(null);
    setPosterImagePreview('');
    setPosterTemplate(prev => ({ ...prev, image: '' }));
    setRemovePoster(true);
    setPosterChanged(true);
    setImageNaturalSize({ width: 1, height: 1 });
  };

  const updatePhotoBorderRadius = (value) => {
    setPosterTemplate(prev => ({
      ...prev,
      photoPlaceholder: { ...prev.photoPlaceholder, borderRadius: Number(value) },
    }));
    setPosterChanged(true);
  };

  const updatePosterNamePlaceholder = (field, value) => {
    setPosterTemplate(prev => ({
      ...prev,
      namePlaceholder: { ...prev.namePlaceholder, [field]: field === 'color' ? value : (Number(value) || value) },
    }));
    setPosterChanged(true);
  };

  // Ticket Types
  const addTicketType = () => setTicketTypes([...ticketTypes, { name: '', price: '', capacity: '', seatsPerTicket: 1, description: '' }]);
  const removeTicketType = (index) => setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  const updateTicketType = (index, field, value) => {
    const updated = [...ticketTypes];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTypes(updated);
  };

  // Speakers
  const addSpeaker = () => setSpeakers([...speakers, { name: '', title: '', company: '', bio: '', image: '', imagePreview: '' }]);
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

  // Rich text
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

  const insertLink = () => { const url = prompt("Enter URL:"); if (url) execCommand("createLink", url); editorRef.current?.focus(); };
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
    const total = existingImages.length + newImages.length + files.length;
    if (total > 10) { toast.error(`Max 10. Currently: ${existingImages.length + newImages.length}`); return; }
    const vf = []; const pv = [];
    for (const f of files) {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} not an image`); continue; }
      if (f.size > 10*1024*1024) { toast.error(`${f.name} > 10MB`); continue; }
      vf.push(f);
      const r = new FileReader();
      r.onloadend = () => { pv.push(r.result); if (pv.length === vf.length) setNewImagePreviews(prev => [...prev, ...pv]); };
      r.readAsDataURL(f);
    }
    setNewImages(prev => [...prev, ...vf]);
  };

  const removeExistingImage = (i) => { const u = existingImages.filter((_, j) => j !== i); setExistingImages(u); setImagesToKeep(u); };
  const removeNewImage = (i) => { setNewImages(prev => prev.filter((_, j) => j !== i)); setNewImagePreviews(prev => prev.filter((_, j) => j !== i)); };

  // Custom form field handlers
  const addFormField = () => {
    const newField = {
      label: '',
      type: 'text',
      required: false,
      options: [],
      placeholder: '',
      order: formFields.length,
    };
    setFormFields([...formFields, newField]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error("Title required"); return; }
    if (!description || description === "<br>" || description.trim().length < 20) { toast.error("Description required"); return; }
    if (!formData.category) { toast.error("Category required"); return; }
    if (!formData.eventType) { toast.error("Event type required"); return; }
    if (!formData.date) { toast.error("Date required"); return; }
    if (!formData.time) { toast.error("Time required"); return; }
    if (!formData.location && !formData.venue) { toast.error("Location required"); return; }
    if (existingImages.length === 0 && newImages.length === 0) { toast.error("At least one image required"); return; }

    if (formData.isPaid && hasTicketTypes && ticketTypes.length > 0) {
      for (const tt of ticketTypes) {
        if (!tt.name?.trim()) { toast.error("Ticket types need a name"); return; }
        if (!tt.price || Number(tt.price) <= 0) { toast.error(`Price required for "${tt.name}"`); return; }
      }
    }

    const fd = new FormData();
    fd.append("title", formData.title.trim());
    fd.append("description", description);
    fd.append("category", formData.category);
    fd.append("eventType", formData.eventType);
    fd.append("date", formData.date);
    fd.append("time", formData.time);
    fd.append("duration", formData.duration || "");
    fd.append("location", formData.location || "");
    fd.append("venue", formData.venue || formData.location || "");
    fd.append("isVirtual", formData.isVirtual);
    fd.append("meetingLink", formData.meetingLink || "");
    fd.append("isPaid", formData.isPaid);
    fd.append("price", formData.isPaid && !hasTicketTypes ? formData.price : "0");
    fd.append("maxAttendees", formData.maxAttendees || "0");
    fd.append("featured", formData.featured);
    fd.append("tags", formData.tags || "");
    fd.append("enableMultipleTickets", enableMultipleTickets);
    fd.append("maxTicketsPerOrder", formData.maxTicketsPerOrder || 10);
    if (formData.registrationDeadline) fd.append("registrationDeadline", formData.registrationDeadline);
    if (imagesToKeep.length > 0) fd.append("keepImages", JSON.stringify(imagesToKeep));
    if (hasTicketTypes && ticketTypes.length > 0) fd.append("ticketTypes", JSON.stringify(ticketTypes));
    newImages.forEach(img => fd.append("images", img));

    // Speakers
    const speakersForSubmit = speakers.map(({ imagePreview, ...rest }) => ({ ...rest, image: rest.image || '' }));
    if (speakersForSubmit.length > 0) fd.append("speakers", JSON.stringify(speakersForSubmit));
    Object.entries(speakerFiles).forEach(([index, file]) => fd.append(`speakerImages[${index}]`, file));

    // ===== Poster template =====
    if (removePoster) {
      fd.append("posterTemplate", JSON.stringify({ image: '', photoPlaceholder: {}, namePlaceholder: {} }));
    } else if (posterChanged) {
      if (posterImageFile) {
        fd.append("posterImage", posterImageFile);
      }
      fd.append("posterTemplate", JSON.stringify({
        image: posterImageFile ? '' : posterTemplate.image,
        photoPlaceholder: posterTemplate.photoPlaceholder,
        namePlaceholder: posterTemplate.namePlaceholder,
      }));
    }

    try {
      await updateEvent({ id, formData: fd }).unwrap();
      toast.success("Event updated!");

      if (formChanged) {
        const formPayload = {
          title: formTitle,
          description: formDescription,
          fields: formFields.map(({ _id, ...rest }) => rest),
        };
        await updateCustomForm({ id, data: formPayload }).unwrap();
        toast.success("Registration form updated!");
      }

      navigate(`/dashboard/events/${id}`);
    } catch (err) {
      toast.error(err?.data?.message || "Update failed");
    }
  };

  if (isLoadingEvent || isLoadingForm) return (
    <EventDashboardSidebar>
      <div className="flex justify-center items-center h-96"><FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" /></div>
    </EventDashboardSidebar>
  );
  if (!event) return (
    <EventDashboardSidebar>
      <div className="text-center py-20"><h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
        <button onClick={() => navigate('/dashboard/events')} className="px-4 py-2 bg-[#1B3766] text-white rounded-lg">Back to My Events</button>
      </div>
    </EventDashboardSidebar>
  );

  return (
    <EventDashboardSidebar>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <button onClick={() => navigate(`/dashboard/events/${id}`)} className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-2 transition-colors text-sm">
                  <FaArrowLeft className="text-xs" /> Back to Event
                </button>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                  <FaMagic className="text-amber-300" /> Edit Event
                </h1>
                <p className="text-white/60 mt-1 text-sm">Update your event details</p>
              </div>
              <button onClick={handleSubmit} disabled={isUpdating || isUpdatingForm} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-300 text-gray-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                <FaSave /> {(isUpdating || isUpdatingForm) ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        <form className="grid lg:grid-cols-5 gap-6" onSubmit={(e) => e.preventDefault()}>
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition-all hover:shadow-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Give your event a clear, compelling title..." className="w-full px-4 py-3 text-lg font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700">Event Description <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => setPreviewMode(!previewMode)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${previewMode ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}><FaEye className="text-xs" /> {previewMode ? "Editing" : "Preview"}</button>
              </div>
              {!previewMode && (
                <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 rounded-t-xl border border-gray-200 border-b-0">
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
                <div className="min-h-[200px] p-4 border border-gray-200 rounded-b-xl bg-white prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <div ref={editorRef} contentEditable suppressContentEditableWarning
                  className="min-h-[200px] p-4 border border-gray-200 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 leading-relaxed"
                  onInput={(e) => setDescription(e.currentTarget.innerHTML)}
                  onKeyUp={updateActiveFormats} onMouseUp={updateActiveFormats} />
              )}
              {showReloadInstruction && (
                <div className="mt-3 flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <FaExclamationCircle className="text-yellow-500" />
                  <span>Description didn't load? <button type="button" onClick={() => window.location.reload()} className="underline text-blue-600 font-medium inline-flex items-center gap-1"><FaSyncAlt className="text-xs" /> Reload the page</button></span>
                </div>
              )}
            </div>

            {/* Date & Time */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaCalendarAlt className="text-blue-600" /> Date & Time <span className="text-red-500">*</span></h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Time</label><input type="time" name="time" value={formData.time} onChange={handleChange} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Duration</label><input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 2 hours" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaMapMarkerAlt className="text-blue-600" /> Location <span className="text-red-500">*</span></h3>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">Venue</label><input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g., Eko Convention Centre" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
                  <div><label className="block text-xs font-medium text-gray-600 mb-1">City / Address</label><input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Victoria Island, Lagos" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isVirtual" checked={formData.isVirtual} onChange={handleChange} className="text-blue-600 rounded" /><span className="text-sm text-gray-700"><FaVideo className="inline text-blue-500 mr-1" />Virtual / Online Event</span></label>
                {formData.isVirtual && <div><label className="block text-xs font-medium text-gray-600 mb-1">Meeting Link</label><input type="url" name="meetingLink" value={formData.meetingLink} onChange={handleChange} placeholder="https://meet.google.com/xxx" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>}
              </div>
            </div>

            {/* Speakers */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><FaUser className="text-blue-600" /> Speakers & Hosts</h3>
                <button type="button" onClick={addSpeaker} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"><FaPlus /> Add Speaker</button>
              </div>
              {speakers.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No speakers added yet</p>
              ) : (
                <div className="space-y-4">
                  {speakers.map((speaker, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Speaker {idx + 1}</h4>
                        <button type="button" onClick={() => removeSpeaker(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><FaTrashAlt className="text-xs" /></button>
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs text-gray-500 mb-2">Photo</label>
                        <div className="flex items-center gap-4">
                          {speaker.imagePreview ? (
                            <div className="relative group">
                              <img src={speaker.imagePreview} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-blue-200" />
                              <button type="button" onClick={() => removeSpeakerImage(idx)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><FaTimes className="text-[10px]" /></button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300"><FaUser className="text-2xl text-gray-400" /></div>
                          )}
                          <label className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"><FaCamera className="text-xs" />{speaker.imagePreview ? 'Change' : 'Upload'}</div>
                            <input type="file" accept="image/*" onChange={(e) => handleSpeakerImageSelect(idx, e)} className="hidden" />
                          </label>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div><label className="block text-xs text-gray-500 mb-1">Name</label><input type="text" value={speaker.name} onChange={(e) => updateSpeaker(idx, 'name', e.target.value)} placeholder="Full name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Title/Role</label><input type="text" value={speaker.title} onChange={(e) => updateSpeaker(idx, 'title', e.target.value)} placeholder="e.g., CEO" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                        <div><label className="block text-xs text-gray-500 mb-1">Company</label><input type="text" value={speaker.company} onChange={(e) => updateSpeaker(idx, 'company', e.target.value)} placeholder="Company name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      </div>
                      <div className="mt-3"><label className="block text-xs text-gray-500 mb-1">Bio</label><textarea value={speaker.bio} onChange={(e) => updateSpeaker(idx, 'bio', e.target.value)} placeholder="Brief bio..." rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Registration Deadline */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Deadline</label>
              <input type="date" name="registrationDeadline" value={formData.registrationDeadline} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              <p className="text-xs text-gray-400 mt-1">If not set, registration closes on event date</p>
            </div>

            {/* Custom Form Builder */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><FaClipboardList className="text-blue-600" /> Custom Registration Form</h3>
              </div>
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-md flex items-start gap-2 text-sm">
                <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-800">Default fields already included</p>
                  <p className="text-blue-700 text-xs">Collect extra info from attendees (e.g., dietary preferences).</p>
                </div>
              </div>
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
                          <button type="button" onClick={() => moveFieldUp(idx)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><FaChevronUp className="text-xs" /></button>
                          <button type="button" onClick={() => moveFieldDown(idx)} disabled={idx === formFields.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><FaChevronDown className="text-xs" /></button>
                          <button type="button" onClick={() => removeFormField(idx)} className="p-1 text-red-500 hover:bg-red-50 rounded"><FaTrashAlt className="text-xs" /></button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2"><label className="block text-[10px] text-gray-500 mb-0.5">Label *</label><input type="text" value={field.label} onChange={(e) => updateFormField(idx, 'label', e.target.value)} placeholder="e.g., How did you hear?" className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs" /></div>
                        <div><label className="block text-[10px] text-gray-500 mb-0.5">Type</label><select value={field.type} onChange={(e) => updateFormField(idx, 'type', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs">{FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}</select></div>
                        <div className="flex items-end"><label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={field.required || false} onChange={(e) => updateFormField(idx, 'required', e.target.checked)} className="text-blue-600 rounded w-3.5 h-3.5" /><span className="text-xs text-gray-600">Required</span></label></div>
                        {['dropdown', 'checkbox', 'radio'].includes(field.type) && (
                          <div className="col-span-2">
                            <label className="block text-[10px] text-gray-500 mb-1">Options</label>
                            {field.options?.map((opt, oi) => (
                              <div key={oi} className="flex items-center gap-1 mb-1">
                                <input type="text" value={opt} onChange={(e) => updateOption(idx, oi, e.target.value)} placeholder={`Option ${oi+1}`} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" />
                                <button type="button" onClick={() => removeOption(idx, oi)} className="text-red-500"><FaTimes className="text-xs" /></button>
                              </div>
                            ))}
                            <button type="button" onClick={() => addOption(idx)} className="text-xs text-blue-600 underline">+ Add option</button>
                          </div>
                        )}
                        {!['dropdown', 'checkbox', 'radio'].includes(field.type) && (
                          <div className="col-span-2"><label className="block text-[10px] text-gray-500 mb-0.5">Placeholder</label><input type="text" value={field.placeholder || ''} onChange={(e) => updateFormField(idx, 'placeholder', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs" /></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <button type="button" onClick={addFormField} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-blue-500 hover:text-blue-500 transition-colors"><FaPlus className="inline mr-1 text-xs" /> Add Field</button>
              </div>
            </div>

            {/* ===== POSTER DESIGNER – redesigned with samples & preview ===== */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                  <FaPaintBrush className="text-lg" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">"I'm Attending" Poster</h3>
                  <p className="text-xs text-gray-500">Create a shareable poster for attendees to show they're coming</p>
                </div>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Preview */}
                <div className="relative bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  {posterImagePreview && !removePoster ? (
                    <div className="relative" style={{ userSelect: 'none' }}>
                      <img
                        ref={imageRef}
                        src={posterImagePreview}
                        alt="Poster template"
                        className="w-full h-auto"
                        draggable={false}
                        onLoad={(e) => {
                          const img = e.target;
                          setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
                        }}
                      />
                      {/* Photo placeholder */}
                      <div
                        className="absolute border-2 border-blue-500 bg-blue-500/20 cursor-move flex items-center justify-center text-blue-600 text-xs font-semibold"
                        style={{
                          left: `${(posterTemplate.photoPlaceholder.x / imageNaturalSize.width) * 100}%`,
                          top: `${(posterTemplate.photoPlaceholder.y / imageNaturalSize.height) * 100}%`,
                          width: `${(posterTemplate.photoPlaceholder.width / imageNaturalSize.width) * 100}%`,
                          height: `${(posterTemplate.photoPlaceholder.height / imageNaturalSize.height) * 100}%`,
                          borderRadius: `${posterTemplate.photoPlaceholder.borderRadius || 0}px`,
                        }}
                        onMouseDown={(e) => startDrag(e, 'photo', false)}
                        onTouchStart={(e) => startDrag(e, 'photo', false)}
                      >
                        <FaCamera className="mr-1" /> Photo
                        <div
                          className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize rounded-bl-none rounded-tr-none"
                          onMouseDown={(e) => { e.stopPropagation(); startDrag(e, 'photo', true); }}
                          onTouchStart={(e) => { e.stopPropagation(); startDrag(e, 'photo', true); }}
                        >
                          <FaArrowsAlt className="text-white text-[10px] absolute bottom-0.5 right-0.5" />
                        </div>
                      </div>
                      {/* Name placeholder */}
                      <div
                        className="absolute cursor-move font-bold"
                        style={{
                          left: `${(posterTemplate.namePlaceholder.x / imageNaturalSize.width) * 100}%`,
                          top: `${(posterTemplate.namePlaceholder.y / imageNaturalSize.height) * 100}%`,
                          color: posterTemplate.namePlaceholder.color,
                          fontSize: `${(posterTemplate.namePlaceholder.fontSize / imageNaturalSize.height) * 100}vh`,
                          fontFamily: posterTemplate.namePlaceholder.fontFamily,
                          whiteSpace: 'nowrap',
                        }}
                        onMouseDown={(e) => startDrag(e, 'name', false)}
                        onTouchStart={(e) => startDrag(e, 'name', false)}
                      >
                        <FaPen className="mr-1 inline" /> Your Name
                        <div className="absolute top-0 left-0 w-full h-full border-2 border-green-500 bg-green-500/10 -z-10" />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center text-gray-400 flex-col p-8">
                      <FaImage className="text-4xl mb-2" />
                      <p>Select a background</p>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
                    <FaArrowsAlt className="text-[10px]" /> Drag to position
                  </div>
                </div>

                {/* Controls */}
                <div>
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-600 mb-2">Background</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {SAMPLE_BACKGROUNDS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applySampleBackground(idx)}
                          className={`w-12 h-12 rounded-lg border-2 overflow-hidden ${selectedSample === idx ? 'border-blue-500 shadow-md' : 'border-gray-200'}`}
                        >
                          <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <label className="cursor-pointer">
                        <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-blue-500 transition-colors">
                          <FaPlus className="text-gray-400" />
                        </div>
                        <input type="file" accept="image/*" onChange={handlePosterImageSelect} className="hidden" />
                      </label>
                    </div>
                    <p className="text-[10px] text-gray-400">Choose a sample or upload your own background</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Name Font Size</label>
                      <input type="number" value={posterTemplate.namePlaceholder.fontSize} onChange={(e) => updatePosterNamePlaceholder('fontSize', e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Name Color</label>
                      <input type="color" value={posterTemplate.namePlaceholder.color} onChange={(e) => updatePosterNamePlaceholder('color', e.target.value)} className="w-full h-8 p-0 border border-gray-200 rounded" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Font Family</label>
                      <select value={posterTemplate.namePlaceholder.fontFamily} onChange={(e) => updatePosterNamePlaceholder('fontFamily', e.target.value)} className="w-full px-2 py-1 border border-gray-200 rounded text-xs">
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Verdana">Verdana</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-0.5">Photo Border Radius (px)</label>
                      <input type="number" value={posterTemplate.photoPlaceholder.borderRadius || 0} onChange={(e) => updatePhotoBorderRadius(e.target.value)} min="0" max="200" className="w-full px-2 py-1 border border-gray-200 rounded text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaImage className="text-blue-600" /> Event Images <span className="text-red-500">*</span> <span className="text-xs text-gray-400 font-normal">({existingImages.length + newImages.length}/10)</span></h3>
              {(existingImages.length + newImages.length) < 10 && (
                <label className="block w-full cursor-pointer mb-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                    <FaPlus className="text-2xl text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Click to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (Max 10MB each)</p>
                    <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                  </div>
                </label>
              )}
              {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                <div className="grid grid-cols-2 gap-2">
                  {existingImages.map((img, idx) => (
                    <div key={`e-${idx}`} className="relative group">
                      <img src={img} alt="" className="w-full h-28 object-cover rounded-lg border border-gray-200" />
                      <button onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><FaTrashAlt className="text-[10px]" /></button>
                      {idx === 0 && <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">Cover</span>}
                    </div>
                  ))}
                  {newImagePreviews.map((p, idx) => (
                    <div key={`n-${idx}`} className="relative group">
                      <img src={p} alt="" className="w-full h-28 object-cover rounded-lg border border-gray-200" />
                      <button onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"><FaTrashAlt className="text-[10px]" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category & Type */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaTag className="text-blue-600" /> Category & Type</h3>
              <div className="space-y-4">
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Category <span className="text-red-500">*</span></label><select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"><option value="">Select category</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="block text-xs font-medium text-gray-600 mb-1">Event Type <span className="text-red-500">*</span></label><select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"><option value="">Select type</option>{eventTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., tech, startup, AI (comma separated)" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            {/* Tickets & Pricing */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaTicketAlt className="text-blue-600" /> Tickets & Pricing</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isPaid" checked={formData.isPaid} onChange={handleChange} className="text-blue-600 rounded" /><span className="text-sm text-gray-700 font-medium">This is a paid event</span></label>
                {formData.isPaid && <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={hasTicketTypes} onChange={(e) => setHasTicketTypes(e.target.checked)} className="text-blue-600 rounded" /><span className="text-sm text-gray-700">Enable multiple ticket types</span></label>}
                {formData.isPaid && !hasTicketTypes && <div><label className="block text-xs font-medium text-gray-600 mb-1">Ticket Price (₦)</label><input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="5000" min="100" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>}
                {hasTicketTypes && (
                  <div className="space-y-3">
                    {ticketTypes.map((tt, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2"><span className="text-xs font-semibold text-gray-700">Type #{i+1}</span><button onClick={() => removeTicketType(i)} className="text-red-500"><FaTimes className="text-xs" /></button></div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2"><label className="block text-[10px] text-gray-500">Name *</label><input type="text" value={tt.name} onChange={(e) => updateTicketType(i, 'name', e.target.value)} placeholder="VIP" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
                          <div><label className="block text-[10px] text-gray-500">Price (₦) *</label><input type="number" value={tt.price} onChange={(e) => updateTicketType(i, 'price', e.target.value)} placeholder="5000" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs" /></div>
                          <div><label className="block text-[10px] text-gray-500">Capacity</label><input type="number" value={tt.capacity} onChange={(e) => updateTicketType(i, 'capacity', e.target.value)} placeholder="0" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs" /></div>
                          <div><label className="block text-[10px] text-gray-500">Seats/Ticket</label><input type="number" value={tt.seatsPerTicket} onChange={(e) => updateTicketType(i, 'seatsPerTicket', e.target.value)} min="1" className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs" /></div>
                          <div className="col-span-2"><label className="block text-[10px] text-gray-500">Description</label><input type="text" value={tt.description} onChange={(e) => updateTicketType(i, 'description', e.target.value)} className="w-full px-2.5 py-1.5 border border-gray-200 rounded text-xs" /></div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addTicketType} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-blue-500"><FaPlus className="inline mr-1 text-xs" /> Add Ticket Type</button>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Purchase Options */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Ticket Purchase Options</h3>
              <label className="flex items-center gap-2 cursor-pointer mb-3"><input type="checkbox" checked={enableMultipleTickets} onChange={(e) => setEnableMultipleTickets(e.target.checked)} className="text-blue-600 rounded" /><span className="text-sm text-gray-700">Allow multiple tickets per order</span></label>
              {enableMultipleTickets && <div><label className="block text-xs font-medium text-gray-600 mb-1">Max Per Order</label><input type="number" name="maxTicketsPerOrder" value={formData.maxTicketsPerOrder} onChange={handleChange} min="1" max="100" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" /></div>}
            </div>

            {/* Capacity */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaUsers className="text-blue-600" /> Capacity</h3>
              <input type="number" name="maxAttendees" value={formData.maxAttendees} onChange={handleChange} placeholder="Unlimited" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
            </div>

            {/* Featured */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="text-yellow-500 rounded" /><span className="text-sm font-medium text-gray-700">{formData.featured ? <FaStar className="inline text-yellow-500 mr-1" /> : <FaRegStar className="inline text-gray-400 mr-1" />}Feature this event</span></label>
            </div>
          </div>
        </form>
      </div>
    </EventDashboardSidebar>
  );
};

export default EventDashboardEditEvent;