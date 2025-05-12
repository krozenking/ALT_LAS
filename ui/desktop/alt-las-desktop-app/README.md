# ALT_LAS Desktop Application

**Version: 2.0 (Enhanced Features)**

## 1. Overview

The ALT_LAS Desktop Application is a sophisticated user interface designed to interact with the ALT_LAS (Artificial Language Technologies - Local Automation System) backend services. It provides a rich, panel-based environment for users to send commands, manage tasks, view results, and configure system behavior. Built with Electron and React, it aims to deliver a modern, responsive, and highly customizable user experience, adhering to the UI/UX improvement plans outlined in the project documentation.

This application allows users to leverage the full power of ALT_LAS, including its various operating modes (Normal, Dream, Explore, Chaos) and persona system, through an intuitive graphical interface. This version includes full user authentication, enhanced panel functionalities, improved accessibility, and more robust backend integration.

## 2. Features

- **Dynamic Panel System:** Utilizes `react-grid-layout` for a fully customizable workspace where users can drag, drop, and resize panels.
    - **Task List / Explorer Panel:** Lists mock tasks, allows selection, and displays task status. New tasks from commands are added here.
    - **Main Content / Details Panel:** Displays details of the selected task or serves as a general content area.
    - **Output / Logs Panel:** Shows real-time command outputs, status updates, and error messages from the backend.
    - **Settings / Context Panel:** Configure application settings.
- **User Authentication:**
    - Secure login form for user authentication (mock backend, uses "admin"/"password").
    - JWT token management via `localStorage`.
    - Logout functionality.
    - Application access restricted to authenticated users.
- **Command Bar:**
    - Central input for sending commands to the ALT_LAS backend.
    - Displays current Operating Mode and selected Persona.
    - Keyboard shortcut (Ctrl+Shift+C) to focus.
    - Disabled if not logged in or API is disconnected.
- **Backend Integration & API Service:**
    - Connects to the ALT_LAS API Gateway (default: `http://localhost:3000/api`).
    - Sends commands with selected Operating Mode and Persona.
    - Fetches command status and results periodically.
    - Displays API connection status.
    - Robust error handling for API calls with user-friendly messages.
- **Theme Management:**
    - Switch between Light, Dark, Glassmorphism Dark, and Glassmorphism Light themes.
    - Selected theme applied globally.
- **Operating Mode Selection:**
    - Choose between Normal, Dream, Explore, and Chaos modes to influence backend behavior.
    - Visual cues in the UI reflect the current operating mode.
- **Persona System:**
    - Select a persona (e.g., Technical Expert, Creative Writer) from the Settings Panel.
    - Selected persona is sent with commands to the backend.
- **Accessibility & Keyboard Navigation:**
    - Panels are focusable (Ctrl+Shift+1 to Ctrl+Shift+4).
    - Command bar input focus (Ctrl+Shift+C).
    - Semantic HTML and ARIA attributes (roles, labels, live regions) for improved screen reader compatibility.
    - Focusable task items in the Task List.
- **Glassmorphism Effects:** Modern UI styling with blur and transparency effects, applied conditionally based on the selected theme.
- **Responsive Design:** Adapts to different screen sizes (primarily designed for desktop).

## 3. Prerequisites

- Node.js (v16.x or later recommended)
- npm (v8.x or later) or yarn

## 4. Installation

1.  **Clone the main ALT_LAS repository (if not already done):
    ```bash
    git clone https://github.com/krozenking/ALT_LAS.git
    cd ALT_LAS
    ```
2.  **Navigate to the desktop application directory:**
    ```bash
    cd ui/desktop/alt-las-desktop-app
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

## 5. Running the Application

### Development Mode

This mode runs the React development server and the Electron app concurrently, allowing for hot reloading.

```bash
npm run electron:dev
```

The application will typically open on `http://localhost:3000` within an Electron window. The developer console will be available for debugging.

### Production Build

To build the application for production (creating an executable):

```bash
npm run electron:build
```

This command will first build the React application into the `build` folder and then use `electron-builder` to package it into an executable for your current platform. The output will be in the `dist` folder within `ui/desktop/alt-las-desktop-app`.

## 6. Configuration

-   **API Gateway Endpoint:**
    -   The default API Gateway URL is `http://localhost:3000/api`.
    -   This can be changed via the input field in the Settings panel. Click "Save" to apply and re-check the connection.
    -   Ensure your ALT_LAS API Gateway is running and accessible at the configured URL.
-   **Mock Login Credentials:** For development and testing, use `username: admin` and `password: password`.

## 7. Usage

1.  **Login:** Upon starting, you will be prompted with a login screen. Use the mock credentials (`admin`/`password`) to proceed.
2.  **Main Interface:** The application presents a multi-panel layout. Panels can be rearranged and resized by dragging their headers.
3.  **Command Bar:** Located at the bottom. Type commands and press Enter or click "Send". The current Operating Mode and Persona are displayed.
4.  **Task List Panel (Ctrl+Shift+1):** Displays active and mock tasks. Click a task to see its details in the Main Content panel.
5.  **Main Content / Details Panel (Ctrl+Shift+2):** Shows details of the selected task. If no task is selected, it acts as a general content area.
6.  **Output / Logs Panel (Ctrl+Shift+3):** Displays responses from submitted commands, including task IDs, status updates, and results. Errors will also be shown here.
7.  **Settings Panel (Ctrl+Shift+4):**
    -   **User Information:** Shows logged-in user and provides a Logout button.
    -   **Theme Mode:** Select your preferred visual theme.
    -   **Operating Mode:** Select the desired ALT_LAS operating mode.
    -   **Persona:** Choose a persona to influence backend command processing.
    -   **API Gateway URL:** View and modify the API endpoint. The connection status is displayed below.
8.  **API Connection:** The Command Bar and Settings Panel will indicate if the API is disconnected. Check the API Gateway URL and ensure backend services are running.

## 8. UI/UX Plan Adherence

The development of this UI aims to follow the guidelines and priorities set in `/docs/ui_ux/prioritized_ui_improvements.md`. Key aspects include:

-   **Panel System Usability (Task 1.1, 1.2):** `react-grid-layout` provides the foundation. Keyboard navigation for panel focus is implemented.
-   **Glassmorphism Effects (Task 2.1, 2.2):** Implemented via CSS and a theme context.
-   **Theme System - Mode Integration (Task 3.1):** The `ThemeContext` supports different operating modes, and CSS provides distinct visual cues.
-   **Command Bar - Interaction Feedback (Task 4.1, 4.2):** Loading states, error messages, and persona/mode display are implemented.

## 9. Troubleshooting

-   **Login Failed:** Ensure you are using the correct mock credentials (`admin`/`password`). For a real backend, check your actual credentials.
-   **API Disconnected:**
    -   Ensure the ALT_LAS API Gateway and its dependent services are running correctly.
    -   Verify the API Gateway URL in the Settings panel.
    -   Check the application console (View > Toggle Developer Tools in Electron) for network errors.
-   **Application Fails to Start:**
    -   Ensure all dependencies are installed (`npm install`).
    -   Check for errors in the terminal where you ran `npm run electron:dev`.
-   **UI Issues / Errors:**
    -   Open the Developer Tools (usually Ctrl+Shift+I or Cmd+Option+I) to check the console for React or JavaScript errors.

## 10. License

This ALT_LAS Desktop Application is part of the ALT_LAS project, which is open source and intended for both free and commercial use. Please refer to the main project license for specific terms.

---

*This README reflects the enhanced features of the application. Further development can include real backend integration for login, more detailed panel contents, and advanced task management features.*
