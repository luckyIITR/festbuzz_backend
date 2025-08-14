const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
// const { validateObjectId } = require('../middlewares/validation');
const {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
  checkWishlistStatus,
  getWishlistCount,
  clearWishlist
} = require('../controllers/wishlistController');

/**
 * @swagger
 * /api/wishlist/add/{festId}:
 *   post:
 *     summary: Add fest to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Fest added to wishlist successfully
 *       400:
 *         description: Fest already in wishlist
 *       404:
 *         description: Festival not found
 */
router.post('/add/:festId', authMiddleware, addToWishlist);

/**
 * @swagger
 * /api/wishlist/remove/{festId}:
 *   delete:
 *     summary: Remove fest from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fest removed from wishlist successfully
 *       404:
 *         description: Fest not found in wishlist
 */
router.delete('/remove/:festId', authMiddleware, removeFromWishlist);

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's wishlist
 */
router.get('/', authMiddleware, getUserWishlist);

/**
 * @swagger
 * /api/wishlist/check/{festId}:
 *   get:
 *     summary: Check if fest is in wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wishlist status
 */
router.get('/check/:festId', authMiddleware, checkWishlistStatus);

/**
 * @swagger
 * /api/wishlist/count:
 *   get:
 *     summary: Get wishlist count
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist count
 */
router.get('/count', authMiddleware, getWishlistCount);

/**
 * @swagger
 * /api/wishlist/clear:
 *   delete:
 *     summary: Clear entire wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared successfully
 */
router.delete('/clear', authMiddleware, clearWishlist);

module.exports = router; 