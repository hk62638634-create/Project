# Chat Application

A Java-based chat application with a server-client architecture and a WeChat-inspired graphical user interface (GUI). The application enables multiple users to connect to a server, exchange real-time messages, and receive system notifications for user join/leave events. The client features a modern, responsive UI with message bubbles and timestamps.

## Features

- **Real-Time Messaging**: Send and receive messages instantly across connected clients.
- **WeChat-Inspired GUI**: Modern interface with green and gray color scheme, message bubbles, and timestamps.
- **System Notifications**: Displays user join/leave events and system messages in a distinct, centered format.
- **Username Support**: Users can choose usernames, with random names assigned if none provided or cancelled.
- **Commands**:
  - `/users`: List all online users (sent to the requesting client; may not display due to client-side filtering).

  - `/exit`: Disconnect from the server.
- **Responsive Input**: Send messages via Enter key or "Send" button; use Shift+Enter for new lines.
- **Error Handling**: Manages duplicate usernames, empty inputs, and connection issues.
- **Multi-Threaded Server**: Handles multiple clients concurrently using a thread-per-client model.
- **Cross-Platform**: Built in Java, compatible with any system supporting Java SE.

## Technologies Used

- **Java SE**: Core language for both client and server.
- **Swing**: For the client's graphical user interface.
- **Java Networking**: Socket programming for client-server communication.
- **Concurrency**: Concurrent programming for multi-threaded server handling.

## Prerequisites

- **Java Development Kit (JDK)**: Version 8 or higher.
- **IDE**: Optional (e.g., IntelliJ IDEA, Eclipse, or VS Code with Java support) for easier development.
- A computer with network capabilities (for server-client communication).
- Server host should be input , do not provide it the code.
