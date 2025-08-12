const express = require('express');
const router = express.Router({ mergeParams: true });
const Event = require('../models/Event');
const { authMiddleware } = require('../middlewares/auth');
const { 
  canCreateEvents, 
  canModifyEvents, 
  canManageEvents,
  canViewEventDetails,
  canAssignEventRoles,
} = require('../middlewares/rolePermissions');


// Create Event (as draft by default)
router.post('/', authMiddleware, canCreateEvents, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      status: 'draft',
      lastSavedAsDraft: new Date()
    };
    const event = new Event(eventData);
    await event.save();
    res.status(201).json({
      success: true,
      message: 'Event created as draft successfully',
      data: event
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Save Event as Draft
router.post('/draft', authMiddleware, canCreateEvents, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      status: 'draft',
      lastSavedAsDraft: new Date()
    };
    
    if (req.body._id) {
      // Update existing draft
      const event = await Event.findById(req.body._id);
      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found' 
        });
      }
      
      // Increment draft version
      eventData.draftVersion = (event.draftVersion || 0) + 1;
      
      const updatedEvent = await Event.findByIdAndUpdate(
        req.body._id, 
        eventData, 
        { new: true }
      );
      res.json({
        success: true,
        message: 'Draft saved successfully',
        data: updatedEvent
      });
    } else {
      // Create new draft
      const event = new Event(eventData);
      await event.save();
      res.status(201).json({
        success: true,
        message: 'Draft created successfully',
        data: event
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Publish Event
router.post('/:id/publish', authMiddleware, canModifyEvents, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Validate required fields for publishing
    const requiredFields = ['name', 'type', 'visibility', 'mode', 'location', 'venue'];
    const missingFields = requiredFields.filter(field => !event[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot publish event. Missing required fields: ' + missingFields.join(', '),
        missingFields 
      });
    }

    event.status = 'published';
    event.publishedAt = new Date();
    event.publishedBy = req.user.id;
    await event.save();

    res.json({
      success: true,
      message: 'Event published successfully',
      data: event
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Unpublish Event (back to draft)
router.post('/:id/unpublish', authMiddleware, canModifyEvents, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    event.status = 'draft';
    event.publishedAt = null;
    event.publishedBy = null;
    event.lastSavedAsDraft = new Date();
    await event.save();

    res.json({
      success: true,
      message: 'Event unpublished successfully',
      data: event
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Archive Event
router.post('/:id/archive', authMiddleware, canManageEvents, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    event.status = 'archived';
    await event.save();

    res.json({
      success: true,
      message: 'Event archived successfully',
      data: event
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get event status and draft info
router.get('/:id/status', authMiddleware, canViewEventDetails, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    res.json({
      success: true,
      data: {
        status: event.status,
        publishedAt: event.publishedAt,
        publishedBy: event.publishedBy,
        draftVersion: event.draftVersion,
        lastSavedAsDraft: event.lastSavedAsDraft,
        canPublish: event.status === 'draft' && event.name && event.type && event.visibility && event.mode && event.location && event.venue
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get all Events (with status filter)
router.get('/', async (req, res) => {
  try {
    const { status, festId } = req.query;
    const query = {};
    
    // Filter by status if provided
    if (status && ['draft', 'published', 'archived'].includes(status)) {
      query.status = status;
    }
    
    // Filter by fest if provided
    if (festId) {
      query.festId = festId;
    }
    
    const events = await Event.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: events
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get published events only (for public access)
router.get('/published', async (req, res) => {
  try {
    const { festId } = req.query;
    const query = { status: 'published' };
    
    if (festId) {
      query.festId = festId;
    }
    
    const events = await Event.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: events
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get draft events (admin only)
router.get('/drafts', authMiddleware, canViewEventDetails, async (req, res) => {
  try {
    const { festId } = req.query;
    const query = { status: 'draft' };
    
    if (festId) {
      query.festId = festId;
    }
    
    const drafts = await Event.find(query).sort({ lastSavedAsDraft: -1 });
    res.json({
      success: true,
      data: drafts
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get Event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ 
      success: false, 
      message: 'Event not found' 
    });
    res.json({
      success: true,
      data: event
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update Event
router.put('/:id', authMiddleware, canModifyEvents, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ 
      success: false, 
      message: 'Event not found' 
    });
    
    // If updating a published event, save as draft
    if (event.status === 'published') {
      req.body.status = 'draft';
      req.body.lastSavedAsDraft = new Date();
      req.body.draftVersion = (event.draftVersion || 0) + 1;
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Update Event as Draft
router.put('/:id/draft', authMiddleware, canModifyEvents, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ 
      success: false, 
      message: 'Event not found' 
    });
    
    const updateData = {
      ...req.body,
      status: 'draft',
      lastSavedAsDraft: new Date(),
      draftVersion: (event.draftVersion || 0) + 1
    };
    
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({
      success: true,
      message: 'Event saved as draft successfully',
      data: updatedEvent
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Delete Event
router.delete('/:id', authMiddleware, canManageEvents, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ 
      success: false, 
      message: 'Event not found' 
    });
    res.json({ 
      success: true, 
      message: 'Event deleted successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Add judge to event
router.post('/:id/judges', authMiddleware, canManageEvents, async (req, res) => {
  try {
    const { name, mobile, about, email, photo } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    event.judges.push({ name, mobile, about, email, photo });
    await event.save();
    res.json(event.judges);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Remove judge from event
router.delete('/:id/judges/:judgeIndex', authMiddleware, canManageEvents, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    event.judges.splice(req.params.judgeIndex, 1);
    await event.save();
    res.json(event.judges);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// List judges for event
router.get('/:id/judges', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event.judges);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Assign event role
router.post('/:id/roles', authMiddleware, canAssignEventRoles, async (req, res) => {
  try {
    const { type, name, email } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    event.roles.push({ type, name, email });
    await event.save();
    res.json(event.roles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Remove event role
router.delete('/:id/roles/:roleIndex', authMiddleware, canAssignEventRoles, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    event.roles.splice(req.params.roleIndex, 1);
    await event.save();
    res.json(event.roles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// List event roles
router.get('/:id/roles', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ msg: 'Event not found' });
    res.json(event.roles);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

/**
 * @swagger
 * /api/fests/{festId}/events:
 *   get:
 *     summary: List all events for a fest
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: festId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: List of events }
 */
// List all events for a fest
router.get('/fests/:festId/events', async (req, res) => {
  try {
    const events = await Event.find({ festId: req.params.festId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router; 