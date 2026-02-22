import { createI18n } from './i18n.js';
import { createRoutingService } from './routing.js';
import { computeSummary, computeTransfers } from './calculator.js';
import {
  saveCurrentTrip, loadCurrentTrip, saveTripToList,
  loadTrips, deleteTripFromList, exportCsv
} from './storage.js';

const { createApp, ref, reactive, computed, watch, nextTick, onMounted } = Vue;

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createEmptyTrip() {
  return {
    id: generateId(),
    name: '',
    date: new Date().toISOString().split('T')[0],
    participants: [],
    legs: [],
    expenses: [],
  };
}

function createParticipant(name = '') {
  return { id: generateId(), name, role: 'normal', exemptTransport: false, exemptExpenses: false };
}

function createLeg() {
  return {
    id: generateId(),
    fromText: '',
    toText: '',
    fromCoords: null,
    toCoords: null,
    kmOneWay: 0,
    cars: [],
  };
}

function createCar() {
  return {
    id: generateId(),
    driverId: '',
    passengerIds: [],
    is6Plus: false,
    rateNormal: 0.70,
    rate6Plus: 0.90,
  };
}

function createExpense() {
  return {
    id: generateId(),
    description: '',
    amount: 0,
    paidById: '',
    splitAmongIds: [],
  };
}

