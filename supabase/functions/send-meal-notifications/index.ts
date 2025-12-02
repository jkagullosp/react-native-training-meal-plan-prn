import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { JWT } from 'npm:google-auth-library@9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('URL_SUPABASE') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Parse Firebase service account
    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT not configured');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // Validate service account has required fields
    if (
      !serviceAccount.client_email ||
      !serviceAccount.private_key ||
      !serviceAccount.project_id
    ) {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT format');
    }

    // Get FCM access token
    const accessToken = await getAccessToken({
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    });

    // Fetch pending notifications
    const { data: notifications, error: notifError } = await supabase.rpc(
      'get_pending_notifications',
    );

    if (notifError) {
      console.error('❌ Error fetching notifications:', notifError);
      throw notifError;
    }

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No pending notifications',
          sent: 0,
          timestamp: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Process each notification
    for (const notif of notifications) {
      // Get user's FCM tokens
      const { data: tokens, error: tokenError } = await supabase
        .from('push_tokens')
        .select('token, platform')
        .eq('user_id', notif.user_id);

      if (tokenError) {
        console.error(
          `❌ Error fetching tokens for user ${notif.user_id}:`,
          tokenError,
        );
        failCount++;
        continue;
      }

      if (!tokens || tokens.length === 0) {
        await supabase
          .from('scheduled_meal_notifications')
          .update({ sent: true })
          .eq('id', notif.id);
        continue;
      }
      // Get emoji for meal type
      const mealEmoji =
        {
          breakfast: '🌅',
          lunch: '🌞',
          dinner: '🌙',
          snack: '🍪',
        }[notif.meal_type] || '🍽️';

      // Send to each device
      for (const tokenRecord of tokens) {
        try {
          const fcmResult = await sendFCMNotification({
            token: tokenRecord.token,
            title: `${mealEmoji} Upcoming ${capitalizeFirst(notif.meal_type)}`,
            body: `Don't forget: ${notif.recipe_title}`,
            data: {
              type: 'meal_reminder',
              notificationId: notif.id,
              mealScheduleId: notif.meal_schedule_id || '',
              mealType: notif.meal_type,
            },
            accessToken,
            projectId: serviceAccount.project_id,
          });

          if (fcmResult.success) {
            successCount++;
          } else {
            failCount++;
          }

          results.push({
            ...fcmResult,
            platform: tokenRecord.platform,
            userId: notif.user_id,
          });
        } catch (fcmError) {
          console.error(
            `   ❌ FCM error for ${tokenRecord.platform}:`,
            fcmError,
          );
          failCount++;
          results.push({
            success: false,
            error: fcmError.message,
            platform: tokenRecord.platform,
            userId: notif.user_id,
          });
        }
      }

      // Mark notification as sent
      const { error: updateError } = await supabase
        .from('scheduled_meal_notifications')
        .update({ sent: true })
        .eq('id', notif.id);

      if (updateError) {
        console.error(
          `⚠️  Error marking notification ${notif.id} as sent:`,
          updateError,
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        total: results.length,
        timestamp: new Date().toISOString(),
        details: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (err) {
    console.error('💥 Edge function error:', err);
    return new Response(
      JSON.stringify({
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});

/**
 * Send FCM notification using HTTP v1 API
 */
async function sendFCMNotification({
  token,
  title,
  body,
  data,
  accessToken,
  projectId,
}) {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  const payload = {
    message: {
      token,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channel_id: 'default',
        },
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            sound: 'default',
            'content-available': 1,
          },
        },
      },
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error('FCM API error response:', result);

    // Handle specific FCM errors
    if (result.error?.code === 404 || result.error?.status === 'NOT_FOUND') {
      return {
        success: false,
        error: 'Invalid or expired FCM token',
        shouldDeleteToken: true,
      };
    }

    return {
      success: false,
      error: result.error?.message || 'Unknown FCM error',
      details: result,
    };
  }

  return { success: true, result };
}

/**
 * Get OAuth2 access token for FCM using service account
 */
function getAccessToken({ clientEmail, privateKey }) {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    jwtClient.authorize((err, tokens) => {
      if (err) {
        console.error('JWT authorization error:', err);
        return reject(err);
      }

      if (!tokens?.access_token) {
        return reject(new Error('No access token received'));
      }

      resolve(tokens.access_token);
    });
  });
}

/**
 * Helper to capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
