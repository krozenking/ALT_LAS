import express, { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import commandService from "../services/commandService";
import { authenticateJWT } from "../middleware/authMiddleware";
import { asyncHandler } from "../middleware/errorMiddleware";
import logger from "../utils/logger";
import { AppError } from "../utils/errors";

const router = express.Router();

// Middleware to extract user ID from authenticated request
const getUserId = (req: Request): string => {
  if (!req.user?.id) {
    throw new AppError("User ID not found in authenticated request", 500);
  }
  return String(req.user.id); // Ensure the ID is always returned as a string
};

// --- Command Routes --- 

/**
 * @swagger
 * /api/commands:
 *   post:
 *     summary: Submit a new command for execution
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetSystem
 *               - command
 *             properties:
 *               targetSystem:
 *                 type: string
 *                 description: ID of the target system/runner
 *               command:
 *                 type: string
 *                 description: The command string to execute
 *               parameters:
 *                 type: object
 *                 description: Optional parameters for the command
 *     responses:
 *       201:
 *         description: Command submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Command"
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticateJWT,
  [
    body("targetSystem").isString().notEmpty().withMessage("Target system ID is required"),
    body("command").isString().notEmpty().withMessage("Command string is required"),
    body("parameters").optional().isObject().withMessage("Parameters must be an object"),
  ],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = getUserId(req);
    const { targetSystem, command, parameters } = req.body;

    const newCommand = await commandService.submitCommand(userId, targetSystem, command, parameters);
    res.status(201).json({ success: true, data: newCommand });
  })
);

/**
 * @swagger
 * /api/commands:
 *   get:
 *     summary: List commands submitted by the current user
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user commands
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Command"
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticateJWT,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = getUserId(req);
    const commands = await commandService.listUserCommands(userId);
    res.status(200).json({ success: true, data: commands });
  })
);

/**
 * @swagger
 * /api/commands/{commandId}:
 *   get:
 *     summary: Get the status and details of a specific command
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commandId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the command to retrieve
 *     responses:
 *       200:
 *         description: Command details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Command"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user does not own the command)
 *       404:
 *         description: Command not found
 */
router.get(
  "/:commandId",
  authenticateJWT,
  [param("commandId").isUUID().withMessage("Invalid Command ID format")],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = getUserId(req);
    const { commandId } = req.params;

    const command = await commandService.getCommandStatus(commandId, userId);

    if (!command) {
      // Distinguish between not found and forbidden based on whether the command exists at all
      // (Requires commandService to potentially check existence without user ID first, or handle here)
      // For simplicity, returning 404 if command is null (could be not found or forbidden)
      return res.status(404).json({ success: false, message: "Command not found or access denied" });
    }

    res.status(200).json({ success: true, data: command });
  })
);

/**
 * @swagger
 * /api/commands/{commandId}:
 *   delete:
 *     summary: Request cancellation of a pending or running command
 *     tags: [Commands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commandId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the command to cancel
 *     responses:
 *       200:
 *         description: Cancellation request accepted
 *       400:
 *         description: Invalid Command ID or command cannot be cancelled (e.g., already completed)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user does not own the command)
 *       404:
 *         description: Command not found
 */
router.delete(
  "/:commandId",
  authenticateJWT,
  [param("commandId").isUUID().withMessage("Invalid Command ID format")],
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userId = getUserId(req);
    const { commandId } = req.params;

    const cancelled = await commandService.cancelCommand(commandId, userId);

    if (!cancelled) {
      // Determine reason for failure (not found, forbidden, wrong state)
      const command = await commandService.getCommandStatus(commandId, userId); // Re-fetch to check state/ownership
      if (!command) {
        return res.status(404).json({ success: false, message: "Command not found or access denied" });
      } else if (command.status !== "pending" && command.status !== "running") {
        return res.status(400).json({ success: false, message: `Command cannot be cancelled in state: ${command.status}` });
      } else {
        // Should not happen if cancelCommand logic is correct, but handle defensively
        return res.status(500).json({ success: false, message: "Failed to cancel command" });
      }
    }

    res.status(200).json({ success: true, message: "Command cancellation requested" });
  })
);

export default router;