const app = createApp({
  setup() {
    const i18n = reactive(createI18n());
    const routing = createRoutingService();
    const t = (key) => i18n.t(key);

    const currentStep = ref(1);
    const trip = reactive(loadCurrentTrip() || createEmptyTrip());
    const savedTrips = ref(loadTrips());
    const showTripsPanel = ref(false);
    const toastMessage = ref('');
    let toastTimer = null;

    // Autocomplete state
    const autocompleteResults = ref([]);
    const autocompleteField = ref(null); // { legId, field: 'from'|'to' }
    const isFetchingRoute = ref(null); // legId

    function showToast(msg) {
      toastMessage.value = msg;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toastMessage.value = ''; }, 2500);
    }

    // Auto-save on changes
    watch(() => JSON.stringify(trip), () => {
      saveCurrentTrip(trip);
    }, { deep: true });

    // --- STEP 1: Participants ---
    const newParticipantName = ref('');

    function addParticipant() {
      const name = newParticipantName.value.trim();
      if (!name) return;
      trip.participants.push(createParticipant(name));
      newParticipantName.value = '';
    }

    function removeParticipant(id) {
      trip.participants = trip.participants.filter(p => p.id !== id);
      for (const leg of trip.legs) {
        for (const car of leg.cars) {
          if (car.driverId === id) car.driverId = '';
          car.passengerIds = car.passengerIds.filter(pid => pid !== id);
        }
      }
      for (const exp of trip.expenses) {
        if (exp.paidById === id) exp.paidById = '';
        exp.splitAmongIds = exp.splitAmongIds.filter(pid => pid !== id);
      }
    }

    function cycleRole(participant) {
      const roles = ['normal', 'leader', 'deputy'];
      const idx = roles.indexOf(participant.role);
      participant.role = roles[(idx + 1) % roles.length];
      if (participant.role === 'leader' || participant.role === 'deputy') {
        participant.exemptTransport = true;
      } else {
        participant.exemptTransport = false;
        participant.exemptExpenses = false;
      }
    }

    // --- STEP 2: Trip Legs ---
    function addLeg() {
      trip.legs.push(createLeg());
    }

    function removeLeg(id) {
      trip.legs = trip.legs.filter(l => l.id !== id);
    }

    function addCar(leg) {
      leg.cars.push(createCar());
    }

    function removeCar(leg, carId) {
      leg.cars = leg.cars.filter(c => c.id !== carId);
    }

    function togglePassenger(car, participantId) {
      const idx = car.passengerIds.indexOf(participantId);
      if (idx >= 0) {
        car.passengerIds.splice(idx, 1);
      } else {
        car.passengerIds.push(participantId);
      }
    }

    function toggleIs6Plus(car) {
      car.is6Plus = !car.is6Plus;
    }

    function getAvailablePassengers(leg, car) {
      const assignedInOtherCars = new Set();
      for (const c of leg.cars) {
        if (c.id === car.id) continue;
        if (c.driverId) assignedInOtherCars.add(c.driverId);
        for (const pid of c.passengerIds) assignedInOtherCars.add(pid);
      }
      return trip.participants.filter(p =>
        p.id !== car.driverId && !assignedInOtherCars.has(p.id)
      );
    }

    function getUnassignedParticipants(leg) {
      const assigned = new Set();
      for (const car of leg.cars) {
        if (car.driverId) assigned.add(car.driverId);
        for (const pid of car.passengerIds) assigned.add(pid);
      }
      return trip.participants.filter(p => !assigned.has(p.id));
    }

    function legKmTotal(leg) {
      return (leg.kmOneWay || 0) * 2;
    }

    function carCost(car, leg) {
      const rate = car.is6Plus ? car.rate6Plus : car.rateNormal;
      return legKmTotal(leg) * rate;
    }

    function legTotalCost(leg) {
      return leg.cars.reduce((sum, car) => sum + carCost(car, leg), 0);
    }

    // --- Autocomplete & routing ---
    let debounceTimer = null;

    async function onLocationInput(leg, field) {
      clearTimeout(debounceTimer);
      autocompleteResults.value = [];

      const text = field === 'from' ? leg.fromText : leg.toText;
      if (!text || text.length < 3 || !routing.hasApiKey()) {
        autocompleteField.value = null;
        return;
      }

      autocompleteField.value = { legId: leg.id, field };

      debounceTimer = setTimeout(async () => {
        const results = await routing.geocode(text);
        if (autocompleteField.value?.legId === leg.id && autocompleteField.value?.field === field) {
          autocompleteResults.value = results;
        }
      }, 300);
    }

    function selectLocation(leg, field, result) {
      if (field === 'from') {
        leg.fromText = result.label;
        leg.fromCoords = result.coords;
      } else {
        leg.toText = result.label;
        leg.toCoords = result.coords;
      }
      autocompleteResults.value = [];
      autocompleteField.value = null;
      tryFetchDistance(leg);
    }

    function dismissAutocomplete() {
      setTimeout(() => {
        autocompleteResults.value = [];
        autocompleteField.value = null;
      }, 200);
    }

    async function tryFetchDistance(leg) {
      if (!leg.fromCoords || !leg.toCoords) return;
      isFetchingRoute.value = leg.id;
      const km = await routing.getDistance(leg.fromCoords, leg.toCoords);
      isFetchingRoute.value = null;
      if (km != null) {
        leg.kmOneWay = km;
      }
    }

    // --- STEP 3: Expenses ---
    function addExpense() {
      const exp = createExpense();
      exp.splitAmongIds = trip.participants.map(p => p.id);
      trip.expenses.push(exp);
    }

    function removeExpense(id) {
      trip.expenses = trip.expenses.filter(e => e.id !== id);
    }

    function toggleExpenseParticipant(expense, participantId) {
      const idx = expense.splitAmongIds.indexOf(participantId);
      if (idx >= 0) {
        expense.splitAmongIds.splice(idx, 1);
      } else {
        expense.splitAmongIds.push(participantId);
      }
    }

    function selectAllForExpense(expense) {
      expense.splitAmongIds = trip.participants.map(p => p.id);
    }

    function selectNoneForExpense(expense) {
      expense.splitAmongIds = [];
    }

    function expensePerPerson(expense) {
      if (!expense.splitAmongIds.length || !expense.amount) return 0;
      return expense.amount / expense.splitAmongIds.length;
    }

    // --- STEP 4: Summary ---
    const summaryResults = computed(() => computeSummary(trip));
    const transfers = computed(() => computeTransfers(summaryResults.value));

    const totalTransport = computed(() => {
      let total = 0;
      for (const leg of trip.legs) {
        const kmTotal = (leg.kmOneWay || 0) * 2;
        for (const car of leg.cars) {
          const rate = car.is6Plus ? car.rate6Plus : car.rateNormal;
          total += kmTotal * rate;
        }
      }
      return total;
    });

    const totalExpenses = computed(() => {
      return trip.expenses.reduce((s, e) => s + (e.amount || 0), 0);
    });

    function doExportCsv() {
      exportCsv(summaryResults.value, trip, t);
    }

    const whatsappText = ref('');
    const showWhatsappText = ref(false);

    function formatDate(isoDate) {
      if (!isoDate) return '';
      const [y, m, d] = isoDate.split('-');
      return `${d}.${m}.${y}`;
    }

    function doExportText() {
      const lines = [];
      const name = trip.name || t('untitled');
      lines.push(`${name} — ${formatDate(trip.date)}`);

      if (trip.legs.length > 0) {
        lines.push('');
        lines.push(t('tripLegs'));
        for (const leg of trip.legs) {
          const from = leg.fromText || '?';
          const to = leg.toText || '?';
          const kmRt = legKmTotal(leg);
          const nCars = leg.cars.length;
          const carWord = nCars === 1 ? t('carSingular') : t('carPlural');
          const cost = legTotalCost(leg);
          lines.push(`• ${from} → ${to} (${kmRt} km ${t('roundTrip')}) — ${nCars} ${carWord}, ${cost.toFixed(2)} CHF`);
        }
      }

      if (trip.expenses.length > 0) {
        lines.push('');
        lines.push(t('expenses'));
        for (const exp of trip.expenses) {
          const desc = exp.description || '?';
          const payer = exp.paidById ? participantName(exp.paidById) : '?';
          lines.push(`• ${desc}: ${(exp.amount || 0).toFixed(2)} CHF (${t('paidBy').toLowerCase()} ${payer})`);
        }
      }

      lines.push('');
      lines.push(t('summaryPerPerson'));
      for (const p of trip.participants) {
        const s = summaryResults.value[p.id];
        if (!s) continue;

        const roleTxt = p.role === 'leader' ? ` (${t('roleLeader')})` : p.role === 'deputy' ? ` (${t('roleDeputy')})` : '';
        lines.push(`${p.name}${roleTxt}`);

        const transportTxt = s.exemptTransport ? t('exemptTransport').toLowerCase() : `${s.transportShare.toFixed(2)} CHF`;
        const expenseTxt = s.exemptExpenses ? t('exemptExpenses').toLowerCase() : `${s.expenseShare.toFixed(2)} CHF`;
        lines.push(`  ${t('transportShare')}: ${transportTxt} · ${t('expenseShare')}: ${expenseTxt}`);

        let balanceTxt;
        if (Math.abs(s.balance) <= 0.01) {
          balanceTxt = t('settled');
        } else if (s.balance > 0) {
          balanceTxt = `${t('owes')} ${s.balance.toFixed(2)} CHF`;
        } else {
          balanceTxt = `${t('getsBack')} ${Math.abs(s.balance).toFixed(2)} CHF`;
        }
        lines.push(`  ${t('paid')}: ${s.totalPaid.toFixed(2)} CHF · ${t('balance')}: ${balanceTxt}`);
      }

      if (transfers.value.length > 0) {
        lines.push('');
        lines.push(t('suggestedTransfers'));
        for (const tr of transfers.value) {
          lines.push(`• ${tr.fromName} → ${tr.toName}: ${tr.amount.toFixed(2)} CHF`);
        }
      }

      lines.push('');
      lines.push(`${t('totalTransport')}: ${totalTransport.value.toFixed(2)} CHF`);
      lines.push(`${t('totalExpenses')}: ${totalExpenses.value.toFixed(2)} CHF`);
      lines.push(`Total: ${(totalTransport.value + totalExpenses.value).toFixed(2)} CHF`);

      whatsappText.value = lines.join('\n');
      showWhatsappText.value = true;
    }

    async function copyWhatsappText() {
      try {
        await navigator.clipboard.writeText(whatsappText.value);
        showToast(t('copied'));
      } catch {
        const ta = document.createElement('textarea');
        ta.value = whatsappText.value;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast(t('copied'));
      }
    }

    async function doExportImage() {
      const el = document.getElementById('summary-capture');
      if (!el) return;
      try {
        const canvas = await html2canvas(el, {
          backgroundColor: '#f8fafc',
          scale: 2,
          useCORS: true,
        });
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${(trip.name || 'trip').replace(/\s+/g, '_')}_summary.png`;
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
      } catch (err) {
        console.error('Image export failed:', err);
      }
    }

    // --- Storage ---
    function doSaveTrip() {
      saveTripToList(trip);
      savedTrips.value = loadTrips();
      showToast(t('tripSaved'));
    }

    function doLoadTrip(saved) {
      Object.assign(trip, JSON.parse(JSON.stringify(saved)));
      saveCurrentTrip(trip);
      showTripsPanel.value = false;
      currentStep.value = 1;
    }

    function doDeleteTrip(id) {
      if (!confirm(t('confirmDelete'))) return;
      deleteTripFromList(id);
      savedTrips.value = loadTrips();
    }

    function doNewTrip() {
      const empty = createEmptyTrip();
      Object.keys(empty).forEach(k => { trip[k] = empty[k]; });
      saveCurrentTrip(trip);
      currentStep.value = 1;
    }

    // --- API Key ---
    const apiKeyInput = ref('');
    const apiKeyPresent = ref(routing.hasApiKey());
    const hasApiKey = computed(() => apiKeyPresent.value);
    const configHasApiKey = routing.hasConfigKey();

    function saveApiKey() {
      routing.setApiKey(apiKeyInput.value);
      apiKeyPresent.value = true;
      apiKeyInput.value = '';
    }

    function removeApiKey() {
      routing.setApiKey(null);
      apiKeyPresent.value = false;
    }

    // --- Navigation ---
    function canProceed(step) {
      if (step === 1) return trip.participants.length >= 2;
      return true;
    }

    function goToStep(step) {
      if (step >= 1 && step <= 4) currentStep.value = step;
    }

    // --- Language ---
    function setLang(lang) {
      i18n.setLang(lang);
    }

    function participantName(id) {
      return trip.participants.find(p => p.id === id)?.name || '?';
    }

    return {
      t, i18n, currentStep, trip, newParticipantName,
      addParticipant, removeParticipant, cycleRole,
      addLeg, removeLeg, addCar, removeCar,
      togglePassenger, toggleIs6Plus,
      getAvailablePassengers, getUnassignedParticipants,
      legKmTotal, carCost, legTotalCost,
      onLocationInput, selectLocation, dismissAutocomplete,
      autocompleteResults, autocompleteField, isFetchingRoute,
      addExpense, removeExpense, toggleExpenseParticipant,
      selectAllForExpense, selectNoneForExpense, expensePerPerson,
      summaryResults, transfers, totalTransport, totalExpenses,
      doExportCsv, doExportImage,
      doExportText, copyWhatsappText, whatsappText, showWhatsappText,
      savedTrips, showTripsPanel, doSaveTrip, doLoadTrip, doDeleteTrip, doNewTrip,
      toastMessage,
      apiKeyInput, hasApiKey, configHasApiKey, saveApiKey, removeApiKey,
      canProceed, goToStep, setLang, participantName,
    };
  }
});

app.mount('#app');
