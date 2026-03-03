import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const FCM_URL = 'https://fcm.googleapis.com/fcm/send'

serve(async (req) => {
  try {
    const payload = await req.json()
    const { record } = payload
    const { id: alert_id, family_id, message, type, severity } = record

    // 1. Initialize Supabase Admin Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Query tokens for Admins and Monitors in this specific family
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('fcm_token, first_name')
      .eq('family_id', family_id)
      .in('role', ['familyHead', 'monitor'])
      .not('fcm_token', 'is', null)

    if (error) throw error
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: 'No active tokens found for this family circle.' }), { status: 200 })
    }

    const tokens = profiles.map((p: any) => p.fcm_token)
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY')

    // 3. Construct the FCM Payload
    const notificationPayload = {
      registration_ids: tokens,
      priority: "high",
      notification: {
        title: "⚠️ SHIELD ALERT",
        body: message,
        sound: "default",
        android_channel_id: "well_check_shield", // For high-priority handling
      },
      data: {
        alert_id: alert_id,
        type: type,
        severity: severity,
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      }
    }

    // 4. Dispatch to Firebase
    const fcmResponse = await fetch(FCM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `key=${fcmServerKey}`,
      },
      body: JSON.stringify(notificationPayload),
    })

    const fcmResult = await fcmResponse.json()

    return new Response(JSON.stringify({ 
      message: 'Alert broadcasted to family.', 
      success_count: fcmResult.success,
      failure_count: fcmResult.failure 
    }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 400 
    })
  }
})
