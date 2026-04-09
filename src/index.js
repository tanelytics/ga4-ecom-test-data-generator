import { readFileSync } from 'node:fs';
import { SESSIONS_MIN, SESSIONS_MAX, SESSION_WEIGHTS } from './config.js';
import { generateSession } from './sessionGenerator.js';
import { sendEvents } from './measurementProtocol.js';

// Load .env file if present (no npm dependency needed)
try {
  const envFile = readFileSync(new URL('../.env', import.meta.url), 'utf8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch { /* .env file not found — that's fine */ }

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    sessions: (() => {
      const sessionArg = args.find(a => a.startsWith('--sessions='));
      return sessionArg ? parseInt(sessionArg.split('=')[1], 10) : null;
    })(),
  };
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickSessionType() {
  const rand = Math.random();
  let cumulative = 0;
  for (const [type, weight] of Object.entries(SESSION_WEIGHTS)) {
    cumulative += weight;
    if (rand < cumulative) return type;
  }
  return 'browse'; // fallback
}

function distributeStartTimes(count, dayStart, dayEnd) {
  const range = dayEnd - dayStart;
  return Array.from({ length: count }, () =>
    dayStart + Math.floor(Math.random() * range)
  ).sort((a, b) => a - b);
}

async function main() {
  const startTime = Date.now();
  const { dryRun, verbose, sessions: sessionOverride } = parseArgs();

  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!dryRun && (!measurementId || !apiSecret)) {
    console.error('Missing GA4_MEASUREMENT_ID or GA4_API_SECRET environment variables.');
    process.exit(1);
  }

  const sessionCount = sessionOverride || randomBetween(SESSIONS_MIN, SESSIONS_MAX);

  // Day boundaries in UTC (06:00 - 22:00)
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setUTCHours(6, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setUTCHours(22, 0, 0, 0);

  // Convert to microseconds
  const dayStartMicros = dayStart.getTime() * 1000;
  const dayEndMicros = dayEnd.getTime() * 1000;

  // Check 72-hour backdating limit
  const nowMicros = Date.now() * 1000;
  const seventyTwoHoursMicros = 72 * 60 * 60 * 1_000_000;
  if (nowMicros - dayStartMicros > seventyTwoHoursMicros) {
    console.warn('WARNING: Day start is beyond the 72-hour backdating limit. Events may be rejected.');
  }

  // Assign session types, separating refunds to generate last
  const sessionTypes = Array.from({ length: sessionCount }, () => pickSessionType());
  const nonRefundTypes = sessionTypes.filter(t => t !== 'refund');
  const refundTypes = sessionTypes.filter(t => t === 'refund');

  const startTimes = distributeStartTimes(sessionCount, dayStartMicros, dayEndMicros);

  console.log(`Generating ${sessionCount} sessions (${dryRun ? 'DRY RUN' : 'LIVE'})...`);

  // Generate non-refund sessions first so purchases populate completedTransactions
  const allSessions = [];
  let timeIdx = 0;

  for (const type of nonRefundTypes) {
    allSessions.push(generateSession(type, startTimes[timeIdx++]));
  }
  for (const type of refundTypes) {
    allSessions.push(generateSession(type, startTimes[timeIdx++]));
  }

  // Count events by type
  const eventCounts = {};
  let totalEvents = 0;
  for (const session of allSessions) {
    for (const { event } of session.events) {
      eventCounts[event.name] = (eventCounts[event.name] || 0) + 1;
      totalEvents++;
    }
  }

  console.log(`Total events: ${totalEvents}`);
  console.log('Event breakdown:');
  for (const [name, count] of Object.entries(eventCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${name}: ${count}`);
  }

  // Send events
  const { sentCount, errorCount, validationIssues } = await sendEvents(allSessions, {
    measurementId: measurementId || 'G-DEBUG00000',
    apiSecret: apiSecret || 'debug_secret',
    dryRun,
    verbose,
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s. Sent: ${sentCount}, Errors: ${errorCount}${dryRun ? `, Validation issues: ${validationIssues}` : ''}`);

  if (errorCount > 0) process.exit(1);
}

main();
