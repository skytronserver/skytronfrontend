// Shared SOS popup/buzzer rules for the SOS pages (dashboard, call list, emcall).
//
// Flow: SOS triggered -> the assigned desk executive is alerted at once ->
// the team lead is alerted only if no desk executive accepted the call within
// 1 minute. The backend decides that and sends escalated=true on the team
// lead's row; the team lead still sees every call in the list without an alert.

const TEAMLEAD_ALERTED_KEY = 'sos_teamlead_alerted_ids';

// Whether a pending-call row should currently show the popup.
export const isSosAlertable = (row) => {
  if (row?.call?.status !== 'pending' || row?.status !== 'pending') return false;
  if (row?.type === 'teamlead') return row?.escalated === true;
  return row?.escalated !== false;
};

const readTeamleadAlerted = () => {
  try {
    const ids = JSON.parse(sessionStorage.getItem(TEAMLEAD_ALERTED_KEY) || '[]');
    return Array.isArray(ids) ? ids : [];
  } catch (e) {
    return [];
  }
};

// Remember team lead alerts for the browser session, so moving between SOS
// pages does not pop the same escalated call up again.
const markTeamleadAlerted = (id) => {
  try {
    const ids = readTeamleadAlerted();
    if (!ids.includes(id)) {
      sessionStorage.setItem(TEAMLEAD_ALERTED_KEY, JSON.stringify([...ids, id].slice(-200)));
    }
  } catch (e) {
    // sessionStorage unavailable: fall back to per-page tracking only
  }
};

// Pick the row that should pop up now, given the rows of the previous poll.
// Desk executive rows ring when they appear (or become pending again); team
// lead rows ring once, when they escalate. Returns null if nothing to ring.
export const findSosRowToAlert = (rows, previousRows, extraFilter = () => true) => {
  const alerted = readTeamleadAlerted();
  const row = (rows || []).find(
    (r) =>
      isSosAlertable(r) &&
      extraFilter(r) &&
      (r.type === 'teamlead'
        ? !alerted.includes(r.id)
        : !(previousRows || []).some((p) => p.id === r.id && isSosAlertable(p)))
  );
  if (row && row.type === 'teamlead') markTeamleadAlerted(row.id);
  return row || null;
};
