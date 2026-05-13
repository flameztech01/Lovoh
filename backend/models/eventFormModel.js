import mongoose from 'mongoose';

const fieldSchema = mongoose.Schema({
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'textarea', 'number', 'dropdown', 'checkbox', 'radio', 'date', 'email', 'phone'],
    required: true,
  },
  required: { type: Boolean, default: false },
  options: [{ type: String }], // used for dropdown, radio, checkbox
  placeholder: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const eventFormSchema = mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true, // one form per event
    },
    title: { type: String, default: 'Additional Information' },
    description: { type: String, default: '' },
    fields: [fieldSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

eventFormSchema.index({ event: 1 });

const EventForm = mongoose.model('EventForm', eventFormSchema);
export default EventForm;