/* Cross-app deep link from the Hub (a separate React bundle at /hub/)
   into the main OmicsLab site's lab workflows — see js/router.js's
   `openLab` query-param handling and js/app.js's startWorkflow(wfId,
   opts). The payload travels as plain JSON in the query string (no
   base64) since it's small and URLSearchParams already percent-encodes
   it; keep it small (pointers, not actual data rows) to stay well
   under URL length limits. */
export function buildLabUrl({ workflowId, datasetSlug, datasetTitle, exerciseId, exerciseTitle, starterConfig }) {
  const params = new URLSearchParams();
  params.set('openLab', workflowId);
  params.set('payload', JSON.stringify({ datasetSlug, datasetTitle, exerciseId, exerciseTitle, starterConfig }));
  return `/?${params.toString()}`;
}

export function openInLab(opts) {
  if (!opts.workflowId) return;
  window.location.href = buildLabUrl(opts);
}
