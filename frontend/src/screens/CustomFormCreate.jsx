// screens/CustomFormCreate.jsx - Drag & Drop Form Builder with Mobile Field Modal
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaPlus,
  FaTrashAlt,
  FaGripVertical,
  FaEye,
  FaSpinner,
  FaHeading,
  FaFont,
  FaAlignLeft,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaClock,
  FaLink,
  FaList,
  FaCheckSquare,
  FaDotCircle,
  FaUpload,
  FaStar,
  FaTable,
  FaMinus,
  FaCopy,
  FaPlay,
  FaChevronUp,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import { useCreateCustomFormMutation } from "../slices/customFormApiSlice";
import CustomFormSidebar from "../components/CustomFormSidebar";
import { toast } from "react-toastify";

const FaHashtag = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    width="1em"
    height="1em"
  >
    <path d="M20 14h-6.7l1.2-5H20v-2h-4.8l.7-3h-2l-.7 3h-5.5l.7-3h-2l-.7 3H4v2h5.5l-1.2 5H4v2h4.8l-.7 3h2l.7-3h5.5l-.7 3h2l.7-3H20v-2zm-8.5 0h5.5l1.2-5h-5.5l-1.2 5z" />
  </svg>
);

const FIELD_TYPES = [
  { type: "text", label: "Short Text", icon: FaFont, category: "basic" },
  {
    type: "textarea",
    label: "Long Text",
    icon: FaAlignLeft,
    category: "basic",
  },
  { type: "number", label: "Number", icon: FaHashtag, category: "basic" },
  { type: "email", label: "Email", icon: FaEnvelope, category: "basic" },
  { type: "phone", label: "Phone", icon: FaPhone, category: "basic" },
  { type: "date", label: "Date", icon: FaCalendarAlt, category: "basic" },
  { type: "time", label: "Time", icon: FaClock, category: "basic" },
  { type: "url", label: "URL", icon: FaLink, category: "basic" },
  { type: "select", label: "Dropdown", icon: FaList, category: "choice" },
  {
    type: "multiSelect",
    label: "Multi Select",
    icon: FaList,
    category: "choice",
  },
  { type: "radio", label: "Radio", icon: FaDotCircle, category: "choice" },
  {
    type: "checkbox",
    label: "Checkbox",
    icon: FaCheckSquare,
    category: "choice",
  },
  { type: "file", label: "File Upload", icon: FaUpload, category: "advanced" },
  { type: "rating", label: "Rating", icon: FaStar, category: "advanced" },
  { type: "scale", label: "Scale", icon: FaTable, category: "advanced" },
  { type: "heading", label: "Heading", icon: FaHeading, category: "layout" },
  {
    type: "paragraph",
    label: "Paragraph",
    icon: FaAlignLeft,
    category: "layout",
  },
  { type: "divider", label: "Divider", icon: FaMinus, category: "layout" },
];

