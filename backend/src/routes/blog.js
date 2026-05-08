import express from 'express';
import {
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
} from '../controllers/blogController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ========================================
// Rutas públicas (sin autenticación)
// ========================================

// GET todos los posts publicados
router.get('/', getAllBlogPosts);

// GET posts destacados
router.get('/featured', getFeaturedBlogPosts);

// GET posts por categoría
router.get('/category/:category', getBlogPostsByCategory);

// GET un post por ID o slug
router.get('/:id', getBlogPost);

// POST comentario a un post (public pero requiere usuario validado después)
router.post('/:id/comments', protect, addComment);

// ========================================
// Rutas protegidas (admin solo)
// ========================================

// POST crear nuevo post
router.post('/', protect, authorize('admin'), createBlogPost);

// PUT actualizar post
router.put('/:id', protect, authorize('admin'), updateBlogPost);

// POST publicar post
router.post('/:id/publish', protect, authorize('admin'), publishBlogPost);

// DELETE eliminar post
router.delete('/:id', protect, authorize('admin'), deleteBlogPost);

// PUT aprobar comentario
router.put('/:id/comments/:commentId', protect, authorize('admin'), approveComment);

// DELETE eliminar comentario
router.delete('/:id/comments/:commentId', protect, deleteComment);

export default router;
