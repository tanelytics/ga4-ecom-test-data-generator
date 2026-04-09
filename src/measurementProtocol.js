import { MP_REQUEST_DELAY_MS } from './config.js';

const COLLECT_URL = 'https://www.google-analytics.com/mp/collect';
const DEBUG_URL = 'https://www.google-analytics.com/debug/mp/collect';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildPayload(session) {
  const payload = {
    client_id: session.clientId,
    timestamp_micros: String(session.events[0].timestampMicros),
    consent: { ad_user_data: 'GRANTED', ad_personalization: 'GRANTED' },
    events: session.events.map(e => e.event),
  };
  if (session.userId) {
    payload.user_id = session.userId;
  }
  return payload;
}

async function sendRequest(url, payload, verbose) {
  if (verbose) {
    console.log('\n--- Request payload ---');
    console.log(JSON.stringify(payload, null, 2));
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return response;
}

export async function sendEvents(sessions, { measurementId, apiSecret, dryRun, verbose }) {
  const baseUrl = dryRun ? DEBUG_URL : COLLECT_URL;
  const url = `${baseUrl}?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  let sentCount = 0;
  let errorCount = 0;
  let validationIssues = 0;

  for (const session of sessions) {
    const payload = buildPayload(session);

    let response;
    try {
      response = await sendRequest(url, payload, verbose);
    } catch (err) {
      console.error(`Request failed for client ${session.clientId}: ${err.message}`);
      // Retry once
      await delay(500);
      try {
        response = await sendRequest(url, payload, verbose);
      } catch (retryErr) {
        console.error(`Retry failed: ${retryErr.message}`);
        errorCount++;
        continue;
      }
    }

    if (dryRun) {
      // Debug endpoint returns 200 with JSON validation messages
      const body = await response.json();
      if (body.validationMessages?.length > 0) {
        console.warn(`Validation issues for client ${session.clientId}:`);
        for (const msg of body.validationMessages) {
          console.warn(`  [${msg.validationCode}] ${msg.fieldPath}: ${msg.description}`);
        }
        validationIssues += body.validationMessages.length;
      } else if (verbose) {
        console.log(`  Valid (${session.events.length} events)`);
      }
    } else {
      // Production endpoint returns 204
      if (response.status !== 204) {
        console.error(`Unexpected status ${response.status} for client ${session.clientId}`);
        errorCount++;
      }
    }

    sentCount++;
    await delay(MP_REQUEST_DELAY_MS);
  }

  return { sentCount, errorCount, validationIssues };
}
