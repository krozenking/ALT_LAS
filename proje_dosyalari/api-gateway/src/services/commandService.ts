import { v4 as uuidv4 } from "uuid";
import logger from "../utils/logger";

// Interface for command details
export interface Command {
  id: string;
  userId: string;
  targetSystem: string; // ID or identifier of the target system/runner
  command: string; // The actual command string
  parameters?: Record<string, any>; // Optional parameters
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  submittedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  output?: string; // Command output
  error?: string; // Error message if failed
}

// In-memory store for commands (Replace with a persistent store in production)
const commandStore = new Map<string, Command>();

/**
 * Command Processing Service
 * Handles submission, tracking, and management of commands.
 */
class CommandService {
  /**
   * Submits a new command for execution.
   * @param userId - The ID of the user submitting the command.
   * @param targetSystem - The target system/runner ID.
   * @param command - The command string.
   * @param parameters - Optional command parameters.
   * @returns The newly created command object.
   */
  async submitCommand(
    userId: string,
    targetSystem: string,
    command: string,
    parameters?: Record<string, any>
  ): Promise<Command> {
    const newCommand: Command = {
      id: uuidv4(),
      userId,
      targetSystem,
      command,
      parameters,
      status: "pending",
      submittedAt: new Date(),
    };

    commandStore.set(newCommand.id, newCommand);
    logger.info(`Command submitted: ${newCommand.id} by user ${userId} for system ${targetSystem}`);

    // TODO: Trigger actual command execution via a message queue or direct call to runner service
    // For now, simulate execution start after a short delay
    setTimeout(() => this.startCommandExecution(newCommand.id), 1000);

    return newCommand;
  }

  /**
   * Simulates the start of command execution.
   * @param commandId - The ID of the command to start.
   */
  async startCommandExecution(commandId: string): Promise<void> {
    const command = commandStore.get(commandId);
    if (command && command.status === "pending") {
      command.status = "running";
      command.startedAt = new Date();
      commandStore.set(commandId, command);
      logger.info(`Command execution started: ${commandId}`);

      // Simulate command completion/failure after a delay
      const executionTime = Math.random() * 5000 + 1000; // 1-6 seconds
      setTimeout(() => {
        const shouldFail = Math.random() < 0.2; // 20% chance of failure
        if (shouldFail) {
          this.updateCommandStatus(commandId, "failed", undefined, "Simulated execution error");
        } else {
          this.updateCommandStatus(commandId, "completed", "Simulated command output", undefined);
        }
      }, executionTime);
    }
  }

  /**
   * Retrieves the status and details of a specific command.
   * @param commandId - The ID of the command.
   * @param userId - The ID of the user requesting the status (for ownership check).
   * @returns The command object or null if not found or not authorized.
   */
  async getCommandStatus(commandId: string, userId: string): Promise<Command | null> {
    const command = commandStore.get(commandId);
    // TODO: Add role-based access check (e.g., admin can view any command)
    if (command && command.userId === userId) {
      return command;
    }
    logger.warn(`User ${userId} attempted to access command ${commandId} without permission or command not found.`);
    return null;
  }

  /**
   * Updates the status of a command.
   * (Typically called by the runner/execution system)
   * @param commandId - The ID of the command.
   * @param status - The new status.
   * @param output - Optional command output.
   * @param error - Optional error message.
   */
  async updateCommandStatus(
    commandId: string,
    status: "running" | "completed" | "failed" | "cancelled",
    output?: string,
    error?: string
  ): Promise<void> {
    const command = commandStore.get(commandId);
    if (command) {
      command.status = status;
      if (output) command.output = output;
      if (error) command.error = error;
      if (status === "completed" || status === "failed" || status === "cancelled") {
        command.completedAt = new Date();
      }
      commandStore.set(commandId, command);
      logger.info(`Command status updated: ${commandId} -> ${status}`);
    } else {
      logger.warn(`Attempted to update status for non-existent command: ${commandId}`);
    }
  }

  /**
   * Cancels a pending or running command.
   * @param commandId - The ID of the command to cancel.
   * @param userId - The ID of the user requesting cancellation.
   * @returns True if cancellation was initiated, false otherwise.
   */
  async cancelCommand(commandId: string, userId: string): Promise<boolean> {
    const command = commandStore.get(commandId);
    // TODO: Add role-based access check (e.g., admin can cancel any command)
    if (command && command.userId === userId) {
      if (command.status === "pending" || command.status === "running") {
        // TODO: Send cancellation signal to the actual runner/execution system
        this.updateCommandStatus(commandId, "cancelled", undefined, "Cancelled by user");
        logger.info(`Command cancellation requested: ${commandId} by user ${userId}`);
        return true;
      } else {
        logger.warn(`Attempted to cancel command ${commandId} which is not pending or running.`);
        return false; // Cannot cancel if already completed/failed/cancelled
      }
    } else {
      logger.warn(`User ${userId} attempted to cancel command ${commandId} without permission or command not found.`);
      return false;
    }
  }

  /**
   * Lists commands submitted by a user.
   * @param userId - The ID of the user.
   * @returns An array of command objects.
   */
  async listUserCommands(userId: string): Promise<Command[]> {
    const userCommands: Command[] = [];
    for (const command of commandStore.values()) {
      if (command.userId === userId) {
        userCommands.push(command);
      }
    }
    // Sort by submission date, newest first
    userCommands.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    return userCommands;
  }
}

export default new CommandService();

