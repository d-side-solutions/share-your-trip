const STORAGE_KEY = 'syt-trips';
const CURRENT_KEY = 'syt-current';

function loadTrips() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTrips(trips) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

function saveCurrentTrip(trip) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(trip));
}

function loadCurrentTrip() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_KEY));
  } catch {
    return null;
  }
}

function saveTripToList(trip) {
  const trips = loadTrips();
  const idx = trips.findIndex(t => t.id === trip.id);
  const copy = JSON.parse(JSON.stringify(trip));
  copy.savedAt = new Date().toISOString();
  if (idx >= 0) {
    trips[idx] = copy;
  } else {
    trips.push(copy);
  }
  saveTrips(trips);
}

function deleteTripFromList(tripId) {
  const trips = loadTrips().filter(t => t.id !== tripId);
  saveTrips(trips);
}

function exportCsv(summaryResults, trip, t) {
  const rows = [];
  rows.push([
    t('person'), t('role'), t('transportShare'),
    t('expenseShare'), t('totalOwed'), t('totalPaid'), t('balance')
  ].join(';'));

  for (const id in summaryResults) {
    const r = summaryResults[id];
    rows.push([
      r.name,
      t(r.role === 'leader' ? 'roleLeader' : r.role === 'deputy' ? 'roleDeputy' : 'roleNormal'),
      r.transportShare.toFixed(2),
      r.expenseShare.toFixed(2),
      r.totalOwed.toFixed(2),
      r.totalPaid.toFixed(2),
      r.balance.toFixed(2),
    ].join(';'));
  }

  const header = `${trip.name || 'Trip'} - ${trip.date || ''}\n\n`;
  const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(trip.name || 'trip').replace(/\s+/g, '_')}_summary.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export {
  loadTrips, saveTrips, saveCurrentTrip, loadCurrentTrip,
  saveTripToList, deleteTripFromList, exportCsv
};
