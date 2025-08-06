const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const EventRegistration = require('../models/EventRegistration');
const FestRegistration = require('../models/FestRegistration');
const Event = require('../models/Event');
const User = require('../models/User');
const { authMiddleware } = require('../middlewares/auth');
const mongoose = require('mongoose');
const QRCode = require('qrcode');

// Helper to generate QR code data URL
async function generateQRCode(text) {
  return await QRCode.toDataURL(text);
}

/**
 * @swagger
 * /api/teams/create:
 *   post:
 *     summary: Create a new team for an event
 *     tags: [Teams]
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
 *               - teamName
 *             properties:
 *               eventId: { type: string }
 *               teamName: { type: string }
 *               description: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201: { description: Team created successfully }
 *       400: { description: Bad request }
 *       403: { description: Forbidden - user not registered for fest }
 *       409: { description: Conflict - already in team for this event }
 */
// Create a new team
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { eventId, teamName, description, notes } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!eventId || !teamName) {
      return res.status(400).json({
        success: false,
        message: 'eventId and teamName are required'
      });
    }

    // Check if event exists and is a team event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.isTeamEvent) {
      return res.status(400).json({
        success: false,
        message: 'This event does not support team registration'
      });
    }

    // Check if user is registered for the fest
    const festRegistration = await FestRegistration.findOne({
      userId,
      festId: event.festId
    });

    if (!festRegistration) {
      return res.status(403).json({
        success: false,
        message: 'You must register for the fest before creating a team'
      });
    }

    // Check if user is already in a team for this event
    const existingTeam = await Team.findOne({
      event_id: eventId,
      members: userId,
      status: { $in: ['active', 'full'] }
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: 'You are already in a team for this event'
      });
    }

    // Check if user already has an event registration
    const existingRegistration = await EventRegistration.findOne({
      userId,
      eventId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Create team
    const team = new Team({
      team_name: teamName,
      event_id: eventId,
      fest_id: event.festId,
      leader_id: userId,
      max_size: event.teamSize || 4, // Default to 4 if not specified
      description,
      notes
    });

    await team.save();

    // Create event registration for the leader
    const ticketCode = `TICKET-${new mongoose.Types.ObjectId()}`;
    const qrCode = await generateQRCode(ticketCode);

    const eventRegistration = new EventRegistration({
      teamId: team._id,
      eventId,
      festRegistrationId: festRegistration._id,
      status: 'confirmed',
      ticket: ticketCode,
      qrCode,
      type: 'team',
      teamRole: 'leader'
    });

    await eventRegistration.save();

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: {
        team: {
          id: team._id,
          teamName: team.team_name,
          teamCode: team.team_code,
          leaderId: team.leader_id,
          members: team.members,
          currentSize: team.current_size,
          maxSize: team.max_size,
          availableSlots: team.available_slots,
          status: team.status,
          description: team.description,
          createdAt: team.createdAt
        },
        registration: {
          id: eventRegistration._id,
          ticket: eventRegistration.ticket,
          qrCode: eventRegistration.qrCode,
          status: eventRegistration.status
        }
      }
    });

  } catch (err) {
    console.error('Team creation error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/teams/join:
 *   post:
 *     summary: Join a team using team code
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamCode
 *             properties:
 *               teamCode: { type: string }
 *     responses:
 *       200: { description: Successfully joined team }
 *       400: { description: Bad request }
 *       404: { description: Team not found }
 *       409: { description: Conflict - team full or already in team }
 */
// Join a team using team code
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { teamCode } = req.body;
    const userId = req.user.id;

    if (!teamCode) {
      return res.status(400).json({
        success: false,
        message: 'Team code is required'
      });
    }

    // Find team by code
    const team = await Team.findOne({ team_code: teamCode.toUpperCase() });
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if team is active
    if (team.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Team is not accepting new members'
      });
    }

    // Check if team is full
    if (team.isFull()) {
      return res.status(409).json({
        success: false,
        message: 'Team is full'
      });
    }

    // Check if user is already in the team
    if (team.hasMember(userId)) {
      return res.status(409).json({
        success: false,
        message: 'You are already a member of this team'
      });
    }

    // Check if user is already in another team for this event
    const existingTeam = await Team.findOne({
      event_id: team.event_id,
      members: userId,
      status: { $in: ['active', 'full'] }
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message: 'You are already in a team for this event'
      });
    }

    // Check if user is registered for the fest
    const event = await Event.findById(team.event_id);
    const festRegistration = await FestRegistration.findOne({
      userId,
      festId: event.festId
    });

    if (!festRegistration) {
      return res.status(403).json({
        success: false,
        message: 'You must register for the fest before joining a team'
      });
    }

    // Check if user already has an event registration
    const existingRegistration = await EventRegistration.findOne({
      userId,
      eventId: team.event_id,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Add user to team
    await team.addMember(userId);

    // Create event registration for the new member
    const ticketCode = `TICKET-${new mongoose.Types.ObjectId()}`;
    const qrCode = await generateQRCode(ticketCode);

    const eventRegistration = new EventRegistration({
      teamId: team._id,
      eventId: team.event_id,
      festRegistrationId: festRegistration._id,
      status: 'confirmed',
      ticket: ticketCode,
      qrCode,
      type: 'team',
      teamRole: 'member'
    });

    await eventRegistration.save();

    res.json({
      success: true,
      message: 'Successfully joined team',
      data: {
        team: {
          id: team._id,
          teamName: team.team_name,
          teamCode: team.team_code,
          leaderId: team.leader_id,
          members: team.members,
          currentSize: team.current_size,
          maxSize: team.max_size,
          availableSlots: team.available_slots,
          status: team.status
        },
        registration: {
          id: eventRegistration._id,
          ticket: eventRegistration.ticket,
          qrCode: eventRegistration.qrCode,
          status: eventRegistration.status
        }
      }
    });

  } catch (err) {
    console.error('Team join error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/teams/{teamId}:
 *   get:
 *     summary: Get team details
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Team details }
 *       404: { description: Team not found }
 */
// Get team details
router.get('/:teamId', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId)
      .populate('leader_id', 'name email')
      .populate('members', 'name email instituteName')
      .populate('event_id', 'name description startDate endDate location')
      .populate('fest_id', 'name');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is a member or leader
    const isMember = team.hasMember(userId);
    const isLeader = team.leader_id._id.toString() === userId;

    res.json({
      success: true,
      data: {
        team: {
          id: team._id,
          teamName: team.team_name,
          teamCode: team.team_code,
          leader: team.leader_id,
          members: team.members,
          currentSize: team.current_size,
          maxSize: team.max_size,
          availableSlots: team.available_slots,
          status: team.status,
          description: team.description,
          notes: team.notes,
          event: team.event_id,
          fest: team.fest_id,
          createdAt: team.createdAt,
          updatedAt: team.updatedAt
        },
        userRole: {
          isMember,
          isLeader,
          canManage: isLeader
        }
      }
    });

  } catch (err) {
    console.error('Get team details error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/teams/{teamId}/leave:
 *   post:
 *     summary: Leave a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Successfully left team }
 *       400: { description: Cannot leave - team leader }
 *       404: { description: Team not found }
 */
// Leave a team
router.post('/:teamId/leave', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is the leader
    if (team.leader_id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Team leader cannot leave. Transfer leadership or disband the team.'
      });
    }

    // Check if user is a member
    if (!team.hasMember(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this team'
      });
    }

    // Remove user from team
    await team.removeMember(userId);

    // Cancel event registration
    const eventRegistration = await EventRegistration.findOne({
      userId,
      teamId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (eventRegistration) {
      eventRegistration.status = 'cancelled';
      await eventRegistration.save();
    }

    res.json({
      success: true,
      message: 'Successfully left team',
      data: {
        teamId: team._id,
        teamName: team.team_name,
        currentSize: team.current_size,
        availableSlots: team.available_slots
      }
    });

  } catch (err) {
    console.error('Leave team error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/teams/{teamId}/remove-member:
 *   post:
 *     summary: Remove a member from team (leader only)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - memberId
 *             properties:
 *               memberId: { type: string }
 *     responses:
 *       200: { description: Member removed successfully }
 *       400: { description: Bad request }
 *       403: { description: Forbidden - not team leader }
 *       404: { description: Team not found }
 */
// Remove member from team (leader only)
router.post('/:teamId/remove-member', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { memberId } = req.body;
    const userId = req.user.id;

    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'memberId is required'
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is the leader
    if (team.leader_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can remove members'
      });
    }

    // Check if member exists in team
    if (!team.hasMember(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'User is not a member of this team'
      });
    }

    // Cannot remove the leader
    if (team.leader_id.toString() === memberId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove team leader'
      });
    }

    // Remove member from team
    await team.removeMember(memberId);

    // Cancel event registration for the removed member
    const eventRegistration = await EventRegistration.findOne({
      userId: memberId,
      teamId,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (eventRegistration) {
      eventRegistration.status = 'cancelled';
      await eventRegistration.save();
    }

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: {
        teamId: team._id,
        teamName: team.team_name,
        currentSize: team.current_size,
        availableSlots: team.available_slots,
        removedMemberId: memberId
      }
    });

  } catch (err) {
    console.error('Remove member error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/teams/{teamId}/transfer-leadership:
 *   post:
 *     summary: Transfer team leadership to another member
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newLeaderId
 *             properties:
 *               newLeaderId: { type: string }
 *     responses:
 *       200: { description: Leadership transferred successfully }
 *       400: { description: Bad request }
 *       403: { description: Forbidden - not current leader }
 *       404: { description: Team not found }
 */
// Transfer team leadership
router.post('/:teamId/transfer-leadership', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { newLeaderId } = req.body;
    const userId = req.user.id;

    if (!newLeaderId) {
      return res.status(400).json({
        success: false,
        message: 'newLeaderId is required'
      });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is the current leader
    if (team.leader_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only current leader can transfer leadership'
      });
    }

    // Check if new leader is a member
    if (!team.hasMember(newLeaderId)) {
      return res.status(400).json({
        success: false,
        message: 'New leader must be a team member'
      });
    }

    // Transfer leadership
    team.leader_id = newLeaderId;
    await team.save();

    res.json({
      success: true,
      message: 'Leadership transferred successfully',
      data: {
        teamId: team._id,
        teamName: team.team_name,
        newLeaderId: team.leader_id,
        currentSize: team.current_size
      }
    });

  } catch (err) {
    console.error('Transfer leadership error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/teams/{teamId}/disband:
 *   post:
 *     summary: Disband team (leader only)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Team disbanded successfully }
 *       403: { description: Forbidden - not team leader }
 *       404: { description: Team not found }
 */
// Disband team
router.post('/:teamId/disband', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is the leader
    if (team.leader_id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can disband the team'
      });
    }

    // Cancel all event registrations for team members
    const eventRegistrations = await EventRegistration.find({
      teamId,
      status: { $in: ['pending', 'confirmed'] }
    });

    for (const registration of eventRegistrations) {
      registration.status = 'cancelled';
      await registration.save();
    }

    // Disband team
    team.status = 'disbanded';
    await team.save();

    res.json({
      success: true,
      message: 'Team disbanded successfully',
      data: {
        teamId: team._id,
        teamName: team.team_name,
        cancelledRegistrations: eventRegistrations.length
      }
    });

  } catch (err) {
    console.error('Disband team error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/teams/my-teams:
 *   get:
 *     summary: Get user's teams
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: User's teams }
 */
// Get user's teams
router.get('/my-teams', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const teams = await Team.find({
      members: userId,
      status: { $ne: 'disbanded' }
    })
    .populate('leader_id', 'name email')
    .populate('members', 'name email instituteName')
    .populate('event_id', 'name description startDate endDate location')
    .populate('fest_id', 'name')
    .sort({ createdAt: -1 });

    const formattedTeams = teams.map(team => ({
      id: team._id,
      teamName: team.team_name,
      teamCode: team.team_code,
      leader: team.leader_id,
      members: team.members,
      currentSize: team.current_size,
      maxSize: team.max_size,
      availableSlots: team.available_slots,
      status: team.status,
      description: team.description,
      event: team.event_id,
      fest: team.fest_id,
      isLeader: team.leader_id._id.toString() === userId,
      createdAt: team.createdAt
    }));

    res.json({
      success: true,
      data: formattedTeams
    });

  } catch (err) {
    console.error('Get my teams error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

/**
 * @swagger
 * /api/teams/event/{eventId}/available:
 *   get:
 *     summary: Get available teams for an event
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Available teams }
 */
// Get available teams for an event
router.get('/event/:eventId/available', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists and is a team event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.isTeamEvent) {
      return res.status(400).json({
        success: false,
        message: 'This event does not support team registration'
      });
    }

    // Get teams that have available slots
    const availableTeams = await Team.find({
      event_id: eventId,
      status: 'active'
    })
    .populate('leader_id', 'name email instituteName')
    .populate('members', 'name email instituteName')
    .populate('event_id', 'name description')
    .sort({ createdAt: -1 });

    // Filter teams that have available slots and user is not already in
    const filteredTeams = availableTeams.filter(team => {
      const hasAvailableSlots = team.current_size < team.max_size;
      const userNotInTeam = !team.hasMember(userId);
      return hasAvailableSlots && userNotInTeam;
    });

    const formattedTeams = filteredTeams.map(team => ({
      id: team._id,
      teamName: team.team_name,
      teamCode: team.team_code,
      leader: team.leader_id,
      currentSize: team.current_size,
      maxSize: team.max_size,
      availableSlots: team.available_slots,
      description: team.description,
      event: team.event_id,
      createdAt: team.createdAt
    }));

    res.json({
      success: true,
      data: {
        event: {
          id: event._id,
          name: event.name,
          description: event.description,
          teamSize: event.teamSize
        },
        teams: formattedTeams
      }
    });

  } catch (err) {
    console.error('Get available teams error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 