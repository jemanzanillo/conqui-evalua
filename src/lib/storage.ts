// Capa abstracta de persistencia. Hoy: localStorage. Mañana: Lovable Cloud.

export type EstadoRequisito = "pendiente" | "completado" | "incompleto";

export type EvaluacionRequisito = {
  estado: EstadoRequisito;
  seleccionados?: string[]; // para tipo "seleccion"
  motivo?: string;
  comentario?: string;
};

export type Aspirante = {
  id: string;
  nombre: string;
  fechaCreacion: string;
};

export type EvaluacionAspirante = Record<string, EvaluacionRequisito>;

const KEY_ASPIRANTES = "gm:aspirantes";
const keyEval = (id: string) => `gm:eval:${id}`;

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export const storage = {
  listAspirantes(): Aspirante[] {
    return safeRead<Aspirante[]>(KEY_ASPIRANTES, []);
  },
  saveAspirantes(list: Aspirante[]) {
    safeWrite(KEY_ASPIRANTES, list);
  },
  getAspirante(id: string): Aspirante | undefined {
    return this.listAspirantes().find((a) => a.id === id);
  },
  addAspirante(nombre: string): Aspirante {
    const a: Aspirante = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      fechaCreacion: new Date().toISOString(),
    };
    const list = this.listAspirantes();
    list.push(a);
    this.saveAspirantes(list);
    return a;
  },
  removeAspirante(id: string) {
    this.saveAspirantes(this.listAspirantes().filter((a) => a.id !== id));
    if (typeof window !== "undefined") window.localStorage.removeItem(keyEval(id));
  },
  getEvaluacion(id: string): EvaluacionAspirante {
    return safeRead<EvaluacionAspirante>(keyEval(id), {});
  },
  saveEvaluacion(id: string, evalData: EvaluacionAspirante) {
    safeWrite(keyEval(id), evalData);
  },
};
