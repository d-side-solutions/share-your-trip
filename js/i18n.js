const translations = {
  fr: {
    appTitle: 'Partage de frais de course',
    language: 'Langue',
    french: 'Français',
    english: 'English',

    // Steps
    step: 'Étape',
    stepSetup: 'Configuration',
    stepLegs: 'Trajets',
    stepExpenses: 'Dépenses',
    stepSummary: 'Résumé',
    next: 'Suivant',
    previous: 'Précédent',

    // Setup
    tripName: 'Nom de la course',
    tripNamePlaceholder: 'Ex: Sortie Chamonix',
    tripDate: 'Date',
    participants: 'Participants',
    addParticipant: 'Ajouter un participant',
    participantName: 'Nom du participant',
    roleNormal: 'Participant',
    roleLeader: 'Chef de course',
    roleDeputy: 'Adjoint',
    remove: 'Supprimer',
    minParticipants: 'Au moins 2 participants requis',

    // Legs
    tripLegs: 'Trajets',
    leg: 'Trajet',
    addLeg: 'Ajouter un trajet',
    from: 'Départ',
    to: 'Destination',
    kmOneWay: 'km (aller)',
    kmTotal: 'km (aller-retour)',
    cars: 'Voitures',
    addCar: 'Ajouter une voiture',
    driver: 'Conducteur',
    passengers: 'Passagers',
    is6Plus: '6 places+',
    ratePerKm: 'Tarif/km (CHF)',
    rateNormal: 'Normal',
    rate6Plus: '6 places+',
    selectDriver: 'Sélectionner le conducteur',
    selectPassengers: 'Sélectionner les passagers',
    removeCar: 'Supprimer la voiture',
    removeLeg: 'Supprimer le trajet',
    fetchingRoute: 'Calcul du trajet...',
    routeError: 'Impossible de calculer le trajet',
    carCost: 'Coût voiture',
    legCost: 'Coût total du trajet',
    unassigned: 'Non assignés',
    warningUnassigned: 'Attention: des participants ne sont assignés à aucune voiture',
    searchLocation: 'Rechercher un lieu...',

    // Expenses
    expenses: 'Dépenses',
    addExpense: 'Ajouter une dépense',
    expenseDescription: 'Description',
    expenseDescPlaceholder: 'Ex: Apéro, Parking...',
    amount: 'Montant (CHF)',
    paidBy: 'Payé par',
    splitAmong: 'Réparti entre',
    selectAll: 'Tous',
    selectNone: 'Aucun',
    perPerson: 'par personne',
    removeExpense: 'Supprimer la dépense',
    selectPayer: 'Sélectionner le payeur',

    // Summary
    summary: 'Résumé',
    person: 'Personne',
    role: 'Rôle',
    transportShare: 'Transport',
    expenseShare: 'Dépenses',
    totalOwed: 'Total dû',
    totalPaid: 'Total payé/avancé',
    balance: 'Solde',
    owes: 'doit',
    getsBack: 'reçoit',
    settled: 'soldé',
    suggestedTransfers: 'Transferts suggérés',
    pays: 'paie',
    to2: 'à',
    exportCsv: 'Exporter CSV',
    printPdf: 'Imprimer / PDF',
    noLegs: 'Aucun trajet défini',
    noExpenses: 'Aucune dépense',
    totalTransport: 'Total transport',
    totalExpenses: 'Total dépenses',
    exemptTransport: 'Exempté de transport',

    // Storage
    myTrips: 'Mes courses',
    saveTrip: 'Sauvegarder',
    loadTrip: 'Charger',
    deleteTrip: 'Supprimer',
    newTrip: 'Nouvelle course',
    savedTrips: 'Courses sauvegardées',
    noSavedTrips: 'Aucune course sauvegardée',
    tripSaved: 'Course sauvegardée!',
    confirmDelete: 'Supprimer cette course?',
    untitled: 'Sans titre',

    // API
    apiKey: 'Clé API OpenRouteService',
    apiKeyPlaceholder: 'Entrez votre clé API',
    apiKeyHelp: 'Obtenez une clé gratuite sur openrouteservice.org',
    apiKeySave: 'Enregistrer la clé',
    apiKeyRemove: 'Supprimer la clé',
    apiKeyConfigured: 'Clé API configurée',
    noApiKey: 'Pas de clé API — saisie manuelle des km',
  },

  en: {
    appTitle: 'Trip Cost Sharing',
    language: 'Language',
    french: 'Français',
    english: 'English',

    step: 'Step',
    stepSetup: 'Setup',
    stepLegs: 'Trip Legs',
    stepExpenses: 'Expenses',
    stepSummary: 'Summary',
    next: 'Next',
    previous: 'Previous',

    tripName: 'Trip name',
    tripNamePlaceholder: 'E.g.: Chamonix outing',
    tripDate: 'Date',
    participants: 'Participants',
    addParticipant: 'Add participant',
    participantName: 'Participant name',
    roleNormal: 'Participant',
    roleLeader: 'Trip leader',
    roleDeputy: 'Deputy',
    remove: 'Remove',
    minParticipants: 'At least 2 participants required',

    tripLegs: 'Trip Legs',
    leg: 'Leg',
    addLeg: 'Add a leg',
    from: 'From',
    to: 'To',
    kmOneWay: 'km (one way)',
    kmTotal: 'km (round trip)',
    cars: 'Cars',
    addCar: 'Add a car',
    driver: 'Driver',
    passengers: 'Passengers',
    is6Plus: '6+ seats',
    ratePerKm: 'Rate/km (CHF)',
    rateNormal: 'Normal',
    rate6Plus: '6+ seats',
    selectDriver: 'Select driver',
    selectPassengers: 'Select passengers',
    removeCar: 'Remove car',
    removeLeg: 'Remove leg',
    fetchingRoute: 'Calculating route...',
    routeError: 'Could not calculate route',
    carCost: 'Car cost',
    legCost: 'Total leg cost',
    unassigned: 'Unassigned',
    warningUnassigned: 'Warning: some participants are not assigned to any car',
    searchLocation: 'Search for a location...',

    expenses: 'Expenses',
    addExpense: 'Add an expense',
    expenseDescription: 'Description',
    expenseDescPlaceholder: 'E.g.: Drinks, Parking...',
    amount: 'Amount (CHF)',
    paidBy: 'Paid by',
    splitAmong: 'Split among',
    selectAll: 'All',
    selectNone: 'None',
    perPerson: 'per person',
    removeExpense: 'Remove expense',
    selectPayer: 'Select payer',

    summary: 'Summary',
    person: 'Person',
    role: 'Role',
    transportShare: 'Transport',
    expenseShare: 'Expenses',
    totalOwed: 'Total owed',
    totalPaid: 'Total paid/advanced',
    balance: 'Balance',
    owes: 'owes',
    getsBack: 'gets back',
    settled: 'settled',
    suggestedTransfers: 'Suggested transfers',
    pays: 'pays',
    to2: 'to',
    exportCsv: 'Export CSV',
    printPdf: 'Print / PDF',
    noLegs: 'No legs defined',
    noExpenses: 'No expenses',
    totalTransport: 'Total transport',
    totalExpenses: 'Total expenses',
    exemptTransport: 'Exempt from transport',

    myTrips: 'My trips',
    saveTrip: 'Save',
    loadTrip: 'Load',
    deleteTrip: 'Delete',
    newTrip: 'New trip',
    savedTrips: 'Saved trips',
    noSavedTrips: 'No saved trips',
    tripSaved: 'Trip saved!',
    confirmDelete: 'Delete this trip?',
    untitled: 'Untitled',

    apiKey: 'OpenRouteService API Key',
    apiKeyPlaceholder: 'Enter your API key',
    apiKeyHelp: 'Get a free key at openrouteservice.org',
    apiKeySave: 'Save key',
    apiKeyRemove: 'Remove key',
    apiKeyConfigured: 'API key configured',
    noApiKey: 'No API key — enter km manually',
  }
};

function createI18n(initialLang = null) {
  const lang = initialLang || localStorage.getItem('syt-lang') || 'fr';

  return {
    currentLang: lang,

    t(key) {
      return translations[this.currentLang]?.[key] || translations.fr[key] || key;
    },

    setLang(newLang) {
      if (translations[newLang]) {
        this.currentLang = newLang;
        localStorage.setItem('syt-lang', newLang);
      }
    },

    get langs() {
      return Object.keys(translations);
    }
  };
}

export { createI18n, translations };
