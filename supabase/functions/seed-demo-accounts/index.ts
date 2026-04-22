import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEMO_ACCOUNTS = [
  { email: 'admin@drj-cs.ma', full_name: 'Administrateur Régional', role: 'admin_regional', prefecture_code: null },
  { email: 'equipe@drj-cs.ma', full_name: 'Équipe Régionale', role: 'equipe_regionale', prefecture_code: null },
  { email: 'directeur@drj-cs.ma', full_name: 'Hassan El Amrani', role: 'directeur_prefectoral', prefecture_code: 'BMR' },
];

// Simple in-memory rate limit (per cold-start instance) — best-effort
const rateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

const isRateLimited = (key: string): boolean => {
  const now = Date.now();
  const hits = (rateLimit.get(key) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  hits.push(now);
  rateLimit.set(key, hits);
  return hits.length > RATE_LIMIT_MAX;
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Rate-limit by IP (defense-in-depth against brute calls)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return jsonResponse({ error: 'Too many requests' }, 429);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const seedSecret = Deno.env.get('DEMO_SEED_SECRET');
    const demoPassword = Deno.env.get('DEMO_ACCOUNT_PASSWORD');

    if (!demoPassword || demoPassword.length < 12) {
      return jsonResponse(
        { error: 'Server not configured: DEMO_ACCOUNT_PASSWORD missing or too short (>=12 chars required).' },
        503,
      );
    }

    // ===== Authorization =====
    // Two acceptable modes:
    // (A) An authenticated admin_regional user (server-side role check via has_role).
    // (B) A bootstrap call providing the X-Seed-Secret header matching DEMO_SEED_SECRET.
    //     The secret-based path is rate-limited and only intended for first-run bootstrap.
    const authHeader = req.headers.get('Authorization');
    const seedHeader = req.headers.get('x-seed-secret');

    let authorized = false;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data: userRes, error: userErr } = await userClient.auth.getUser(token);
      if (!userErr && userRes?.user) {
        const { data: isAdmin } = await userClient.rpc('has_role', {
          _user_id: userRes.user.id,
          _role: 'admin_regional',
        });
        if (isAdmin === true) authorized = true;
      }
    }

    if (!authorized && seedSecret && seedHeader && seedHeader === seedSecret) {
      authorized = true;
    }

    if (!authorized) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    // ===== Seeding =====
    const admin = createClient(supabaseUrl, serviceKey);
    const results: any[] = [];

    for (const acc of DEMO_ACCOUNTS) {
      // Targeted lookup (no full listUsers — avoids leaking user list)
      const { data: existing } = await admin.auth.admin.getUserByEmail?.(acc.email)
        .catch(() => ({ data: null })) ?? { data: null };

      let userId: string | undefined = existing?.user?.id;

      if (!userId) {
        // Fallback: try create; if email exists, query profile by email
        const { data: created, error: createErr } = await admin.auth.admin.createUser({
          email: acc.email,
          password: demoPassword,
          email_confirm: true,
          user_metadata: { full_name: acc.full_name },
        });
        if (createErr) {
          // Likely already exists — look up via profiles (which mirrors auth.users by email)
          const { data: profile } = await admin
            .from('profiles')
            .select('id')
            .eq('email', acc.email)
            .maybeSingle();
          userId = profile?.id;
          if (!userId) {
            results.push({ email: acc.email, status: 'error', error: createErr.message });
            continue;
          }
        } else {
          userId = created.user!.id;
        }
      }

      let prefectureId: string | null = null;
      if (acc.prefecture_code) {
        const { data: pref } = await admin
          .from('prefectures')
          .select('id')
          .eq('code', acc.prefecture_code)
          .maybeSingle();
        prefectureId = pref?.id ?? null;
      }

      await admin.from('profiles').upsert({
        id: userId,
        full_name: acc.full_name,
        email: acc.email,
        prefecture_id: prefectureId,
      });

      await admin.from('user_roles').upsert(
        { user_id: userId, role: acc.role },
        { onConflict: 'user_id,role' },
      );

      results.push({ email: acc.email, status: 'ok' });
    }

    return jsonResponse({ success: true, results });
  } catch (e) {
    return jsonResponse({ error: (e as Error).message }, 500);
  }
});
