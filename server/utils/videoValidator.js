export function validateVideoDuration(duration, maxDuration = 30) {
  const dur = Number(duration);
  
  if (!Number.isFinite(dur) || dur <= 0) {
    const err = new Error('Invalid video duration');
    err.statusCode = 400;
    throw err;
  }

  if (dur > maxDuration) {
    const err = new Error(`Video duration exceeds maximum allowed (${maxDuration} seconds). Your video is ${dur.toFixed(1)} seconds.`);
    err.statusCode = 400;
    throw err;
  }

  return true;
}
