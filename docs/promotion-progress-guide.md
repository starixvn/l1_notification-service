# Promotion Progress Notification Guide

## Overview

The Promotion Progress feature allows real-time notification of turnover (TO) progress to specific players. This system provides targeted notifications about promotion status, progress, and eligibility through HTTP endpoints and WebSocket connections.

## Architecture

```
HTTP Request → Authentication → Handler → Socket Adapter → Target Client
```

1. **HTTP Endpoint**: Receives promotion progress data
2. **Authentication**: Validates request using Bearer token
3. **Handler**: Processes and validates data
4. **Socket Adapter**: Targets specific client by playerId
5. **Client Notification**: Sends filtered data to target player

## HTTP Endpoint

### Endpoint Details

-   **URL**: `POST /api/promotionProgress`
-   **Authentication**: Bearer token required
-   **Content-Type**: `application/json`

### Request Format

```json
{
    "playerId": "21031988",
    "operatorId": "operator123",
    "siteName": "casino-site",
    "totalTO": 5000,
    "minTO": 1000,
    "remainTO": 2000,
    "progress": 60,
    "canClaim": false,
    "win": 150.5,
    "expire": "2024-12-31T23:59:59Z"
}
```

### Field Descriptions

| Field        | Type    | Required | Description                        |
| ------------ | ------- | -------- | ---------------------------------- |
| `playerId`   | String  | Yes      | Player identifier for targeting    |
| `operatorId` | String  | No       | Operator identifier                |
| `siteName`   | String  | No       | Site name identifier               |
| `totalTO`    | Number  | No       | Total turnover amount              |
| `minTO`      | Number  | No       | Minimum turnover required          |
| `remainTO`   | Number  | No       | Remaining turnover needed          |
| `progress`   | Number  | No       | Progress percentage (0-100)        |
| `canClaim`   | Boolean | No       | Whether player can claim promotion |
| `win`        | Number  | No       | Win amount                         |
| `expire`     | String  | No       | Expiration date in ISO format      |

### cURL Example

```bash
curl -X POST http://localhost:3000/api/promotionProgress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "playerId": "21031988",
    "operatorId": "operator123",
    "siteName": "casino-site",
    "totalTO": 5000,
    "minTO": 1000,
    "remainTO": 2000,
    "progress": 60,
    "canClaim": false,
    "win": 150.50,
    "expire": "2024-12-31T23:59:59Z"
  }'
```

### Response Format

**Success Response** (200):

```json
{
    "received": true
}
```

**Error Responses**:

-   `400 Bad Request`: Missing required fields
-   `401 Unauthorized`: Authentication failed
-   `500 Internal Server Error`: Server error

## Socket Events

### Event Name

`promotionProgress`

### Client-side Implementation

```javascript
// Connect to socket
const socket = io("http://localhost:3000");

// Listen for promotion progress events
socket.on("promotionProgress", (data) => {
    console.log("Received promotion progress:", data);

    // Update UI components
    updateProgressBar(data.progress);
    updateTurnoverDisplay(data.remainTO, data.totalTO);

    if (data.canClaim) {
        showClaimButton();
    }

    // Handle expiration
    if (data.expire) {
        startCountdown(data.expire);
    }
});
```

### Client Data Structure

The client receives **filtered data** with sensitive fields removed:

```json
{
    "totalTO": 5000,
    "minTO": 1000,
    "remainTO": 2000,
    "progress": 60,
    "canClaim": false,
    "win": 150.5,
    "expire": "2024-12-31T23:59:59Z"
}
```

**Note**: `playerId`, `operatorId`, and `siteName` are filtered out for security.

## Security Considerations

### Authentication

-   All HTTP requests require Bearer token authentication
-   Token is validated against configured auth service
-   Failed authentication returns `401 Unauthorized`

### Data Filtering

-   Sensitive fields are automatically filtered before client notification
-   Only target player receives the notification
-   No broadcasting to other clients

