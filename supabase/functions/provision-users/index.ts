// Provision real users for the DRJ Casablanca-Settat platform.
// Creates: 1 admin_regional + 2 equipe_regionale + 13 directeur_prefectoral
// (one per prefecture, including Anfa = ANF).
//
// Authorization: header `x-seed-secret: <PROVISION_SEED_SECRET>` (env var).
// Returns the generated credentials ONCE — caller is expected to save them
// (the page downloads them as .xlsx + .json).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-seed-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface AccountSpec {
  email: string;
  full_name: string;
  role: "admin_regional" | "equipe_regionale" | "directeur_prefectoral";
  prefecture_code: string | null;
}

const REGIONAL: AccountSpec[] = [
  { email: "admin@drj-cs.ma", full_name: "Administrateur Régional", role: "admin_regional", prefecture_code: null },
  { email: "equipe1@drj-cs.ma", full_name: "Équipe Régionale 1", role: "equipe_regionale", prefecture_code: null },
  { email: "equipe2@drj-cs.ma", full_name: "Équipe Régionale 2", role: "equipe_regionale", prefecture_code: null },
];

// 13 préfectures (codes alignés sur la migration : 12 historiques + ANF=Anfa)
const PREFECTURE_CODES = [
  "BMR", "ASH", "FMS", "ACH", "SBR", "MED", "MOH",
  "BSL", "JDA", "SBN", "BRC", "STT", "ANF",
];

// Génère un mot de passe robuste (16 chars, lettres/chiffres/symboles "url-safe")
const generatePassword = (): string => {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digit = "23456789";
  const symb = "!@#%&*";
  const all = upper + lower + digit + symb;
  const buf = new Uint32Array(16);
  crypto.getRandomValues(buf);
  // Garantit au moins 1 de chaque catégorie
  const required = [
    upper[buf[0] % upper.length],
    lower[buf[1] % lower.length],
    digit[buf[2] % digit.length],
    symb[buf[3] % symb.length],
  ];
  const rest = Array.from(buf.slice(4)).map((n) => all[n % all.length]);
  const arr = [...required, ...rest];
  // Fisher–Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = buf[i] % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const seedSecret = Deno.env.get("PROVISION_SEED_SECRET");

    if (!supabaseUrl || !serviceKey) {
      return json({ error: "Server misconfigured: SUPABASE_URL or SERVICE_ROLE missing." }, 500);
    }
    if (!seedSecret) {
      return json(
        { error: "PROVISION_SEED_SECRET is not configured. Set it in Cloud → Secrets." },
        503,
      );
    }

    // ===== Authorization =====
    const provided = req.headers.get("x-seed-secret") ?? "";
    // Constant-time-ish comparison (Deno doesn't expose timingSafeEqual on strings)
    if (provided.length !== seedSecret.length || provided !== seedSecret) {
      return json({ error: "Invalid seed secret." }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // ===== Charge la liste des préfectures (id par code) =====
    const { data: prefRows, error: prefErr } = await admin
      .from("prefectures")
      .select("id, code, name_fr, name_ar");
    if (prefErr) return json({ error: `Prefectures: ${prefErr.message}` }, 500);
    const prefByCode = new Map<string, { id: string; name_fr: string; name_ar: string }>();
    (prefRows ?? []).forEach((p: any) => prefByCode.set(p.code, p));

    // Construit la liste complète des comptes à provisionner
    const directors: AccountSpec[] = PREFECTURE_CODES.map((code, i) => ({
      email: `dp.${code.toLowerCase()}@drj-cs.ma`,
      full_name: `Directeur ${prefByCode.get(code)?.name_fr ?? code}`,
      role: "directeur_prefectoral",
      prefecture_code: code,
    }));

    const allAccounts = [...REGIONAL, ...directors];
    const credentials: Array<{
      email: string;
      password: string;
      role: string;
      prefecture_code: string | null;
      prefecture_name: string | null;
      full_name: string;
      status: "created" | "reset" | "error";
      error?: string;
    }> = [];

    for (const acc of allAccounts) {
      const password = generatePassword();
      let status: "created" | "reset" | "error" = "created";
      let userId: string | undefined;
      let errorMsg: string | undefined;

      // 1. Tente la création
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: acc.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: acc.full_name },
      });

      if (createErr) {
        // Probablement existe déjà → on récupère l'id et on reset le mot de passe
        const msg = createErr.message ?? "";
        if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exists")) {
          // Recherche dans profiles (mirror par email)
          const { data: prof } = await admin
            .from("profiles")
            .select("id")
            .eq("email", acc.email)
            .maybeSingle();
          if (prof?.id) {
            userId = prof.id;
            // Reset password
            const { error: updErr } = await admin.auth.admin.updateUserById(prof.id, {
              password,
              email_confirm: true,
            });
            if (updErr) {
              status = "error";
              errorMsg = `update: ${updErr.message}`;
            } else {
              status = "reset";
            }
          } else {
            status = "error";
            errorMsg = "User exists in auth but profile not found.";
          }
        } else {
          status = "error";
          errorMsg = createErr.message;
        }
      } else {
        userId = created.user?.id;
      }

      // 2. Upsert profile + role (si on a un userId)
      let prefId: string | null = null;
      let prefName: string | null = null;
      if (acc.prefecture_code) {
        const p = prefByCode.get(acc.prefecture_code);
        prefId = p?.id ?? null;
        prefName = p?.name_fr ?? acc.prefecture_code;
      }

      if (userId && status !== "error") {
        const { error: upProfileErr } = await admin.from("profiles").upsert({
          id: userId,
          full_name: acc.full_name,
          email: acc.email,
          prefecture_id: prefId,
        });
        if (upProfileErr) {
          status = "error";
          errorMsg = `profile: ${upProfileErr.message}`;
        } else {
          const { error: upRoleErr } = await admin
            .from("user_roles")
            .upsert({ user_id: userId, role: acc.role }, { onConflict: "user_id,role" });
          if (upRoleErr) {
            status = "error";
            errorMsg = `role: ${upRoleErr.message}`;
          }
        }
      }

      credentials.push({
        email: acc.email,
        password,
        role: acc.role,
        prefecture_code: acc.prefecture_code,
        prefecture_name: prefName,
        full_name: acc.full_name,
        status,
        ...(errorMsg ? { error: errorMsg } : {}),
      });
    }

    return json({
      success: true,
      total: credentials.length,
      created: credentials.filter((c) => c.status === "created").length,
      reset: credentials.filter((c) => c.status === "reset").length,
      errors: credentials.filter((c) => c.status === "error").length,
      credentials,
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
