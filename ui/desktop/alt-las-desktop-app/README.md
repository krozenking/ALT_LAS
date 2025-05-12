# ALT_LAS Desktop Application

## 1. Overview

The ALT_LAS Desktop Application is a sophisticated user interface designed to interact with the ALT_LAS (Artificial Language Technologies - Local Automation System) backend services. It provides a rich, panel-based environment for users to send commands, manage tasks, view results, and configure system behavior. Built with Electron and React, it aims to deliver a modern, responsive, and highly customizable user experience, adhering to the UI/UX improvement plans outlined in the project documentation.

This application allows users to leverage the full power of ALT_LAS, including its various operating modes (Normal, Dream, Explore, Chaos) and persona system, through an intuitive graphical interface.

## 2. Features

- **Dynamic Panel System:** Utilizes `react-grid-layout` for a fully customizable workspace where users can drag, drop, and resize panels to suit their workflow.
- **Command Bar:** A central input for sending commands directly to the ALT_LAS backend.
- **Real-time Output Display:** View results and status updates from commands and tasks in a dedicated output panel.
- **Task List / Explorer:** (Conceptual) A panel intended for managing ongoing tasks or exploring project-related files.
- **Main Content / Editor:** (Conceptual) A flexible primary area for detailed views, editing, or other core interactions.
- **Settings & Context Panel:**
    - **Theme Management:** Switch between Light, Dark, Glassmorphism Dark, and Glassmorphism Light themes.
    - **Operating Mode Selection:** Choose between Normal, Dream, Explore, and Chaos modes to influence backend behavior.
    - **API Configuration:** (Placeholder) Input for setting the API Gateway endpoint.
    - **Contextual Information:** (Conceptual) Display properties or relevant information based on user selections.
- **Glassmorphism Effects:** Modern UI styling with blur and transparency effects, applied conditionally based on the selected theme.
- **API Service Integration:** Connects to the ALT_LAS API Gateway to send commands and fetch results/status.
- **Responsive Design:** Adapts to different screen sizes (though primarily designed for desktop).
- **Error Handling:** Provides feedback for API connection issues and command errors.

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

This command will first build the React application into the `build` folder and then use `electron-builder` to package it into an executable for your current platform (e.g., `.exe` for Windows, `.dmg` for macOS, `.AppImage` or `.deb` for Linux). The output will be in the `dist` folder within `ui/desktop/alt-las-desktop-app`.

## 6. Configuration

-   **API Gateway Endpoint:**
    -   The default API Gateway URL is `http://localhost:3000/api`.
    -   This can be changed (for future development) via the Settings panel (currently a placeholder input).
    -   The application will attempt to connect to this endpoint to send commands and check health status.
    -   Ensure your ALT_LAS API Gateway is running and accessible at the configured URL.

## 7. Usage

-   **Main Interface:** The application presents a multi-panel layout. Panels can be rearranged and resized by dragging their headers or resize handles (if implemented for specific panels).
-   **Command Bar:** Located at the bottom of the screen. Type your commands and press Enter or click "Send". The current Operating Mode is displayed as a hint.
-   **Output Panel:** Displays responses from submitted commands, including task IDs, status updates, and results. Errors will also be shown here.
-   **Settings Panel:**
    -   **Theme Mode:** Select your preferred visual theme from the dropdown.
    -   **Operating Mode:** Select the desired ALT_LAS operating mode. This will be sent with your commands to the backend.
-   **API Connection:** The Command Bar will indicate if the API is disconnected. Check the API Gateway URL in settings and ensure the backend services are running.

## 8. UI/UX Plan Adherence

The development of this UI aims to follow the guidelines and priorities set in `/docs/ui_ux/prioritized_ui_improvements.md`. Key aspects include:

-   **Panel System Usability (Task 1.1, 1.2):** `react-grid-layout` provides the foundation. Enhanced visual feedback (placeholder styling) and keyboard navigation (future enhancement) are part of this.
-   **Glassmorphism Effects (Task 2.1, 2.2):** Implemented via CSS and a theme context. Style guide consistency and WCAG review are ongoing considerations.
-   **Theme System - Mode Integration (Task 3.1):** The `ThemeContext` supports different operating modes, and CSS provides distinct visual cues (e.g., header colors, animations for Chaos mode).
-   **Command Bar - Interaction Feedback (Task 4.1, 4.2):** Loading states and error messages are implemented in the `CommandBar` component.

## 9. Troubleshooting

-   **API Disconnected:**
    -   Ensure the ALT_LAS API Gateway and its dependent services (Segmentation, Runner, Archive) are running correctly.
    -   Verify the API Gateway URL in the Settings panel matches the running service.
    -   Check the application console (View > Toggle Developer Tools in Electron) for network errors.
-   **Application Fails to Start:**
    -   Ensure all dependencies are installed correctly (`npm install`).
    -   Check for errors in the terminal where you ran `npm run electron:dev`.
-   **UI Issues / Errors:**
    -   Open the Developer Tools (usually Ctrl+Shift+I or Cmd+Option+I) to check the console for React or JavaScript errors.

## 10. License

This ALT_LAS Desktop Application is part of the ALT_LAS project, which is open source and intended for both free and commercial use. Please refer to the main project license for specific terms (typically MIT or a similar permissive license).

---

*This README provides a general guide. Specific functionalities and their detailed usage will evolve as development progresses.*
