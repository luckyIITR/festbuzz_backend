# Frontend Integration Guide for Team Management System

## Overview

This guide provides comprehensive examples and best practices for integrating the team management system into your frontend application. The system supports both solo and team event registrations with unique team codes.

## Key Features to Implement

1. **Solo Event Registration**: Direct registration for individual events
2. **Team Creation**: Create teams for team events
3. **Team Joining**: Join teams using unique team codes
4. **Team Management**: Manage team members and leadership
5. **QR Code Integration**: Scan and generate QR codes
6. **Real-time Updates**: Live team status updates

## React/Next.js Integration

### 1. Team Management Context

```javascript
// contexts/TeamContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
  const [userTeams, setUserTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams/my-teams', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUserTeams(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (teamData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(teamData)
      });
      const data = await response.json();
      if (data.success) {
        await fetchUserTeams(); // Refresh teams
        return data;
      }
      throw new Error(data.message);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (teamCode) => {
    try {
      setLoading(true);
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ teamCode })
      });
      const data = await response.json();
      if (data.success) {
        await fetchUserTeams(); // Refresh teams
        return data;
      }
      throw new Error(data.message);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTeams();
  }, []);

  return (
    <TeamContext.Provider value={{
      userTeams,
      loading,
      error,
      createTeam,
      joinTeam,
      fetchUserTeams
    }}>
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => useContext(TeamContext);
```

### 2. Event Registration Component

```javascript
// components/EventRegistration.js
import React, { useState } from 'react';
import { useTeam } from '../contexts/TeamContext';

const EventRegistration = ({ event, festId }) => {
  const [registrationType, setRegistrationType] = useState('solo');
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [answers, setAnswers] = useState([]);
  const { createTeam, joinTeam, loading } = useTeam();

  const handleSoloRegistration = async () => {
    try {
      const response = await fetch('/api/registration/event/solo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          festId,
          eventId: event.id,
          answers
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Registration successful!');
        // Handle success (redirect, show QR code, etc.)
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  };

  const handleTeamCreation = async () => {
    try {
      const result = await createTeam({
        eventId: event.id,
        teamName,
        description: `Team for ${event.name}`
      });
      alert('Team created successfully! Team Code: ' + result.data.team.teamCode);
    } catch (error) {
      alert('Team creation failed: ' + error.message);
    }
  };

  const handleTeamJoin = async () => {
    try {
      const result = await joinTeam(teamCode);
      alert('Successfully joined team!');
    } catch (error) {
      alert('Failed to join team: ' + error.message);
    }
  };

  return (
    <div className="event-registration">
      <h2>Register for {event.name}</h2>
      
      <div className="registration-type-selector">
        <label>
          <input
            type="radio"
            value="solo"
            checked={registrationType === 'solo'}
            onChange={(e) => setRegistrationType(e.target.value)}
          />
          Solo Registration
        </label>
        {event.isTeamEvent && (
          <label>
            <input
              type="radio"
              value="team"
              checked={registrationType === 'team'}
              onChange={(e) => setRegistrationType(e.target.value)}
            />
            Team Registration
          </label>
        )}
      </div>

      {registrationType === 'solo' ? (
        <div className="solo-registration">
          <h3>Solo Registration</h3>
          <button 
            onClick={handleSoloRegistration}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Registering...' : 'Register Solo'}
          </button>
        </div>
      ) : (
        <div className="team-registration">
          <h3>Team Registration</h3>
          
          <div className="team-creation">
            <h4>Create a New Team</h4>
            <input
              type="text"
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="form-input"
            />
            <button 
              onClick={handleTeamCreation}
              disabled={loading || !teamName}
              className="btn btn-success"
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>
          </div>

          <div className="team-joining">
            <h4>Join an Existing Team</h4>
            <input
              type="text"
              placeholder="Enter Team Code (e.g., TEAM-A1B2C3)"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              className="form-input"
            />
            <button 
              onClick={handleTeamJoin}
              disabled={loading || !teamCode}
              className="btn btn-info"
            >
              {loading ? 'Joining...' : 'Join Team'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventRegistration;
```

### 3. Team Management Component

