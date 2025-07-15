# Notification Service Documentation

This directory contains documentation for the Notification Service features and APIs.

## Available Documentation

### [Promotion Progress Guide](./promotion-progress-guide.md)

Complete guide for implementing and using the promotion progress notification system:

-   **HTTP API**: How to send promotion progress notifications
-   **WebSocket Events**: Real-time client notifications
-   **Authentication**: Security and token requirements
-   **Examples**: cURL, JavaScript, React implementations
-   **Testing**: Unit test coverage and examples
-   **Troubleshooting**: Common issues and solutions

## Quick Start

1. **Send Notification**: Use the HTTP endpoint to notify a specific player
2. **Listen for Events**: Connect via WebSocket to receive real-time updates
3. **Handle Responses**: Process filtered data on the client side

## API Endpoints

| Method | Endpoint                 | Description                          |
| ------ | ------------------------ | ------------------------------------ |
| POST   | `/api/promotionProgress` | Send promotion progress notification |

## Socket Events

| Event               | Description                          |
| ------------------- | ------------------------------------ |
| `promotionProgress` | Real-time promotion progress updates |

## Getting Help

-   Check the troubleshooting section in the guides
-   Review unit tests for implementation examples
-   Verify authentication and configuration settings
