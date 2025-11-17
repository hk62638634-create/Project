import java.io.*;
import java.net.*;
import java.util.*;
import java.util.concurrent.*;

public class ChatServer {
    private static final int PORT = 10026;
    private static Set<ClientHandler> clients = ConcurrentHashMap.newKeySet();

    public static void main(String[] args) {
        System.out.println("Chat Server starting on port " + PORT);
        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            while (true) {
                Socket socket = serverSocket.accept();
                ClientHandler handler = new ClientHandler(socket);
                clients.add(handler);
                new Thread(handler).start();
            }
        } catch (IOException e) {
            System.err.println("Server error: " + e.getMessage());
        }
    }

    public static void broadcast(String message, ClientHandler sender) {
        for (ClientHandler client : clients) {
            if (client != sender) {
                client.sendMessage(message);
            }
        }
    }

    public static void removeClient(ClientHandler client, String username) {
        clients.remove(client);
        String leftMsg = "*** " + username + " has left the chat ***";
        broadcast(leftMsg, null);
        System.out.println(leftMsg);
    }

    public static String getUserList() {
        StringBuilder userList = new StringBuilder("Online users:\n");
        for (ClientHandler c : clients) {
            userList.append("- ").append(c.getUsername()).append("\n");
        }
        return userList.toString();
    }
}

class ClientHandler implements Runnable {
    private Socket socket;
    private BufferedReader reader;
    private PrintWriter writer;
    private String username;

    public ClientHandler(Socket socket) {
        this.socket = socket;
    }

    public void run() {
        try {
            reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            writer = new PrintWriter(socket.getOutputStream(), true);

            writer.println("Enter your username:");
            username = reader.readLine();
            if (username == null || username.trim().isEmpty()) {
                username = "User" + (int)(Math.random()*1000);
            }

            writer.println("Welcome, " + username + "!");
            String joinMsg = "*** " + username + " has joined the chat! ***";
            System.out.println(joinMsg);
            ChatServer.broadcast(joinMsg, this);

            String msg;
            while ((msg = reader.readLine()) != null) {
                if (msg.equalsIgnoreCase("/exit")) {
                    break;
                } else if (msg.equalsIgnoreCase("/users")) {
                    writer.println(ChatServer.getUserList());
                } else if (msg.equalsIgnoreCase("/help")) {
                    writer.println("Commands:\n/users - list users\n/help - this message\n/exit - leave chat");
                } else {
                    String formatted = "[" + new Date() + "] " + username + ": " + msg;
                    System.out.println(formatted);
                    ChatServer.broadcast(formatted, this);
                }
            }
        } catch (IOException e) {
            System.err.println("Connection error with user " + username);
        } finally {
            close();
        }
    }

    public void sendMessage(String msg) {
        writer.println(msg);
    }

    public String getUsername() {
        return username;
    }

    private void close() {
        try {
            if (socket != null) socket.close();
        } catch (IOException ignored) {}
        ChatServer.removeClient(this, username);
    }
}
