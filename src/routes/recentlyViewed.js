const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
// const { validateObjectId } = require('../middlewares/validation');
const {
  addToRecentlyViewed,
  getUserRecentlyViewed,
  getMostViewedFests,
  removeFromRecentlyViewed,
  clearRecentlyViewed,
  getRecentlyViewedStats
} = require('../controllers/recentlyViewedController');

/**
 * @swagger
 * /api/recently-viewed/add/{festId}:
 *   post:
 *     summary: Add fest to recently viewed
 *     tags: [Recently Viewed]
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
 *         description: Fest added to recently viewed successfully
 *       404:
 *         description: Festival not found
 */
router.post('/add/:festId', authMiddleware, addToRecentlyViewed);

/**
 * @swagger
 * /api/recently-viewed:
 *   get:
 *     summary: Get user's recently viewed fests
 *     tags: [Recently Viewed]
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
 *         description: User's recently viewed fests
 */
router.get('/', authMiddleware, getUserRecentlyViewed);

/**
 * @swagger
 * /api/recently-viewed/most-viewed:
 *   get:
 *     summary: Get user's most viewed fests
 *     tags: [Recently Viewed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User's most viewed fests
 */
router.get('/most-viewed', authMiddleware, getMostViewedFests);

/**
 * @swagger
 * /api/recently-viewed/remove/{festId}:
 *   delete:
 *     summary: Remove fest from recently viewed
 *     tags: [Recently Viewed]
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
 *         description: Fest removed from recently viewed successfully
 *       404:
 *         description: Fest not found in recently viewed
 */
router.delete('/remove/:festId', authMiddleware, removeFromRecentlyViewed);

/**
 * @swagger
 * /api/recently-viewed/clear:
 *   delete:
 *     summary: Clear entire recently viewed history
 *     tags: [Recently Viewed]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recently viewed history cleared successfully
 */
router.delete('/clear', authMiddleware, clearRecentlyViewed);

/**
 * @swagger
 * /api/recently-viewed/stats:
 *   get:
 *     summary: Get recently viewed statistics
 *     tags: [Recently Viewed]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recently viewed statistics
 */
router.get('/stats', authMiddleware, getRecentlyViewedStats);

module.exports = router; 