const CustomFormCreate = () => {
  const navigate = useNavigate();
  const [createForm, { isLoading }] = useCreateCustomFormMutation();

  const [formTitle, setFormTitle] = useState("Untitled Form");
  const [formDescription, setFormDescription] = useState("");
  const [formType, setFormType] = useState("form");
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showMobileFieldModal, setShowMobileFieldModal] = useState(false);

  const addField = (fieldType) => {
    const typeConfig = FIELD_TYPES.find((t) => t.type === fieldType);
    const newField = {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: fieldType,
      label: typeConfig?.label || "New Field",
      placeholder: "",
      description: "",
      required: false,
      order: fields.length,
      options: ["select", "multiSelect", "radio", "checkbox"].includes(
        fieldType,
      )
        ? [{ label: "Option 1", value: "option_1" }]
        : [],
      width: "full",
    };
    setFields([...fields, newField]);
    setSelectedField(fields.length);
    setShowMobileFieldModal(false);
  };

  const removeField = (index) => {
    const updated = fields.filter((_, i) => i !== index);
    setFields(updated);
    if (selectedField === index) setSelectedField(null);
  };

  const duplicateField = (index) => {
    const field = {
      ...fields[index],
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };
    const updated = [...fields];
    updated.splice(index + 1, 0, field);
    setFields(updated);
  };

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  const addOption = (fieldIndex) => {
    const field = fields[fieldIndex];
    const updated = [...fields];
    updated[fieldIndex] = {
      ...field,
      options: [
        ...field.options,
        {
          label: `Option ${field.options.length + 1}`,
          value: `option_${field.options.length + 1}`,
        },
      ],
    };
    setFields(updated);
  };

  const updateOption = (fieldIndex, optionIndex, key, value) => {
    const updated = [...fields];
    updated[fieldIndex].options[optionIndex][key] = value;
    setFields(updated);
  };

  const removeOption = (fieldIndex, optionIndex) => {
    const updated = [...fields];
    updated[fieldIndex].options = updated[fieldIndex].options.filter(
      (_, i) => i !== optionIndex,
    );
    setFields(updated);
  };

  const moveField = (index, direction) => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;
    const updated = [...fields];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setFields(updated);
    setSelectedField(newIndex);
  };

  const handleDragStart = (index) => setDraggedIndex(index);
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...fields];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    setFields(updated);
    setDraggedIndex(index);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const handleSubmit = async (status = "draft") => {
    if (!formTitle.trim()) {
      toast.error("Please enter a form title");
      return;
    }
    try {
      const result = await createForm({
        title: formTitle.trim(),
        description: formDescription,
        type: formType,
        fields: fields.map((f, i) => ({ ...f, order: i })),
        status,
      }).unwrap();
      toast.success(
        status === "published" ? "Form published!" : "Form saved as draft",
      );
      navigate(`/custom-form/${result._id}`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create form");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomFormSidebar />
      <div className="lg:ml-[280px] p-4 md:p-6">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="text-lg font-bold text-gray-900 border-0 outline-none bg-transparent focus:ring-0"
              placeholder="Form Title"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${previewMode ? "bg-[#1B3766] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              <FaEye className="text-xs" /> {previewMode ? "Edit" : "Preview"}
            </button>
            <button
              onClick={() => handleSubmit("draft")}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <FaSave className="text-xs" /> Save Draft
            </button>
            <button
              onClick={() => handleSubmit("published")}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#1B3766] text-white rounded-lg text-sm font-medium hover:bg-[#142952] disabled:opacity-50"
            >
              {isLoading ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaPlay className="text-xs" />
              )}{" "}
              Publish
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Desktop Field Palette */}
          {!previewMode && (
            <div className="hidden xl:block w-[200px] flex-shrink-0">
              <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Add Fields
                </h3>
                {["basic", "choice", "advanced", "layout"].map((category) => (
                  <div key={category} className="mb-3">
                    <p className="text-[10px] font-medium text-gray-400 uppercase mb-1">
                      {category}
                    </p>
                    <div className="space-y-0.5">
                      {FIELD_TYPES.filter((f) => f.category === category).map(
                        (field) => (
                          <button
                            key={field.type}
                            onClick={() => addField(field.type)}
                            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-[#1B3766]/5 hover:text-[#1B3766] transition-colors text-left"
                          >
                            <field.icon className="text-gray-400 text-xs" />{" "}
                            {field.label}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Center */}
          <div className="flex-1 max-w-[650px] mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Form description (optional)..."
                rows={2}
                className="w-full text-sm text-gray-500 border-0 outline-none resize-none bg-transparent"
              />
              <div className="flex items-center gap-3 mt-2">
                <label className="text-xs text-gray-500">Type:</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                >
                  <option value="form">Form</option>
                  <option value="quiz">Quiz</option>
                  <option value="survey">Survey</option>
                  <option value="registration">Registration</option>
                </select>
              </div>
            </div>

            {previewMode ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {formTitle}
                </h2>
                {formDescription && (
                  <p className="text-sm text-gray-500 mb-6">
                    {formDescription}
                  </p>
                )}
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id}>
                      {field.type === "heading" ? (
                        <h3 className="text-lg font-semibold text-gray-900">
                          {field.label}
                        </h3>
                      ) : field.type === "paragraph" ? (
                        <p className="text-sm text-gray-600">{field.label}</p>
                      ) : field.type === "divider" ? (
                        <hr className="border-gray-200" />
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}{" "}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          {field.description && (
                            <p className="text-xs text-gray-400 mb-1">
                              {field.description}
                            </p>
                          )}
                          {["select", "multiSelect"].includes(field.type) ? (
                            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50">
                              <option>Select...</option>
                              {field.options?.map((opt, i) => (
                                <option key={i}>{opt.label}</option>
                              ))}
                            </select>
                          ) : ["radio", "checkbox"].includes(field.type) ? (
                            <div className="space-y-2">
                              {field.options?.map((opt, i) => (
                                <label
                                  key={i}
                                  className="flex items-center gap-2 text-sm text-gray-600"
                                >
                                  <input
                                    type={field.type}
                                    className="text-[#1B3766]"
                                  />{" "}
                                  {opt.label}
                                </label>
                              ))}
                            </div>
                          ) : field.type === "rating" ? (
                            <div className="flex gap-1">
                              {["★", "★", "★", "★", "★"].map((s, i) => (
                                <span key={i} className="text-gray-300 text-xl">
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : field.type === "file" ? (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-sm text-gray-400">
                              <FaUpload className="mx-auto mb-1" /> Click to
                              upload
                            </div>
                          ) : (
                            <input
                              type={
                                field.type === "textarea" ? "text" : field.type
                              }
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                              disabled
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {fields.length > 0 && (
                  <button className="mt-6 w-full py-2.5 bg-[#1B3766] text-white rounded-lg text-sm font-medium">
                    Submit
                  </button>
                )}
                {fields.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <FaPlus className="text-3xl mx-auto mb-2" />
                    <p>Add fields from the left panel</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-xl shadow-sm border transition-all ${selectedField === index ? "border-[#1B3766] ring-1 ring-[#1B3766]/20" : "border-gray-200"}`}
                  >
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      onClick={() =>
                        setSelectedField(selectedField === index ? null : index)
                      }
                    >
                      <FaGripVertical className="text-gray-300 cursor-grab" />
                      <span className="text-xs font-medium text-gray-400 uppercase w-16">
                        {FIELD_TYPES.find((t) => t.type === field.type)
                          ?.label || field.type}
                      </span>
                      <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                        {field.label}
                      </span>
                      {field.required && (
                        <span className="text-xs text-red-500">Req</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveField(index, "up");
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <FaChevronUp className="text-gray-400 text-xs" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveField(index, "down");
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <FaChevronDown className="text-gray-400 text-xs" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateField(index);
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-400"
                      >
                        <FaCopy className="text-xs" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeField(index);
                        }}
                        className="p-1 hover:bg-red-50 rounded text-red-500"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>
                    {selectedField === index && (
                      <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">
                              Label
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) =>
                                updateField(index, "label", e.target.value)
                              }
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={field.description}
                              onChange={(e) =>
                                updateField(
                                  index,
                                  "description",
                                  e.target.value,
                                )
                              }
                              placeholder="Optional helper text"
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Placeholder
                            </label>
                            <input
                              type="text"
                              value={field.placeholder}
                              onChange={(e) =>
                                updateField(
                                  index,
                                  "placeholder",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Width
                            </label>
                            <select
                              value={field.width}
                              onChange={(e) =>
                                updateField(index, "width", e.target.value)
                              }
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                            >
                              <option value="full">Full</option>
                              <option value="half">Half</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="flex items-center gap-2 text-sm text-gray-600">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) =>
                                  updateField(
                                    index,
                                    "required",
                                    e.target.checked,
                                  )
                                }
                                className="text-[#1B3766] rounded"
                              />{" "}
                              Required field
                            </label>
                          </div>
                        </div>
                        {[
                          "select",
                          "multiSelect",
                          "radio",
                          "checkbox",
                        ].includes(field.type) && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <label className="block text-xs text-gray-500 mb-2">
                              Options
                            </label>
                            <div className="space-y-1.5">
                              {field.options?.map((opt, oi) => (
                                <div
                                  key={oi}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="text"
                                    value={opt.label}
                                    onChange={(e) =>
                                      updateOption(
                                        index,
                                        oi,
                                        "label",
                                        e.target.value,
                                      )
                                    }
                                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                                  />
                                  <button
                                    onClick={() => removeOption(index, oi)}
                                    className="p-1 text-red-400 hover:text-red-600"
                                  >
                                    <FaTimes className="text-xs" />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => addOption(index)}
                              className="mt-2 text-xs text-[#1B3766] font-medium hover:underline"
                            >
                              + Add Option
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {fields.length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 border-dashed p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaPlus className="text-2xl text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Start Building Your Form
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add fields to get started
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {FIELD_TYPES.filter((f) => f.category === "basic").map(
                        (f) => (
                          <button
                            key={f.type}
                            onClick={() => addField(f.type)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-[#1B3766]/10 rounded-lg text-xs text-gray-600 hover:text-[#1B3766] transition-colors"
                          >
                            <f.icon className="text-sm" /> {f.label}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      {!previewMode && (
        <>
          <button
            onClick={() => setShowMobileFieldModal(true)}
            className="xl:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1B3766] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#142952] transition-colors"
          >
            <FaPlus className="text-xl" />
          </button>

          {/* Mobile Field Type Modal */}
          {showMobileFieldModal && (
            <div className="fixed inset-0 z-[70] flex items-end justify-center xl:hidden">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowMobileFieldModal(false)}
              />
              <div className="relative w-full bg-white rounded-t-2xl shadow-2xl animate-slideUp p-5 pb-8 max-h-[80vh] overflow-y-auto">
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add Field
                </h3>
                {["basic", "choice", "advanced", "layout"].map((category) => (
                  <div key={category} className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                      {category}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {FIELD_TYPES.filter((f) => f.category === category).map(
                        (field) => (
                          <button
                            key={field.type}
                            onClick={() => addField(field.type)}
                            className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 hover:bg-[#1B3766]/5 hover:text-[#1B3766] hover:border-[#1B3766]/30 transition-colors"
                          >
                            <field.icon className="text-gray-400 text-sm" />{" "}
                            {field.label}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setShowMobileFieldModal(false)}
                  className="w-full mt-3 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default CustomFormCreate;
