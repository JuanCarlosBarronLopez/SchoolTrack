import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    minlength: [5, 'El título debe tener al menos 5 caracteres'],
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },

  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },

  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, 'El resumen no puede exceder 500 caracteres']
  },

  content: {
    type: String,
    required: [true, 'El contenido es requerido'],
    minlength: [10, 'El contenido debe tener al menos 10 caracteres']
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  category: {
    type: String,
    enum: {
      values: ['seguridad', 'noticias', 'actualizaciones', 'tips', 'eventos', 'otro'],
      message: 'Categoría no válida'
    },
    default: 'noticias'
  },

  tags: [{
    type: String,
    trim: true
  }],

  image: {
    type: String,
    trim: true
  },

  imageAlt: {
    type: String,
    trim: true
  },

  published: {
    type: Boolean,
    default: false
  },

  publishedAt: {
    type: Date,
    default: null
  },

  views: {
    type: Number,
    default: 0,
    min: 0
  },

  comments: [{
    userId: mongoose.Schema.Types.ObjectId,
    userName: String,
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    approved: {
      type: Boolean,
      default: false
    }
  }],

  featured: {
    type: Boolean,
    default: false
  },

  seoTitle: {
    type: String,
    maxlength: [60, 'Máximo 60 caracteres']
  },

  seoDescription: {
    type: String,
    maxlength: [160, 'Máximo 160 caracteres']
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices
blogPostSchema.index({ published: 1, publishedAt: -1 });
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ author: 1 });
blogPostSchema.index({ tags: 1 });

// Pre-save middleware para generar slug
blogPostSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  this.updatedAt = new Date();
  next();
});

// Método para publicar
blogPostSchema.methods.publish = function() {
  this.published = true;
  this.publishedAt = new Date();
  return this.save();
};

// Método para incrementar vistas
blogPostSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Método para obtener comentarios aprobados
blogPostSchema.methods.getApprovedComments = function() {
  return this.comments.filter(c => c.approved === true);
};

// Método para convertir a JSON seguro (sin datos sensibles)
blogPostSchema.methods.toJSON = function() {
  const obj = this.toObject();
  return obj;
};

// Virtuals
blogPostSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

blogPostSchema.virtual('approvedCommentsCount').get(function() {
  return this.comments.filter(c => c.approved).length;
});

export default mongoose.model('BlogPost', blogPostSchema);
