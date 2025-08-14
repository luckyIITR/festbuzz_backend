const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth');
const { canViewParticipants } = require('../middlewares/rolePermissions');
// const { validateObjectId } = require('../middlewares/validation');
const {
  registerForFest,
  registerForEvent,
  getMyRegistrations,
  getRegistrationById,
  cancelRegistration,
  getEventParticipants,
  getFestParticipants,
  getFestRegistrationStatus,
  unregisterForFest,
  getFestRegistrationCount,
  getEventRegistrationCount,
  getFestCandidates
} = require('../controllers/registrationController');

/**
 * @swagger
 * /api/registration/fest:
 *   post:
 *     summary: Register for a festival
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - festId
 *               - phone
 *               - dateOfBirth
 *               - gender
 *               - city
 *               - state
 *               - instituteName
 *             properties:
 *               festId:
 *                 type: string
 *               answers:
 *                 type: array
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               instituteName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Festival registration successful
 *       400:
 *         description: Validation error or already registered
 *       404:
 *         description: Festival not found
 */
router.post('/fest', authMiddleware, registerForFest);

/**
 * @swagger
 * /api/registration/event:
 *   post:
 *     summary: Register for an event
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - phone
 *               - dateOfBirth
 *               - gender
 *               - city
 *               - state
 *               - instituteName
 *             properties:
 *               eventId:
 *                 type: string
 *               answers:
 *                 type: array
 *               phone:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               instituteName:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, upi, cash]
 *     responses:
 *       201:
 *         description: Event registration successful
 *       400:
 *         description: Validation error or already registered
 *       404:
 *         description: Event not found
 */
router.post('/event', authMiddleware, registerForEvent);

/**
 * @swagger
 * /api/registration/my-registrations:
 *   get:
 *     summary: Get user's registrations
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [fest, event]
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
 *         description: User's registrations
 */
router.get('/my-registrations', authMiddleware, getMyRegistrations);

/**
 * @swagger
 * /api/registration/{id}:
 *   get:
 *     summary: Get registration by ID
 *     tags: [Registration]
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
 *         description: Registration details
 *       404:
 *         description: Registration not found
 *       403:
 *         description: Not authorized to view this registration
 */
router.get('/:id', authMiddleware, getRegistrationById);

/**
 * @swagger
 * /api/registration/{id}:
 *   delete:
 *     summary: Cancel registration
 *     tags: [Registration]
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
 *         description: Registration cancelled successfully
 *       400:
 *         description: Cannot cancel within 24 hours of event
 *       404:
 *         description: Registration not found
 *       403:
 *         description: Not authorized to cancel this registration
 */
router.delete('/:id', authMiddleware, cancelRegistration);

/**
 * @swagger
 * /api/registration/event/{eventId}/participants:
 *   get:
 *     summary: Get participants for an event (admin/organizer only)
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
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
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of participants
 *       401:
 *         description: Not authorized
 */
router.get('/event/:eventId/participants', authMiddleware, canViewParticipants, getEventParticipants);

/**
 * @swagger
 * /api/registration/fest/{festId}/participants:
 *   get:
 *     summary: Get participants for a festival (admin/organizer only)
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
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
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of participants
 *       401:
 *         description: Not authorized
 */
router.get('/fest/:festId/participants', authMiddleware, canViewParticipants, getFestParticipants);

/**
 * @swagger
 * /api/registration/fest/{festId}/status:
 *   get:
 *     summary: Get registration status for a user for a specific fest
 *     tags: [Registration]
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
 *         description: Registration status for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     isRegistered:
 *                       type: boolean
 *                     registration:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         status:
 *                           type: string
 *                         ticket:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Festival not found
 */
router.get('/fest/:festId/status', authMiddleware, getFestRegistrationStatus);

/**
 * @swagger
 * /api/registration/fest/{festId}/count:
 *   get:
 *     summary: Get registration count for a fest
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the fest
 *     responses:
 *       200:
 *         description: Fest registration count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *       404:
 *         description: Festival not found
 */
router.get('/fest/:festId/count', authMiddleware, getFestRegistrationCount);

/**
 * @swagger
 * /api/registration/event/{eventId}/count:
 *   get:
 *     summary: Get registration count for an event
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the event
 *     responses:
 *       200:
 *         description: Event registration count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     eventId:
 *                       type: string
 *                     eventName:
 *                       type: string
 *                     festId:
 *                       type: string
 *                     totalRegistrations:
 *                       type: integer
 *                     confirmedCount:
 *                       type: integer
 *                     pendingCount:
 *                       type: integer
 *                     cancelledCount:
 *                       type: integer
 *                     soloCount:
 *                       type: integer
 *                     teamCount:
 *                       type: integer
 *                     breakdown:
 *                       type: object
 *                       properties:
 *                         confirmed:
 *                           type: integer
 *                         pending:
 *                           type: integer
 *                         cancelled:
 *                           type: integer
 *                         solo:
 *                           type: integer
 *                         team:
 *                           type: integer
 *       400:
 *         description: Invalid event ID
 *       404:
 *         description: Event not found
 */
router.get('/event/:eventId/count', authMiddleware, getEventRegistrationCount);

/**
 * @swagger
 * /api/registration/fest/{festId}/unregister:
 *   delete:
 *     summary: Unregister from a festival
 *     tags: [Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the fest to unregister from
 *     responses:
 *       200:
 *         description: Successfully unregistered from the festival
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or not registered
 *       404:
 *         description: Festival or registration not found
 */
router.delete('/fest/:festId/unregister', authMiddleware, unregisterForFest);

router.get('/fest/:festId/candidates', authMiddleware, getFestCandidates);

module.exports = router; 