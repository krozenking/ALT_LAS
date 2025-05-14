# ALT_LAS Desktop UI

ALT_LAS Desktop UI with innovative drag-and-drop interface and glassmorphism effects.

## Features

- Modern UI with glassmorphism effects
- Drag-and-drop interface for easy interaction
- Built with Electron, React, and TypeScript
- Cross-platform support (Windows, macOS, Linux)

## Development

### Prerequisites

- Node.js 18 or later
- npm 8 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/krozenking/ALT_LAS.git
cd ALT_LAS/alt_las_desktop_ui_hybrid

# Install dependencies
npm install --legacy-peer-deps
```

### Running the Application

```bash
# Start the application in development mode
npm run dev

# Start the application in production mode
npm start
```

### Building the Application

```bash
# Build the application
npm run build

# Package the application
npm run package

# Create installers
npm run make
```

## Project Structure

```
alt_las_desktop_ui_hybrid/
├── dist/                  # Compiled files
├── public/                # Static assets
├── src/                   # Source code
│   ├── main/              # Electron main process
│   ├── preload/           # Preload scripts
│   └── renderer/          # React renderer process
├── package.json           # Project configuration
├── tsconfig.json          # TypeScript configuration
└── webpack.config.js      # Webpack configuration
```

## License

MIT
