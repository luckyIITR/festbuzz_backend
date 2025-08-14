const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
// const { validateObjectId } = require('../middlewares/validation');
const {
  getMyFests,
  getRecentlyViewedFests,
  getWishlistFests,
  getRegisteredFests,
  getRecommendedFests,
  addToWishlist,
  removeFromWishlist,
  getMyFestsStats
} = require('../controllers/myfestsController');

/**
 * @swagger
 * /api/myfests:
 *   get:
 *     summary: Get all fests user is associated with
 *     tags: [My Fests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's fests categorized by status
 */
router.get('/', authMiddleware, getMyFests);

/**
 * @swagger
 * /api/myfests/recently-viewed:
 *   get:
 *     summary: Get user's recently viewed fests
 *     tags: [My Fests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recently viewed fests
 */
router.get('/recently-viewed', authMiddleware, getRecentlyViewedFests);

/**
 * @swagger
 * /api/myfests/wishlist:
 *   get:
 *     summary: Get user's wishlist fests
 *     tags: [My Fests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist fests
 */
router.get('/wishlist', authMiddleware, getWishlistFests);

/**
 * @swagger
 * /api/myfests/registered:
 *   get:
 *     summary: Get user's registered fests
 *     tags: [My Fests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registered fests
 */
router.get('/registered', authMiddleware, getRegisteredFests);

/**
 * @swagger
 * /api/myfests/recommended:
 *   get:
 *     summary: Get recommended fests
 *     tags: [My Fests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recommended fests
 */
router.get('/recommended', authMiddleware, getRecommendedFests);

/**
 * @swagger
 * /api/myfests/stats:
 *   get:
 *     summary: Get user's fest statistics
 *     tags: [My Fests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fest statistics
 */
router.get('/stats', authMiddleware, getMyFestsStats);

/**
 * @swagger
 * /api/myfests/wishlist/{festId}:
 *   post:
 *     summary: Add fest to wishlist
 *     tags: [My Fests]
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
 *         description: Added to wishlist
 *       404:
 *         description: Festival not found
 */
router.post('/wishlist/:festId', authMiddleware, addToWishlist);

/**
 * @swagger
 * /api/myfests/wishlist/{festId}:
 *   delete:
 *     summary: Remove fest from wishlist
 *     tags: [My Fests]
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
 *         description: Removed from wishlist
 */
router.delete('/wishlist/:festId', authMiddleware, removeFromWishlist);

module.exports = router; 