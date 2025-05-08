// src/routes/userRoutes.ts
import express, { Request, Response, NextFunction } from "express";
import userService from "../services/userService";
import { authenticateJWT, authorizeRoles } from "../middleware/authMiddleware";
import { NotFoundError, BadRequestError, ForbiddenError } from "../utils/errors";
import logger from "../utils/logger";
import bcrypt from "bcrypt"; // bcrypt kütüphanesini import et

const router = express.Router();

// Middleware to apply JWT authentication to all user routes
router.use(authenticateJWT);

// GET /api/v1/users - List all users (Admin only)
router.get("/", authorizeRoles("admin"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userService.getAllUsers();
    // Omit sensitive data if necessary before sending
    res.json(users.map(({ ...user }) => user)); // Simple mapping for now
  } catch (error) {
    logger.error("Tüm kullanıcıları getirirken hata:", error);
    next(error);
  }
});

// POST /api/v1/users - Create a new user (Admin only, or allow self-registration depending on policy)
router.post("/", authorizeRoles("admin"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add validation for request body here (e.g., using Joi or express-validator)
    const { username, email, password, roles, firstName, lastName } = req.body; // password alanını request body'den al
    if (!username || !email || !password) { // password kontrolünü ekle
        throw new BadRequestError("Kullanıcı adı, e-posta ve şifre gereklidir");
    }
    if (password.length < 6) {
        throw new BadRequestError("Şifre en az 6 karakter olmalıdır.");
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds); // Şifreyi hashle

    const newUser = await userService.createUser({ 
        username, 
        email, 
        passwordHash, // Hashlenmiş şifreyi gönder
        roles, 
        firstName, 
        lastName 
    });
    // Omit sensitive data if necessary
    const { passwordHash: _, ...userToReturn } = newUser as any; // passwordHash'i yanıttan çıkar
    res.status(201).json(userToReturn);
  } catch (error) {
    logger.error("Kullanıcı oluşturulurken hata:", error);
    next(error);
  }
});

// GET /api/v1/users/:id - Get a specific user (Admin or the user themselves)
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    // Authorization check: Allow admin or the user themselves to view the profile
    if (req.user?.id !== userId && !req.user?.roles?.includes("admin")) {
        return next(new ForbiddenError("Bu kullanıcı profilini görüntüleme yetkiniz yok."));
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      throw new NotFoundError(`ID'si ${userId} olan kullanıcı bulunamadı`);
    }
    // Omit sensitive data if necessary
    const { passwordHash, ...userToReturn } = user as any;
    res.json(userToReturn);
  } catch (error) {
    logger.error(`${req.params.id} ID'li kullanıcı getirilirken hata:`, error);
    next(error);
  }
});

// PUT /api/v1/users/:id - Update a user (Admin or the user themselves)
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    // Authorization check: Allow admin or the user themselves to update the profile
    if (req.user?.id !== userId && !req.user?.roles?.includes("admin")) {
        return next(new ForbiddenError("Bu kullanıcı profilini güncelleme yetkiniz yok."));
    }

    // Add validation for request body here
    const { username, email, roles, firstName, lastName, password } = req.body;
    
    let updateData: any = { username, email, firstName, lastName }; // passwordHash doğrudan güncellenmemeli, özel bir rota olmalı
    
    // Eğer şifre de güncellenmek isteniyorsa (opsiyonel, ayrı bir endpoint daha iyi olabilir)
    if (password) {
        if (password.length < 6) {
            throw new BadRequestError("Yeni şifre en az 6 karakter olmalıdır.");
        }
        const saltRounds = 10;
        updateData.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    if (req.user?.roles?.includes("admin")) {
        if (roles !== undefined) updateData.roles = roles;
        // Admin ayrıca isEmailVerified, isAccountLocked gibi alanları da güncelleyebilir
        if (req.body.isEmailVerified !== undefined) updateData.isEmailVerified = req.body.isEmailVerified;
        if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    }

    const updatedUser = await userService.updateUser(userId, updateData);
    if (!updatedUser) {
        throw new NotFoundError(`ID'si ${userId} olan kullanıcı güncelleme için bulunamadı`);
    }
    const { passwordHash, ...userToReturn } = updatedUser as any;
    res.json(userToReturn);
  } catch (error) {
    logger.error(`${req.params.id} ID'li kullanıcı güncellenirken hata:`, error);
    next(error);
  }
});

// DELETE /api/v1/users/:id - Delete a user (Admin only)
router.delete("/:id", authorizeRoles("admin"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.id;
    await userService.deleteUser(userId);
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    logger.error(`${req.params.id} ID'li kullanıcı silinirken hata:`, error);
    next(error);
  }
});

export default router;

