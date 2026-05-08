import BlogPost from '../models/BlogPost.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Obtener todos los posts publicados
 * @route   GET /api/blog
 * @access  Public
 */
export const getAllBlogPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, featured } = req.query;
  const skip = (page - 1) * limit;

  const filter = { published: true };
  if (category) filter.category = category;
  if (featured === 'true') filter.featured = true;

  const posts = await BlogPost.find(filter)
    .populate('author', 'firstName lastName avatar email')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await BlogPost.countDocuments(filter);

  res.json({
    success: true,
    data: posts,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      limit: Number(limit)
    }
  });
});

/**
 * @desc    Obtener post por ID o slug
 * @route   GET /api/blog/:id
 * @access  Public
 */
export const getBlogPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await BlogPost.findOne({
    $or: [
      { _id: id },
      { slug: id }
    ]
  }).populate('author', 'firstName lastName avatar email');

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post no encontrado'
    });
  }

  // Incrementar vistas solo si es public
  if (post.published) {
    await post.incrementViews();
  }

  res.json({
    success: true,
    data: post
  });
});

/**
 * @desc    Crear nuevo post (Admin solo)
 * @route   POST /api/blog
 * @access  Private/Admin
 */
export const createBlogPost = asyncHandler(async (req, res) => {
  const { title, excerpt, content, category, tags, image, imageAlt, seoTitle, seoDescription, featured } = req.body;

  const post = new BlogPost({
    title,
    excerpt,
    content,
    category,
    tags: tags || [],
    image,
    imageAlt,
    seoTitle,
    seoDescription,
    featured: featured || false,
    author: req.user._id
  });

  await post.save();

  await post.populate('author', 'firstName lastName avatar email');

  res.status(201).json({
    success: true,
    message: 'Post creado exitosamente',
    data: post
  });
});

/**
 * @desc    Actualizar post (Admin solo)
 * @route   PUT /api/blog/:id
 * @access  Private/Admin
 */
export const updateBlogPost = asyncHandler(async (req, res) => {
  let post = await BlogPost.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post no encontrado'
    });
  }

  const { title, excerpt, content, category, tags, image, imageAlt, seoTitle, seoDescription, featured, published } = req.body;

  if (title) post.title = title;
  if (excerpt) post.excerpt = excerpt;
  if (content) post.content = content;
  if (category) post.category = category;
  if (tags) post.tags = tags;
  if (image) post.image = image;
  if (imageAlt) post.imageAlt = imageAlt;
  if (seoTitle) post.seoTitle = seoTitle;
  if (seoDescription) post.seoDescription = seoDescription;
  if (featured !== undefined) post.featured = featured;
  if (published !== undefined && published && !post.published) {
    await post.publish();
  }

  await post.save();
  await post.populate('author', 'firstName lastName avatar email');

  res.json({
    success: true,
    message: 'Post actualizado exitosamente',
    data: post
  });
});

/**
 * @desc    Publicar post (Admin solo)
 * @route   POST /api/blog/:id/publish
 * @access  Private/Admin
 */
export const publishBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post no encontrado'
    });
  }

  await post.publish();

  res.json({
    success: true,
    message: 'Post publicado exitosamente',
    data: post
  });
});

/**
 * @desc    Eliminar post (Admin solo)
 * @route   DELETE /api/blog/:id
 * @access  Private/Admin
 */
export const deleteBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findByIdAndDelete(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post no encontrado'
    });
  }

  res.json({
    success: true,
    message: 'Post eliminado exitosamente',
    data: {}
  });
});

/**
 * @desc    Agregar comentario a post
 * @route   POST /api/blog/:id/comments
 * @access  Private
 */
export const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'El comentario no puede estar vacío'
    });
  }

  const post = await BlogPost.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post no encontrado'
    });
  }

  const comment = {
    userId: req.user._id,
    userName: req.user.name,
    text: text.trim(),
    createdAt: new Date(),
    approved: false // Requiere aprobación de admin
  };

  post.comments.push(comment);
  await post.save();

  res.status(201).json({
    success: true,
    message: 'Comentario agregado (pendiente de aprobación)',
    data: comment
  });
});

/**
 * @desc    Aprobar comentario (Admin solo)
 * @route   PUT /api/blog/:id/comments/:commentId
 * @access  Private/Admin
 */
export const approveComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;

  const post = await BlogPost.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post no encontrado'
    });
  }

  const comment = post.comments.id(commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comentario no encontrado'
    });
  }

  comment.approved = true;
  await post.save();

  res.json({
    success: true,
    message: 'Comentario aprobado',
    data: comment
  });
});

/**
 * @desc    Eliminar comentario (Admin o propietario)
 * @route   DELETE /api/blog/:id/comments/:commentId
 * @access  Private
 */
export const deleteComment = asyncHandler(async (req, res) => {
  const { id, commentId } = req.params;

  const post = await BlogPost.findById(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: 'Post no encontrado'
    });
  }

  const comment = post.comments.id(commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comentario no encontrado'
    });
  }

  // Solo admin o propietario del comentario puede eliminar
  if (req.user.role !== 'admin' && comment.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para eliminar este comentario'
    });
  }

  post.comments.id(commentId).remove();
  await post.save();

  res.json({
    success: true,
    message: 'Comentario eliminado',
    data: {}
  });
});

/**
 * @desc    Obtener posts destacados
 * @route   GET /api/blog/featured
 * @access  Public
 */
export const getFeaturedBlogPosts = asyncHandler(async (req, res) => {
  const posts = await BlogPost.find({ published: true, featured: true })
    .populate('author', 'firstName lastName avatar email')
    .sort({ publishedAt: -1 })
    .limit(5)
    .lean();

  res.json({
    success: true,
    data: posts
  });
});

/**
 * @desc    Obtener posts por categoría
 * @route   GET /api/blog/category/:category
 * @access  Public
 */
export const getBlogPostsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const posts = await BlogPost.find({ published: true, category })
    .populate('author', 'firstName lastName avatar email')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const total = await BlogPost.countDocuments({ published: true, category });

  res.json({
    success: true,
    data: posts,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      limit: Number(limit)
    }
  });
});

export default {
  getAllBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  publishBlogPost,
  deleteBlogPost,
  addComment,
  approveComment,
  deleteComment,
  getFeaturedBlogPosts,
  getBlogPostsByCategory
};
