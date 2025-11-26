
// models/Interaction.js
import mongoose from 'mongoose';

const InteractionSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Blog reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, 
    },
    type: {
      type: String,
      // explicit allowed values to match your frontend
      enum: ['view', 'click', 'read', 'like', 'comment'], 
      required: [true, 'Interaction type is required'],
    },
    duration: {
      type: Number, 
      default: 0,
      min: [0, 'Duration cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ THE FIX: Explicitly check for string 'view'
InteractionSchema.post('save', async function () {
  try {
    const Blog = mongoose.model('Blog');
    const update = {};

    switch (this.type) {
      case 'view':
        update.$inc = { viewsCount: 1 };
        break;
      case 'click':
        update.$inc = { clicksCount: 1 };
        break;
      case 'read':
        update.$inc = { readsCount: 1, totalReadTime: this.duration };
        break;
    }

    if (Object.keys(update).length > 0) {
      await Blog.updateOne({ _id: this.blog }, update);
      console.log(`✅ SUCCESS: Incremented ${this.type} count for Blog ${this.blog}`);
    }
  } catch (err) {
    console.error("❌ Interaction Hook Error:", err);
  }
});

export default mongoose.models.Interaction || mongoose.model('Interaction', InteractionSchema);