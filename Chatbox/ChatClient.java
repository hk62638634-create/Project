package com.mycompany.chatclient;
import javax.swing.*;
import javax.swing.border.*;
import java.awt.*;
import java.awt.event.*;
import java.io.*;
import java.net.*;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class ChatClient {
    private JFrame frame;
    private JTextPane chatArea;
    private JTextArea inputField;
    private JButton sendButton;
    private Socket socket;
    private PrintWriter writer;
    private String username;
    private JLabel statusLabel;

    // WeChat-style colors
    private static final Color WECHAT_GREEN = new Color(76, 175, 80);
    private static final Color WECHAT_LIGHT_GRAY = new Color(240, 240, 240);
    private static final Color WECHAT_WHITE = new Color(255, 255, 255);
    private static final Color WECHAT_SELF_BUBBLE = new Color(129, 212, 25);
    private static final Color WECHAT_OTHER_BUBBLE = new Color(255, 255, 255);

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new ChatClient().createGUI());
    }

    public void createGUI() {
        // Set system look and feel
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Main frame
        frame = new JFrame("Chat Client");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(600, 600);
        frame.setMinimumSize(new Dimension(400, 500));
        frame.getContentPane().setBackground(WECHAT_LIGHT_GRAY);

        // Top navigation bar
        JPanel topBar = new JPanel(new BorderLayout());
        topBar.setBackground(WECHAT_GREEN);
        topBar.setPreferredSize(new Dimension(0, 50));
        topBar.setBorder(new EmptyBorder(0, 15, 0, 15));

        JLabel titleLabel = new JLabel("Chat");
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setFont(new Font("Segoe UI", Font.BOLD, 18));
        titleLabel.setHorizontalAlignment(SwingConstants.CENTER);
        topBar.add(titleLabel, BorderLayout.CENTER);

        statusLabel = new JLabel("Connecting...");
        statusLabel.setForeground(Color.WHITE);
        statusLabel.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        topBar.add(statusLabel, BorderLayout.EAST);

        // Chat area panel
        JPanel chatPanel = new JPanel(new BorderLayout());
        chatPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        
        chatArea = new JTextPane();
        chatArea.setEditable(false);
        chatArea.setBackground(WECHAT_LIGHT_GRAY);
        chatArea.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        chatArea.setContentType("text/html");
        chatArea.setText("<html><body style='margin: 0; padding: 10px;'></body></html>");
        JScrollPane chatScroll = new JScrollPane(chatArea);
        chatScroll.setBorder(new LineBorder(new Color(220, 220, 220)));
        chatScroll.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_ALWAYS);
        chatPanel.add(chatScroll, BorderLayout.CENTER);

        // Input panel
        JPanel inputPanel = new JPanel(new BorderLayout(5, 5));
        inputPanel.setBorder(new EmptyBorder(10, 10, 10, 10));
        inputPanel.setBackground(WECHAT_LIGHT_GRAY);

        // Message input field
        inputField = new JTextArea(3, 20);
        inputField.setFont(new Font("Segoe UI", Font.PLAIN, 14));
        inputField.setLineWrap(true);
        inputField.setWrapStyleWord(true);
        inputField.setBorder(new CompoundBorder(
            new LineBorder(new Color(200, 200, 200)),
            new EmptyBorder(8, 10, 8, 10)
        ));
        inputField.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                if (e.getKeyCode() == KeyEvent.VK_ENTER && !e.isShiftDown()) {
                    sendMessage();
                    e.consume();
                }
            }
        });
        inputField.setEnabled(false); // Disabled until connected

        JScrollPane inputScroll = new JScrollPane(inputField);
        inputScroll.setBorder(null);
        inputScroll.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED);

        // Send button panel
        JPanel buttonPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        buttonPanel.setBackground(WECHAT_LIGHT_GRAY);

        // Send button - Completely green with white text, no borders
        sendButton = new JButton("Send");
        sendButton.setFont(new Font("Segoe UI", Font.BOLD, 14));
        sendButton.setBackground(WECHAT_GREEN);
        sendButton.setForeground(Color.WHITE);
        sendButton.setPreferredSize(new Dimension(80, 40));
        sendButton.setFocusPainted(false);
        sendButton.setBorderPainted(false);
        sendButton.setOpaque(true);
        sendButton.setEnabled(false); // Disabled until connected

        buttonPanel.add(sendButton);

        // Assemble input panel
        inputPanel.add(inputScroll, BorderLayout.CENTER);
        inputPanel.add(buttonPanel, BorderLayout.EAST);

        // Assemble main frame
        frame.add(topBar, BorderLayout.NORTH);
        frame.add(chatPanel, BorderLayout.CENTER);
        frame.add(inputPanel, BorderLayout.SOUTH);

        // Welcome message
        appendWelcomeMessage();

        // Event listeners
        sendButton.addActionListener(e -> sendMessage());

        // Window closing handler
        frame.addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                if (socket != null && !socket.isClosed()) {
                    try {
                        writer.println("/exit");
                        socket.close();
                    } catch (IOException ex) {
                        ex.printStackTrace();
                    }
                }
            }
        });

        frame.setVisible(true);
        
        // AUTO-CONNECT
        SwingUtilities.invokeLater(() -> {
            new Thread(() -> {
                try {
                    Thread.sleep(500);
                    SwingUtilities.invokeLater(() -> connectToServer());
                } catch (InterruptedException ex) {
                    ex.printStackTrace();
                }
            }).start();
        });
    }

    private void appendWelcomeMessage() {
        appendMessage("Welcome to Chat", "system");
        appendMessage("Shift+Enter for new lines | Enter to send", "system");
    }

    private void connectToServer() {
        inputField.setEnabled(false);
        sendButton.setEnabled(false);
        statusLabel.setText("Connecting...");

        new Thread(() -> {
            try {
                //Server code : socket = new Socket(xxx.xx.xx.xx);
                writer = new PrintWriter(socket.getOutputStream(), true);

                // Get username with validation
                boolean usernameAccepted = false;
                while (!usernameAccepted) {
                    final String[] tempUsername = new String[1];
                    
                    SwingUtilities.invokeAndWait(() -> {
                        tempUsername[0] = JOptionPane.showInputDialog(
                            frame, 
                            "Enter your username (must be unique):", 
                            "Join Chat", 
                            JOptionPane.PLAIN_MESSAGE
                        );
                    });
                    
                    if (tempUsername[0] == null) {
                        // User cancelled, use random name
                        tempUsername[0] = "User" + (int)(Math.random() * 10000);
                        username = tempUsername[0];
                        writer.println(username);
                        usernameAccepted = true;
                    } else if (tempUsername[0].trim().isEmpty()) {
                        // Empty username, show error and retry
                        SwingUtilities.invokeAndWait(() -> {
                            JOptionPane.showMessageDialog(
                                frame, 
                                "Username cannot be empty. Please enter a username.", 
                                "Invalid Username", 
                                JOptionPane.WARNING_MESSAGE
                            );
                        });
                    } else {
                        // Try the username
                        username = tempUsername[0].trim();
                        writer.println(username);
                        
                        // Wait for server response
                        Thread.sleep(500);
                        usernameAccepted = true;
                    }
                }
                
                // Update UI on success
                SwingUtilities.invokeLater(() -> {
                    statusLabel.setText("Online");
                    inputField.setEnabled(true);
                    sendButton.setEnabled(true);
                    inputField.requestFocus();
                });

                // Start reading messages
                startReadingFromServer();

            } catch (Exception e) {
                SwingUtilities.invokeLater(() -> {
                    statusLabel.setText("Offline");
                    inputField.setEnabled(false);
                });
            }
        }).start();
    }

    private void startReadingFromServer() {
        Thread readThread = new Thread(() -> {
            try {
                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(socket.getInputStream())
                );
                String message;
                while ((message = reader.readLine()) != null) {
                    final String msg = message;
                    SwingUtilities.invokeLater(() -> {
                        // Check for username duplicate error message from server
                        if (msg.contains("Username already taken") || msg.contains("duplicate") || msg.contains("already exists")) {
                            JOptionPane.showMessageDialog(frame, "Username '" + username + "' is already taken. Please restart with a different name.", "Username Taken", JOptionPane.ERROR_MESSAGE);
                            try {
                                socket.close();
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                            return;
                        }
                        
                        // Check for system messages (join/leave notifications)
                        if (msg.contains("has left the chat") || msg.contains("has joined the chat") || msg.contains("joined") || msg.contains("left")) {
                            String cleanMsg = msg.replaceAll("\\[.*?\\]\\s*", "");
                            appendMessage(cleanMsg, "system");
                        } else if (msg.contains("Welcome") && !msg.contains("Enter your username")) {
                            String cleanMsg = msg.replaceAll("\\[.*?\\]\\s*", "");
                            appendMessage(cleanMsg, "system");
                        } else {
                            // Process normal messages
                            if (msg.startsWith(username + ": ")) {
                                appendMessage(msg, "self");
                            } else if (msg.contains(": ")) {
                                appendMessage(msg, "other");
                            }
                        }
                    });
                }
            } catch (IOException e) {
                SwingUtilities.invokeLater(() -> {
                    statusLabel.setText("Offline");
                    inputField.setEnabled(false);
                    sendButton.setEnabled(false);
                });
            }
        });
        readThread.start();
    }

    private void sendMessage() {
        String message = inputField.getText().trim();
        if (message.isEmpty()) return;

        if (writer != null && socket != null && !socket.isClosed()) {
            writer.println(username + ": " + message);
            appendMessage(username + ": " + message, "self");
        } else {
            appendMessage(username + ": " + message + " (local)", "self");
        }

        inputField.setText("");
        inputField.requestFocus();
    }

    private void appendMessage(String text, String type) {
        try {
            String time = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));
            String currentHtml = chatArea.getText();
            
            int bodyStart = currentHtml.indexOf("<body");
            bodyStart = currentHtml.indexOf(">", bodyStart) + 1;
            int bodyEnd = currentHtml.lastIndexOf("</body>");
            String existingContent = currentHtml.substring(bodyStart, bodyEnd);

            String messageHtml;
            switch (type) {
                case "self":
                    // Remove username prefix for self messages
                    String selfMessage = text;
                    if (text.startsWith(username + ": ")) {
                        selfMessage = text.substring(username.length() + 2);
                    }
                    
                    messageHtml = "<div style='margin: 12px 0; padding: 0 10px;'>" +
                                 "<div style='text-align: right; margin-bottom: 3px;'>" +
                                 "<span style='font-size: 13px; color: #333; font-weight: bold; padding: 2px 0;'>" + 
                                 "You <span style='color: #999; font-weight: normal; font-size: 11px;'>( " + time + " )</span>" +
                                 "</span>" +
                                 "</div>" +
                                 "<div style='text-align: right;'>" +
                                 "<span style='background-color: " + toHex(WECHAT_SELF_BUBBLE) + 
                                 "; color: black; padding: 10px 15px; border-radius: 20px; " +
                                 "max-width: 75%; display: inline-block; word-wrap: break-word; " +
                                 "font-size: 14px; line-height: 1.4; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>" +
                                 selfMessage + "</span>" +
                                 "</div>" +
                                 "</div>";
                    break;
                case "other":
                    // Extract only the username and message content
                    String displayText = text;
                    String usernameDisplay = "";
                    
                    // Remove any timestamp patterns like [Fri Nov 07 16:12:34 HKT 2025]
                    String cleanText = text.replaceAll("\\[.*?\\]\\s*", "");
                    
                    if (cleanText.contains(": ")) {
                        int colonIndex = cleanText.indexOf(": ");
                        usernameDisplay = cleanText.substring(0, colonIndex);
                        displayText = cleanText.substring(colonIndex + 2); // Get only the message part after ": "
                        
                        // This handles cases where the message might have the username duplicated
                        if (displayText.startsWith(usernameDisplay + ": ")) {
                            displayText = displayText.substring(usernameDisplay.length() + 2);
                        }
                        
                        messageHtml = "<div style='margin: 12px 0; padding: 0 10px;'>" +
                                     "<div style='text-align: left; margin-bottom: 3px;'>" +
                                     "<span style='font-size: 13px; color: #333; font-weight: bold; padding: 2px 0;'>" + 
                                     usernameDisplay + " <span style='color: #999; font-weight: normal; font-size: 11px;'>( " + time + " )</span>" +
                                     "</span>" +
                                     "</div>" +
                                     "<div style='text-align: left;'>" +
                                     "<span style='background-color: " + toHex(WECHAT_OTHER_BUBBLE) + 
                                     "; color: black; padding: 10px 15px; border-radius: 20px; " +
                                     "max-width: 75%; display: inline-block; word-wrap: break-word; " +
                                     "font-size: 14px; line-height: 1.4; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;'>" +
                                     displayText + "</span>" +
                                     "</div>" +
                                     "</div>";
                    } else {
                        messageHtml = "<div style='margin: 12px 0; padding: 0 10px;'>" +
                                     "<div style='text-align: left; margin-bottom: 3px;'>" +
                                     "<span style='font-size: 13px; color: #333; font-weight: bold; padding: 2px 0;'>" + 
                                     "User <span style='color: #999; font-weight: normal; font-size: 11px;'>( " + time + " )</span>" +
                                     "</span>" +
                                     "</div>" +
                                     "<div style='text-align: left;'>" +
                                     "<span style='background-color: " + toHex(WECHAT_OTHER_BUBBLE) + 
                                     "; color: black; padding: 10px 15px; border-radius: 20px; " +
                                     "max-width: 75%; display: inline-block; word-wrap: break-word; " +
                                     "font-size: 14px; line-height: 1.4; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;'>" +
                                     cleanText + "</span>" +
                                     "</div>" +
                                     "</div>";
                    }
                    break;
                case "system":
                    // Only show specific system messages, filter out unwanted ones
                    if (!text.contains("Enter your username")) {
                        // Format system messages without ? symbol for join/leave notifications
                        if (text.contains("has left the chat") || text.contains("has joined the chat")) {
                            messageHtml = "<div style='text-align: center; margin: 15px 0;'>" +
                                         "<span style='color: #999; font-size: 12px; background-color: #f8f8f8; " +
                                         "padding: 6px 16px; border-radius: 12px; font-style: italic;'>" + 
                                         text + "</span>" +
                                         "</div>";
                        } else {
                            // Regular system messages with ? symbol
                            messageHtml = "<div style='text-align: center; margin: 15px 0;'>" +
                                         "<span style='color: #999; font-size: 12px; background-color: #f8f8f8; " +
                                         "padding: 6px 16px; border-radius: 12px; font-style: italic;'>" + 
                                         "? " + text + "</span>" +
                                         "</div>";
                        }
                    } else {
                        return; // Don't show "Enter your username" messages
                    }
                    break;
                default:
                    messageHtml = "<div style='margin: 10px 0; padding: 8px 12px; background-color: white; " +
                                 "border-radius: 8px; border-left: 3px solid #ccc;'>" + text + "</div>";
            }

            String newHtml = currentHtml.substring(0, bodyStart) +
                            existingContent + messageHtml +
                            currentHtml.substring(bodyEnd);

            chatArea.setText(newHtml);
            chatArea.setCaretPosition(chatArea.getDocument().getLength());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private String toHex(Color color) {
        return String.format("#%02x%02x%02x", 
                           color.getRed(), 
                           color.getGreen(), 
                           color.getBlue());
    }

}