```javascript
// components/TeamManagement.js
import React, { useState, useEffect } from 'react';
import { useTeam } from '../contexts/TeamContext';

const TeamManagement = ({ teamId }) => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newLeaderId, setNewLeaderId] = useState('');
  const [memberToRemove, setMemberToRemove] = useState('');

  const fetchTeamDetails = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTeam(data.data.team);
      }
    } catch (error) {
      console.error('Failed to fetch team details:', error);
    } finally {
      setLoading(false);
    }
  };

  const leaveTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Successfully left team');
        // Redirect or refresh
      }
    } catch (error) {
      alert('Failed to leave team: ' + error.message);
    }
  };

  const removeMember = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/remove-member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ memberId: memberToRemove })
      });
      const data = await response.json();
      if (data.success) {
        alert('Member removed successfully');
        fetchTeamDetails();
      }
    } catch (error) {
      alert('Failed to remove member: ' + error.message);
    }
  };

  const transferLeadership = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/transfer-leadership`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newLeaderId })
      });
      const data = await response.json();
      if (data.success) {
        alert('Leadership transferred successfully');
        fetchTeamDetails();
      }
    } catch (error) {
      alert('Failed to transfer leadership: ' + error.message);
    }
  };

  const disbandTeam = async () => {
    if (!confirm('Are you sure you want to disband this team? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/disband`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Team disbanded successfully');
        // Redirect or refresh
      }
    } catch (error) {
      alert('Failed to disband team: ' + error.message);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  if (loading) return <div>Loading team details...</div>;
  if (!team) return <div>Team not found</div>;

  const isLeader = team.leader.id === localStorage.getItem('userId');
  const isMember = team.members.some(member => member.id === localStorage.getItem('userId'));

  return (
    <div className="team-management">
      <h2>{team.teamName}</h2>
      <div className="team-code">
        <strong>Team Code:</strong> {team.teamCode}
        <button 
          onClick={() => navigator.clipboard.writeText(team.teamCode)}
          className="btn btn-sm btn-outline"
        >
          Copy
        </button>
      </div>

      <div className="team-stats">
        <p>Members: {team.currentSize}/{team.maxSize}</p>
        <p>Available Slots: {team.availableSlots}</p>
        <p>Status: {team.status}</p>
      </div>

      <div className="team-members">
        <h3>Team Members</h3>
        <div className="member-list">
          {team.members.map(member => (
            <div key={member.id} className="member-item">
              <span>{member.name}</span>
              <span className="member-role">
                {member.id === team.leader.id ? '(Leader)' : '(Member)'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isMember && (
        <div className="team-actions">
          {!isLeader && (
            <button onClick={leaveTeam} className="btn btn-warning">
              Leave Team
            </button>
          )}

          {isLeader && (
            <div className="leader-actions">
              <h4>Leader Actions</h4>
              
              <div className="remove-member">
                <select 
                  value={memberToRemove} 
                  onChange={(e) => setMemberToRemove(e.target.value)}
                >
                  <option value="">Select member to remove</option>
                  {team.members
                    .filter(member => member.id !== team.leader.id)
                    .map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                </select>
                <button 
                  onClick={removeMember}
                  disabled={!memberToRemove}
                  className="btn btn-danger"
                >
                  Remove Member
                </button>
              </div>

              <div className="transfer-leadership">
                <select 
                  value={newLeaderId} 
                  onChange={(e) => setNewLeaderId(e.target.value)}
                >
                  <option value="">Select new leader</option>
                  {team.members
                    .filter(member => member.id !== team.leader.id)
                    .map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                </select>
                <button 
                  onClick={transferLeadership}
                  disabled={!newLeaderId}
                  className="btn btn-info"
                >
                  Transfer Leadership
                </button>
              </div>

              <button onClick={disbandTeam} className="btn btn-danger">
                Disband Team
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
```

### 4. Available Teams Component

```javascript
// components/AvailableTeams.js
import React, { useState, useEffect } from 'react';

const AvailableTeams = ({ eventId }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamCode, setSelectedTeamCode] = useState('');

  const fetchAvailableTeams = async () => {
    try {
      const response = await fetch(`/api/teams/event/${eventId}/available`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTeams(data.data.teams);
      }
    } catch (error) {
      console.error('Failed to fetch available teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (teamCode) => {
    try {
      const response = await fetch('/api/teams/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ teamCode })
      });
      const data = await response.json();
      if (data.success) {
        alert('Successfully joined team!');
        fetchAvailableTeams(); // Refresh list
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to join team: ' + error.message);
    }
  };

  useEffect(() => {
    fetchAvailableTeams();
  }, [eventId]);

  if (loading) return <div>Loading available teams...</div>;

  return (
    <div className="available-teams">
      <h3>Available Teams</h3>
      
      {teams.length === 0 ? (
        <p>No teams available for this event.</p>
      ) : (
        <div className="teams-list">
          {teams.map(team => (
            <div key={team.id} className="team-card">
              <h4>{team.teamName}</h4>
              <p><strong>Code:</strong> {team.teamCode}</p>
              <p><strong>Leader:</strong> {team.leader.name}</p>
              <p><strong>Members:</strong> {team.currentSize}/{team.maxSize}</p>
              <p><strong>Available Slots:</strong> {team.availableSlots}</p>
              {team.description && (
                <p><strong>Description:</strong> {team.description}</p>
              )}
              
              <button 
                onClick={() => joinTeam(team.teamCode)}
                className="btn btn-primary"
              >
                Join Team
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="manual-join">
        <h4>Join by Team Code</h4>
        <input
          type="text"
          placeholder="Enter team code (e.g., TEAM-A1B2C3)"
          value={selectedTeamCode}
          onChange={(e) => setSelectedTeamCode(e.target.value.toUpperCase())}
          className="form-input"
        />
        <button 
          onClick={() => joinTeam(selectedTeamCode)}
          disabled={!selectedTeamCode}
          className="btn btn-success"
        >
          Join Team
        </button>
      </div>
    </div>
  );
};

export default AvailableTeams;
```

### 5. QR Code Scanner Component

```javascript
// components/QRCodeScanner.js
import React, { useState } from 'react';
import QrReader from 'react-qr-reader';

const QRCodeScanner = ({ onTeamCodeScanned }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = (data) => {
    if (data) {
      setScanning(false);
      onTeamCodeScanned(data);
    }
  };

  const handleError = (err) => {
    setError(err.message);
  };

  return (
    <div className="qr-scanner">
      <h3>Scan Team Code</h3>
      
      {!scanning ? (
        <button 
          onClick={() => setScanning(true)}
          className="btn btn-primary"
        >
          Start Scanner
        </button>
      ) : (
        <div className="scanner-container">
          <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
          />
          <button 
            onClick={() => setScanning(false)}
            className="btn btn-secondary"
          >
            Stop Scanner
          </button>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default QRCodeScanner;
```

## CSS Styling

```css
/* styles/team-management.css */
.event-registration {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.registration-type-selector {
  margin: 20px 0;
}

.registration-type-selector label {
  display: block;
  margin: 10px 0;
  cursor: pointer;
}

.team-registration {
  margin-top: 20px;
}

.team-creation,
.team-joining {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.form-input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
}

.btn-primary { background-color: #007bff; color: white; }
.btn-success { background-color: #28a745; color: white; }
.btn-warning { background-color: #ffc107; color: black; }
.btn-danger { background-color: #dc3545; color: white; }
.btn-info { background-color: #17a2b8; color: white; }
.btn-outline { background-color: transparent; border: 1px solid #007bff; color: #007bff; }

.team-management {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.team-code {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
}

.team-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.member-list {
  margin: 15px 0;
}

.member-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.leader-actions {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 5px;
}

.available-teams {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.teams-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.team-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background-color: white;
}

.qr-scanner {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.scanner-container {
  margin: 20px 0;
}

.error-message {
  color: #dc3545;
  margin: 10px 0;
}
```

## Mobile App Integration (React Native)

```javascript
// MobileTeamManagement.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Camera } from 'expo-camera';
import * as Clipboard from 'expo-clipboard';

const MobileTeamManagement = () => {
  const [teamCode, setTeamCode] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setTeamCode(data);
    joinTeam(data);
  };

  const joinTeam = async (code) => {
    try {
      const response = await fetch('YOUR_API_BASE_URL/api/teams/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teamCode: code })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Successfully joined team!');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to join team');
    }
  };

  const copyTeamCode = async (code) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied', 'Team code copied to clipboard');
  };

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Team Management
      </Text>

      {/* Manual Team Code Entry */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Join by Team Code</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 10,
            borderRadius: 5,
            marginBottom: 10
          }}
          placeholder="Enter team code"
          value={teamCode}
          onChangeText={setTeamCode}
          autoCapitalize="characters"
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#007bff',
            padding: 15,
            borderRadius: 5,
            alignItems: 'center'
          }}
          onPress={() => joinTeam(teamCode)}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Join Team</Text>
        </TouchableOpacity>
      </View>

      {/* QR Code Scanner */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Scan Team Code</Text>
        {hasPermission === null ? (
          <TouchableOpacity
            style={{
              backgroundColor: '#28a745',
              padding: 15,
              borderRadius: 5,
              alignItems: 'center'
            }}
            onPress={requestCameraPermission}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Request Camera Permission
            </Text>
          </TouchableOpacity>
        ) : hasPermission === false ? (
          <Text>No access to camera</Text>
        ) : (
          <Camera
            style={{ height: 300, marginBottom: 10 }}
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        )}
        {scanned && (
          <TouchableOpacity
            style={{
              backgroundColor: '#ffc107',
              padding: 15,
              borderRadius: 5,
              alignItems: 'center'
            }}
            onPress={() => setScanned(false)}
          >
            <Text style={{ fontWeight: 'bold' }}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default MobileTeamManagement;
```

## Best Practices

### 1. Error Handling
- Always handle API errors gracefully
- Show user-friendly error messages
- Implement retry mechanisms for network failures

### 2. Loading States
- Show loading indicators during API calls
- Disable buttons during operations
- Provide feedback for all user actions

### 3. Validation
- Validate team codes format (TEAM-XXXXXX)
- Check for required fields before submission
- Provide real-time validation feedback

### 4. User Experience
- Auto-copy team codes to clipboard
- Show QR codes for easy sharing
- Implement real-time team status updates
- Provide clear success/error messages

### 5. Security
- Validate all inputs server-side
- Implement proper authentication
- Use HTTPS for all API calls
- Sanitize user inputs

### 6. Performance
- Implement pagination for large team lists
- Cache team data when appropriate
- Optimize API calls
- Use lazy loading for components

This integration guide provides a comprehensive foundation for implementing the team management system in your frontend application. The components are modular and can be easily customized to match your application's design and requirements. 