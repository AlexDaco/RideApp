import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  username: z
    .string()
    .min(3, "Benutzername muss mindestens 3 Zeichen lang sein")
    .max(20, "Benutzername darf maximal 20 Zeichen lang sein")
    .regex(/^[a-zA-Z0-9_]+$/, "Nur Buchstaben, Zahlen und Unterstriche erlaubt"),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
});

export const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

export const rideSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(100),
  description: z.string().max(500).optional(),
  startLat: z.number().min(45.8).max(47.9),
  startLng: z.number().min(5.9).max(10.5),
  startAddress: z.string().min(1),
  endLat: z.number().min(45.8).max(47.9),
  endLng: z.number().min(5.9).max(10.5),
  endAddress: z.string().min(1),
  distance: z.number().positive().optional(),
  duration: z.number().int().positive().optional(),
});

export const ratingSchema = z.object({
  toUserId: z.string().min(1),
  speedScore: z.number().int().min(1).max(5),
  safetyScore: z.number().int().min(1).max(5),
  comment: z.string().max(300).optional(),
});

export const messageSchema = z.object({
  toUserId: z.string().min(1),
  content: z.string().min(1, "Nachricht darf nicht leer sein").max(1000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RideInput = z.infer<typeof rideSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
