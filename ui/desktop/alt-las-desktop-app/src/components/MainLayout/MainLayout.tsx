import React, { useState, useEffect, useCallback, useRef } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import { useHotkeys } from "react-hotkeys-hook";
import CommandBar from "../CommandBar/CommandBar";
import Panel from "../Panel/Panel";
import SettingsPanel from "../SettingsPanel/SettingsPanel";
import { useApiService, CommandResponseData } from "../../services/ApiService";
import { useTheme } from "../../contexts/ThemeContext"; // Import useTheme
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./MainLayout.css";

export interface TaskItem {
  id: string;
  name: string;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

interface CommandOutput {
  id: string;
  timestamp: string;
  command: string;
  status: string;
  output: string | React.ReactNode;
  isError?: boolean;
}

const mockTasks: TaskItem[] = [
  { id: "task-1", name: "Analyze system logs", status: "Pending", createdAt: new Date().toISOString(), description: "Check for errors in the last 24 hours." },
  { id: "task-2", name: "Optimize database queries", status: "In Progress", createdAt: new Date().toISOString(), description: "Improve performance of user-related queries." },
  { id: "task-3", name: "Deploy UI updates", status: "Completed", createdAt: new Date().toISOString(), description: "Push new UI features to production." },
];

const ResponsiveGridLayout = WidthProvider(Responsive);

const MainLayout: React.FC = () => {
  const { getCommandStatus } = useApiService();
  const { operatingMode } = useTheme(); // Get operating mode for context
  const [commandOutputs, setCommandOutputs] = useState<CommandOutput[]>([]);
  const [activeTaskIds, setActiveTaskIds] = useState<Set<string>>(new Set());
  const [tasks, setTasks] = useState<TaskItem[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Refs for panels to enable focusing
  const panelRefs = {
    taskList: useRef<HTMLDivElement>(null),
    mainContent: useRef<HTMLDivElement>(null),
    output: useRef<HTMLDivElement>(null),
    settings: useRef<HTMLDivElement>(null),
  };

  // Hotkeys for focusing panels (Ctrl+Shift+[1-4])
  useHotkeys("ctrl+shift+1", () => panelRefs.taskList.current?.focus(), { preventDefault: true });
  useHotkeys("ctrl+shift+2", () => panelRefs.mainContent.current?.focus(), { preventDefault: true });
  useHotkeys("ctrl+shift+3", () => panelRefs.output.current?.focus(), { preventDefault: true });
  useHotkeys("ctrl+shift+4", () => panelRefs.settings.current?.focus(), { preventDefault: true });
  // Hotkey for focusing command bar (Ctrl+Shift+C)
  // Assuming CommandBar input has an id like "command-bar-input"
  useHotkeys("ctrl+shift+c", () => {
    const commandInput = document.getElementById("command-bar-input");
    commandInput?.focus();
  }, { preventDefault: true });


  const handleNewCommandResponse = useCallback((response: { type: string; payload: any }) => {
    const now = new Date().toLocaleTimeString();
    if (response.type === "command_submitted" && response.payload) {
      const data = response.payload as CommandResponseData;
      setCommandOutputs(prev => [
        {
          id: data.id,
          timestamp: now,
          command: data.message || `Cmd: ${data.id.substring(0,8)}`,
          status: data.status,
          output: `Task ID: ${data.id}, Status: ${data.status}. ALT File: ${data.alt_file || 'N/A'}, Segments: ${data.segments_count || 'N/A'}`,
        },
        ...prev,
      ]);
      if (data.status && (data.status.toLowerCase() === "processing" || data.status.toLowerCase() === "pending" || data.status.toLowerCase() === "running")) {
        setActiveTaskIds(prev => new Set(prev).add(data.id));
        setTasks(prevTasks => [
          { 
            id: data.id, 
            name: data.message || `Task ${data.id.substring(0,10)}...`, 
            status: data.status, 
            createdAt: new Date().toISOString(),
            description: `Command: ${data.message || "Submitted via UI"}`
          },
          ...prevTasks
        ]);
      }
    } else if (response.type === "command_error") {
      setCommandOutputs(prev => [
        {
          id: `err-${Date.now()}`,
          timestamp: now,
          command: "Command Error",
          status: "Error",
          output: <span style={{ color: "var(--error-color, red)" }}>{response.payload || "Unknown error"}</span>,
          isError: true,
        },
        ...prev,
      ]);
    }
  }, []);

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
            setTasks(prevTasks => 
              prevTasks.map(task => 
                task.id === taskId ? { ...task, status: data.status, updatedAt: new Date().toISOString() } : task
              )
            );
            if (data.status && (data.status.toLowerCase() === "processing" || data.status.toLowerCase() === "pending" || data.status.toLowerCase() === "running")) {
              newActiveTaskIds.add(taskId);
            }
          } else {
            newActiveTaskIds.add(taskId);
            console.warn(`Failed to get status for task ${taskId}:`, statusResponse.error);
          }
        } catch (error) {
          console.error(`Error polling status for task ${taskId}:`, error);
          newActiveTaskIds.add(taskId);
        }
      }
      setActiveTaskIds(newActiveTaskIds);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [activeTaskIds, getCommandStatus]);

  const handleTaskSelect = (task: TaskItem) => {
    setSelectedTask(task);
  };

  const initialLayouts: { [key: string]: Layout[] } = {
    lg: [
      { i: "taskList", x: 0, y: 0, w: 3, h: 10, minW: 2, minH: 5 },
      { i: "mainContent", x: 3, y: 0, w: 6, h: 5, minW: 3, minH: 3 },
      { i: "output", x: 3, y: 5, w: 6, h: 5, minW: 3, minH: 2 },
      { i: "settings", x: 9, y: 0, w: 3, h: 10, minW: 2, minH: 5 },
    ],
  };
  const [layouts, setLayouts] = useState(initialLayouts);
  const onLayoutChange = (layout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
    // setLayouts(allLayouts); // Persist layout changes if needed
  };

  return (
    <div className="main-layout-container glassmorphism-theme-active" role="application" aria-label="ALT_LAS Desktop Application">
      <ResponsiveGridLayout
        className="layout panels-area"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={50}
        draggableHandle=".panel-header"
        onLayoutChange={onLayoutChange}
        key={JSON.stringify(layouts.lg.map(l => l.i).sort())}
        aria-label="Main workspace with draggable panels"
      >
        <div key="taskList" className="grid-item" ref={panelRefs.taskList as React.RefObject<HTMLDivElement>}>
          <Panel id="panel-1" title="Task List / Explorer (Ctrl+Shift+1)" ariaLabel="Task list and explorer panel">
            <div className="task-list-content" role="list" aria-label="List of tasks">
              {tasks.length === 0 && <p>No tasks available.</p>}
              {tasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`task-item ${selectedTask?.id === task.id ? 'selected' : ''} status-${task.status.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleTaskSelect(task)}
                  tabIndex={0} // Make task items focusable
                  role="listitem"
                  aria-current={selectedTask?.id === task.id ? "true" : "false"}
                  onKeyDown={(e) => e.key === 'Enter' && handleTaskSelect(task)}
                  aria-label={`Task: ${task.name}, Status: ${task.status}`}
                >
                  <span className="task-name">{task.name}</span>
                  <span className="task-status">{task.status}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div key="mainContent" className="grid-item" ref={panelRefs.mainContent as React.RefObject<HTMLDivElement>}>
          <Panel id="panel-2" title={selectedTask ? `Details: ${selectedTask.name} (Ctrl+Shift+2)` : "Main Content / Editor (Ctrl+Shift+2)"} ariaLabel="Main content or task details panel">
            {selectedTask ? (
              <div className="task-details-content">
                <p><strong>ID:</strong> {selectedTask.id}</p>
                <p><strong>Status:</strong> {selectedTask.status}</p>
                <p><strong>Created:</strong> {new Date(selectedTask.createdAt).toLocaleString()}</p>
                {selectedTask.updatedAt && <p><strong>Updated:</strong> {new Date(selectedTask.updatedAt).toLocaleString()}</p>}
                <p><strong>Description:</strong> {selectedTask.description || "N/A"}</p>
              </div>
            ) : (
              <p>Select a task to view details or this can be an editor area.</p>
            )}
          </Panel>
        </div>
        <div key="output" className="grid-item output-panel-grid-item" ref={panelRefs.output as React.RefObject<HTMLDivElement>}>
          <Panel id="panel-3" title="Output / Logs (Ctrl+Shift+3)" ariaLabel="Command output and logs panel">
            <div className="output-content" aria-live="polite" aria-atomic="false">
              {commandOutputs.length === 0 && <p>No commands processed yet.</p>}
              {commandOutputs.map((out) => (
                <div key={out.id} className={`output-entry ${out.isError ? "error" : ""}`} role="log">
                  <span className="timestamp">[{out.timestamp}]</span>
                  <span className="command-name"> {out.command} (Status: {out.status})</span>
                  <div className="output-data">{typeof out.output === 'string' ? <pre>{out.output}</pre> : out.output}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div key="settings" className="grid-item" ref={panelRefs.settings as React.RefObject<HTMLDivElement>}>
          <Panel id="panel-4" title="Settings / Context (Ctrl+Shift+4)" ariaLabel="Application settings and context panel">
            <SettingsPanel />
          </Panel>
        </div>
      </ResponsiveGridLayout>
      <CommandBar onNewCommandResponse={handleNewCommandResponse} />
    </div>
  );
};

export default MainLayout;

