import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CapsuleRow {
  id: string;
  body: string;
  recipient_email: string;
  recipient_user_id: string | null;
  delivery_date: string;
  delivery_at: string | null;
  title: string | null;
  is_self: boolean;
}

interface ProfileRow {
  id: string;
  email: string;
  expo_push_token: string | null;
  notifications_enabled: boolean;
}

function isCapsuleDue(capsule: CapsuleRow, nowMs: number): boolean {
  if (capsule.delivery_at) {
    return new Date(capsule.delivery_at).getTime() <= nowMs;
  }
  // Date-only fallback: treat delivery_date as end of that calendar day (UTC)
  const endOfDeliveryDay = new Date(`${capsule.delivery_date}T23:59:59.999Z`).getTime();
  return endOfDeliveryDay <= nowMs;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const appUrl = Deno.env.get("APP_URL") ?? "afterward://capsule";
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") ?? "Afterward <onboarding@resend.dev>";

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const resend = new Resend(resendApiKey);

    const nowMs = Date.now();

    const { data: lockedCapsules, error } = await supabase
      .from("capsules")
      .select("*")
      .eq("status", "locked");

    if (error) throw error;

    const locked = (lockedCapsules ?? []) as CapsuleRow[];
    const capsules = locked.filter((c) => isCapsuleDue(c, nowMs));

    const results = [];

    for (const capsule of capsules) {
      try {
        const recipientEmail = capsule.recipient_email.toLowerCase().trim();
        const openUrl = `${appUrl}/${capsule.id}`;

        const deliveryLabel = capsule.delivery_at
          ? new Date(capsule.delivery_at).toLocaleString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })
          : new Date(capsule.delivery_date + "T12:00:00").toLocaleDateString(
              "en-US",
              { month: "long", day: "numeric", year: "numeric" }
            );

        await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          subject: "Something has been waiting for you.",
          html: buildEmailHtml(openUrl, deliveryLabel, capsule.is_self),
        });

        const { data: recipientProfile } = await supabase
          .from("profiles")
          .select("id, email, expo_push_token, notifications_enabled")
          .eq("email", recipientEmail)
          .maybeSingle();

        const profile = recipientProfile as ProfileRow | null;

        if (profile?.id && profile.id !== capsule.recipient_user_id) {
          await supabase
            .from("capsules")
            .update({ recipient_user_id: profile.id })
            .eq("id", capsule.id);
        }

        if (profile?.expo_push_token && profile.notifications_enabled) {
          await sendExpoPush(profile.expo_push_token, capsule.id);
        }

        await supabase
          .from("capsules")
          .update({
            status: "delivered",
            delivered_at: new Date().toISOString(),
          })
          .eq("id", capsule.id);

        results.push({
          id: capsule.id,
          status: "delivered",
          recipient: recipientEmail,
        });
      } catch (err) {
        await supabase
          .from("capsules")
          .update({ status: "failed" })
          .eq("id", capsule.id);

        results.push({
          id: capsule.id,
          status: "failed",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        processed: results.length,
        results,
        debug: {
          lockedTotal: locked.length,
          dueCount: capsules.length,
          now: new Date(nowMs).toISOString(),
          pending: locked
            .filter((c) => !isCapsuleDue(c, nowMs))
            .map((c) => ({
              id: c.id,
              status: "locked",
              recipient: c.recipient_email,
              delivery_at: c.delivery_at,
              delivery_date: c.delivery_date,
              dueInSeconds: c.delivery_at
                ? Math.round(
                    (new Date(c.delivery_at).getTime() - nowMs) / 1000
                  )
                : null,
            })),
          failed: locked.length === 0
            ? (
                await supabase
                  .from("capsules")
                  .select("id, recipient_email, delivery_at, status")
                  .eq("status", "failed")
                  .order("created_at", { ascending: false })
                  .limit(5)
              ).data
            : undefined,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildEmailHtml(
  openUrl: string,
  deliveryLabel: string,
  isSelf: boolean
): string {
  const intro = isSelf
    ? "A message you wrote in the past is ready to be opened."
    : "Someone wrote a message for you in the past. It is ready to be opened.";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background-color:#FAF7F2;font-family:Georgia,serif;margin:0;padding:48px 24px;">
  <div style="max-width:480px;margin:0 auto;text-align:center;">
    <h1 style="color:#2B2A28;font-size:24px;font-weight:400;letter-spacing:0.05em;margin:0 0 32px;">Afterward</h1>
    <p style="color:#2B2A28;font-size:16px;line-height:26px;margin:0 0 16px;">
      ${intro}
    </p>
    <p style="color:#3D4F5C;font-size:14px;margin:0 0 32px;">Sealed until ${deliveryLabel}</p>
    <a href="${openUrl}" style="background-color:#3D4F5C;border-radius:8px;color:#FAF7F2;display:inline-block;font-size:15px;padding:14px 28px;text-decoration:none;">
      Open your capsule
    </a>
  </div>
</body>
</html>`;
}

async function sendExpoPush(token: string, capsuleId: string) {
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: token,
      title: "Something has been waiting for you.",
      body: "A message written in the past is ready to be opened.",
      data: { capsuleId, type: "capsule_delivered" },
      sound: null,
      priority: "default",
      channelId: "delivery",
    }),
  });
}