### Player Targeting

-   Uses `session.playerId` for client identification
-   Ensures notification reaches only intended recipient
-   Handles multiple connections per player (first match wins)

## Error Handling

### Common Error Scenarios

1. **Missing playerId**:

    ```json
    {
        "error": "playerId is required"
    }
    ```

2. **Authentication Failure**:

    ```
    401 Unauthorized
    ```

3. **Server Error**:

    ```json
    {
        "error": "Internal server error"
    }
    ```

4. **Player Not Connected**:
    - HTTP request succeeds
    - No socket notification sent (player offline)

## Testing

### Unit Tests

Tests are located in:

-   `tests/features/promotion-progress/promotion-progress-handler.test.js`
-   `tests/adapters/socket-adapter.test.js`
-   `tests/features/routers/http-router.test.js`

### Test Coverage

-   ✅ HTTP endpoint validation
-   ✅ Socket targeting by playerId
-   ✅ Data filtering for security
-   ✅ Error handling scenarios
-   ✅ Authentication integration

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --testPathPattern=promotion-progress-handler.test.js
```

## Integration Examples

### Backend Integration

```javascript
// Example: Send promotion progress after game round
const sendPromotionProgress = async (playerId, progressData) => {
    try {
        const response = await fetch("http://localhost:3000/api/promotionProgress", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                playerId,
                ...progressData,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Promotion progress sent:", result);
    } catch (error) {
        console.error("Failed to send promotion progress:", error);
    }
};
```

### Frontend Integration

```javascript
// React component example
const PromotionProgressBar = () => {
    const [progress, setProgress] = useState(0);
    const [canClaim, setCanClaim] = useState(false);
    const [remainingTO, setRemainingTO] = useState(0);

    useEffect(() => {
        const socket = io("http://localhost:3000");

        socket.on("promotionProgress", (data) => {
            setProgress(data.progress || 0);
            setCanClaim(data.canClaim || false);
            setRemainingTO(data.remainTO || 0);
        });

        return () => socket.disconnect();
    }, []);

    return (
        <div className="promotion-progress">
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p>Remaining: ${remainingTO}</p>
            {canClaim && <button className="claim-btn">Claim Promotion</button>}
        </div>
    );
};
```

## Configuration

### Environment Variables

Ensure these are configured in your environment:

```bash
# Authentication service URL
AUTH_URL=http://auth-service:3000

# Socket.io configuration
SOCKET_PORT=3000
SOCKET_CORS_ORIGIN=http://localhost:3000

# MongoDB connection for socket adapter
MONGODB_URL=mongodb://localhost:27017/notifications
```

### Constants

Event constants are defined in:

-   `src/constants/emit-events.js` - Server-side events
-   `src/constants/client-events.js` - Client-side events

## Troubleshooting

### Common Issues

1. **Player Not Receiving Notifications**:

    - Check if player is connected via WebSocket
    - Verify `playerId` matches `session.playerId`
    - Check authentication token validity

2. **Authentication Failures**:

    - Verify Bearer token format
    - Check auth service availability
    - Validate token expiration

3. **Socket Connection Issues**:
    - Check CORS configuration
    - Verify socket server is running
    - Check network connectivity

### Debug Mode

Enable debug logging for troubleshooting:

```javascript
// Client-side
const socket = io("http://localhost:3000", {
    debug: true,
});

// Server-side logging
console.log("Player connected:", socket.data.session.playerId);
```

## Performance Considerations

-   Notifications are sent only to target player (no broadcasting)
-   Efficient socket lookup using array `find()` method
-   Minimal data transfer with filtered fields
-   No persistence required (real-time notifications only)

## Future Enhancements

Potential improvements for the system:

1. **Bulk Notifications**: Support multiple players in single request
2. **Persistence**: Store notification history
3. **Retry Logic**: Handle offline players
4. **Rate Limiting**: Prevent spam notifications
5. **Analytics**: Track notification delivery rates
