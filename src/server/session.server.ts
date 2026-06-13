// Server-only: configuración de la sesión cookie encriptada.

export type SessionData = {
  userId?: string;
};

export const SESSION_COOKIE_NAME = "conqui-session";

export function getSessionConfig() {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET debe estar configurada y tener al menos 32 caracteres.");
  }
  return {
    password,
    name: SESSION_COOKIE_NAME,
    maxAge: 60 * 60 * 24 * 30, // 30 días
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    },
  };
}
