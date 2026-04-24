// src/routes/signup.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signUp } from "@/server/auth.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nombre = formData.get("nombre") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Llamamos a la función que ya tienes en auth.functions.ts
      await signUp({ data: { nombre, email, password } });
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Crear Cuenta</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Input name="nombre" placeholder="Nombre completo" required />
        <Input name="email" type="email" placeholder="Correo" required />
        <Input name="password" type="password" placeholder="Contraseña (mín. 8 caracteres)" required />
        <Button type="submit" className="w-full">Registrarse</Button>
      </form>
    </div>
  );
}