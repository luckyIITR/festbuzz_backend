const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { 
  canCreateFests, 
  canManageFests, 
} = require('../middlewares/rolePermissions');
// const { validateObjectId } = require('../middlewares/validation');
const {
  createFest,
  getAllFests,
  getFestById,
  updateFest,
  deleteFest,
  getFestEvents,
  getFestFilters,
  searchFests
} = require('../controllers/festController');

/**
 * @swagger
 * /api/fests:
 *   post:
 *     summary: Create a new festival
 *     tags: [Festivals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - startDate
 *               - endDate
 *               - venue
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               venue:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Festival created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 */
router.post('/', authMiddleware, canCreateFests, createFest);

/**
 * @swagger
 * /api/fests:
 *   get:
 *     summary: Get all festivals with optional filters
 *     tags: [Festivals]
 *     parameters:
 *       - in: query
 *         name: trending
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
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
 *         description: List of festivals
 */
router.get('/', getAllFests);

/**
 * @swagger
 * /api/fests/filters:
 *   get:
 *     summary: Get festival filters
 *     tags: [Festivals]
 *     responses:
 *       200:
 *         description: Festival filters
 */
router.get('/filters', getFestFilters);

/**
 * @swagger
 * /api/fests/search:
 *   get:
 *     summary: Search festivals
 *     tags: [Festivals]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchFests);

/**
 * @swagger
 * /api/fests/{id}:
 *   get:
 *     summary: Get festival by ID
 *     tags: [Festivals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Festival details
 *       404:
 *         description: Festival not found
 */
router.get('/:id', getFestById);

/**
 * @swagger
 * /api/fests/{id}:
 *   put:
 *     summary: Update festival
 *     tags: [Festivals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Festival updated successfully
 *       404:
 *         description: Festival not found
 *       401:
 *         description: Not authorized
 */
router.put('/:id', authMiddleware, canManageFests, updateFest);

/**
 * @swagger
 * /api/fests/{id}:
 *   delete:
 *     summary: Delete festival
 *     tags: [Festivals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Festival deleted successfully
 *       404:
 *         description: Festival not found
 *       401:
 *         description: Not authorized
 */
router.delete('/:id', authMiddleware, canManageFests, deleteFest);

/**
 * @swagger
 * /api/fests/{festId}/events:
 *   get:
 *     summary: Get all events for a specific festival
 *     tags: [Festivals]
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of events for the festival
 */
router.get('/:festId/events', getFestEvents);

module.exports = router; 