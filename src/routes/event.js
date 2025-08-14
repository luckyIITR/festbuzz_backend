const express = require('express');
const router = express.Router({ mergeParams: true });
const { authMiddleware } = require('../middlewares/auth');
const { 
  canCreateEvents, 
  canModifyEvents, 
  canManageEvents,
  canViewEventDetails,
  canAssignEventRoles,
} = require('../middlewares/rolePermissions');
// const { validateObjectId } = require('../middlewares/validation');
const {
  createEvent,
  saveEventAsDraft,
  publishEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  searchEvents,
  getEventStats,
  unpublishEvent
} = require('../controllers/eventController');

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event (as draft)
 *     tags: [Events]
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
 *               - startTime
 *               - endTime
 *               - venue
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *               venue:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               price:
 *                 type: number
 *               festId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 */
router.post('/', authMiddleware, canCreateEvents, createEvent);

/**
 * @swagger
 * /api/events/draft:
 *   post:
 *     summary: Save event as draft
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Draft saved successfully
 *       201:
 *         description: Draft created successfully
 */
router.post('/draft', authMiddleware, canCreateEvents, saveEventAsDraft);

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events with filters
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: festId
 *         schema:
 *           type: string
 *       - in: query
 *         name: organizer
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
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/', getAllEvents);

/**
 * @swagger
 * /api/events/search:
 *   get:
 *     summary: Search events
 *     tags: [Events]
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
 *         name: festId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchEvents);

/**
 * @swagger
 * /api/events/stats:
 *   get:
 *     summary: Get event statistics
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event statistics
 *       401:
 *         description: Not authorized
 */
router.get('/stats', authMiddleware, canManageEvents, getEventStats);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get('/:id', getEventById);

/**
 * @swagger
 * /api/events/{id}/publish:
 *   post:
 *     summary: Publish event
 *     tags: [Events]
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
 *         description: Event published successfully
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Event not found
 *       401:
 *         description: Not authorized
 */
router.post('/:id/publish', authMiddleware, canModifyEvents, publishEvent);

/**
 * @swagger
 * /api/events/{id}/unpublish:
 *   post:
 *     summary: Unpublish event
 *     tags: [Events]
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
 *         description: Event unpublished successfully
 *       404:
 *         description: Event not found
 *       401:
 *         description: Not authorized
 */
router.post('/:id/unpublish', authMiddleware, canModifyEvents, unpublishEvent); 

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update event
 *     tags: [Events]
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
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 *       401:
 *         description: Not authorized
 */
router.put('/:id', authMiddleware, canModifyEvents, updateEvent);

/**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
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
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       401:
 *         description: Not authorized
 */
router.delete('/:id', authMiddleware, canManageEvents, deleteEvent);

module.exports = router; 