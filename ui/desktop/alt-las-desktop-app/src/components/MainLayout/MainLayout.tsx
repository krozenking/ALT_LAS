import React, { useState, useEffect, useCallback } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import CommandBar from "../CommandBar/CommandBar";
import Panel from "../Panel/Panel";
import SettingsPanel from "../SettingsPanel/SettingsPanel";
import { useApiService, CommandResponseData } from "../../services/ApiService";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./MainLayout.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface CommandOutput {
  id: string;
  timestamp: string;
  command: string;
  status: string;
  output: string | React.ReactNode;
  isError?: boolean;
}

const MainLayout: React.FC = () => {
  const { getCommandStatus } = useApiService();
  const [commandOutputs, setCommandOutputs] = useState<CommandOutput[]>([]);
  const [activeTaskIds, setActiveTaskIds] = useState<Set<string>>(new Set());

  const handleNewCommandResponse = useCallback((response: { type: string; payload: any }) => {
    const now = new Date().toLocaleTimeString();
    if (response.type === "command_submitted" && response.payload) {
      const data = response.payload as CommandResponseData;
      setCommandOutputs(prev => [
        ...prev,
        {
          id: data.id,
          timestamp: now,
          command: data.message || "Command Submitted", // Assuming message contains original command or context
          status: data.status,
          output: `Task ID: ${data.id}, Status: ${data.status}. ALT File: ${data.alt_file || 'N/A'}, Segments: ${data.segments_count || 'N/A'}`,
        },
      ]);
      if (data.status && data.status.toLowerCase() === "processing" || data.status.toLowerCase() === "pending" || data.status.toLowerCase() === "running") {
        setActiveTaskIds(prev => new Set(prev).add(data.id));
      }
    } else if (response.type === "command_error") {
      setCommandOutputs(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          timestamp: now,
          command: "Command Error",
          status: "Error",
          output: <span style={{ color: "red" }}>{response.payload || "Unknown error"}</span>,
          isError: true,
        },
      ]);
    }
  }, []);

  // Poll for active task statuses
  useEffect(() => {
    if (activeTaskIds.size === 0) return;

    const intervalId = setInterval(async () => {
      const newActiveTaskIds = new Set<string>();
      for (const taskId of activeTaskIds) {
        try {
          const statusResponse = await getCommandStatus(taskId);
          if (statusResponse.success && statusResponse.data) {
            const data = statusResponse.data;
            setCommandOutputs(prev =>
              prev.map(out =>
                out.id === taskId
                  ? { ...out, status: data.status, output: `Task ID: ${data.id}, Status: ${data.status}. Result: ${JSON.stringify(data.result || data.message || 'Processing...')}` }
                  : out
              )
            );
            if (data.status && (data.status.toLowerCase() === "processing" || data.status.toLowerCase() === "pending" || data.status.toLowerCase() === "running")) {
              newActiveTaskIds.add(taskId);
            }
          } else {
            // Keep polling if error, or handle error specifically
            newActiveTaskIds.add(taskId); 
            console.warn(`Failed to get status for task ${taskId}:`, statusResponse.error);
          }
        } catch (error) {
          console.error(`Error polling status for task ${taskId}:`, error);
          newActiveTaskIds.add(taskId); // Keep polling on error
        }
      }
      setActiveTaskIds(newActiveTaskIds);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, [activeTaskIds, getCommandStatus]);


  const initialLayouts: { [key: string]: Layout[] } = {
    lg: [
      { i: "taskList", x: 0, y: 0, w: 3, h: 10, minW: 2, minH: 4 },
      { i: "mainContent", x: 3, y: 0, w: 6, h: 5, minW: 3, minH: 3 }, // Adjusted height
      { i: "output", x: 3, y: 5, w: 6, h: 5, minW: 3, minH: 2 }, // Adjusted y and height
      { i: "settings", x: 9, y: 0, w: 3, h: 10, minW: 2, minH: 4 },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [layouts, setLayouts] = useState(initialLayouts);

  const onLayoutChange = (layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    // setLayouts(allLayouts); // Persist layout changes if needed
  };

  return (
    <div className="main-layout-container glassmorphism-theme-active">
      <ResponsiveGridLayout
        className="layout panels-area"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={50}
        draggableHandle=".panel-header"
        onLayoutChange={onLayoutChange}
        key={JSON.stringify(layouts.lg.map(l => l.i).sort())}
      >
        <div key="taskList" className="grid-item">
          <Panel title="Task List / Explorer">
            <p>Active Tasks: {activeTaskIds.size}</p>
            {/* TODO: Display a list of active/recent tasks */}
          </Panel>
        </div>
        <div key="mainContent" className="grid-item">
          <Panel title="Main Content / Editor">
            <p>This is the primary content area.</p>
          </Panel>
        </div>
        <div key="output" className="grid-item output-panel-grid-item">
          <Panel title="Output / Results">
            <div className="output-content">
              {commandOutputs.length === 0 && <p>No commands processed yet.</p>}
              {commandOutputs.map((out) => (
                <div key={out.id} className={`output-entry ${out.isError ? "error" : ""}`}>
                  <span className="timestamp">[{out.timestamp}]</span>
                  <span className="command-name"> {out.command} (Status: {out.status})</span>
                  <div className="output-data">{typeof out.output === 'string' ? <pre>{out.output}</pre> : out.output}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div key="settings" className="grid-item">
          <Panel title="Settings / Context">
            <SettingsPanel />
          </Panel>
        </div>
      </ResponsiveGridLayout>
      <CommandBar onNewCommandResponse={handleNewCommandResponse} />
    </div>
  );
};

export default MainLayout;

