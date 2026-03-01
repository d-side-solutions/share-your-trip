function collectLegParticipantIds(leg, results) {
  const ids = new Set();
  for (const car of leg.cars) {
    if (car.driverId && results[car.driverId]) {
      ids.add(car.driverId);
    }
    for (const passId of car.passengerIds) {
      if (results[passId]) {
        ids.add(passId);
      }
    }
  }
  return ids;
}

function computeTransportMetrics(trip) {
  const participantById = {};
  for (const p of trip.participants) {
    participantById[p.id] = p;
  }

  let totalTransportCost = 0;
  let totalParticipantKm = 0;

  for (const leg of trip.legs) {
    const kmTotal = (leg.kmOneWay || 0) * 2;
    const assignedIds = new Set();
    let legCost = 0;

    for (const car of leg.cars) {
      const rate = car.is6Plus ? car.rate6Plus : car.rateNormal;
      legCost += kmTotal * rate;

      if (car.driverId && participantById[car.driverId]) {
        assignedIds.add(car.driverId);
      }
      for (const passId of car.passengerIds) {
        if (participantById[passId]) {
          assignedIds.add(passId);
        }
      }
    }

    const payingCount = [...assignedIds].filter(id => {
      const p = participantById[id];
      if (!p) return false;
      // Leaders are always exempt from transport pricing.
      return p.role !== 'leader' && !p.exemptTransport;
    }).length;

    totalTransportCost += legCost;
    totalParticipantKm += kmTotal * payingCount;
  }

  return {
    totalTransportCost,
    totalParticipantKm,
    pricePerKm: totalParticipantKm > 0 ? totalTransportCost / totalParticipantKm : 0,
  };
}

function computeSummary(trip) {
  const results = {};

  for (const p of trip.participants) {
    results[p.id] = {
      name: p.name,
      role: p.role,
      transportShare: 0,
      expenseShare: 0,
      totalOwed: 0,
      totalPaid: 0,
      balance: 0,
      exemptTransport: p.role === 'leader' ? true : !!p.exemptTransport,
      exemptExpenses: !!p.exemptExpenses,
    };
  }

  const transportMetrics = computeTransportMetrics(trip);
  const pricePerKm = transportMetrics.pricePerKm;
  const legPayingMap = new Map();

  for (const leg of trip.legs) {
    const kmTotal = (leg.kmOneWay || 0) * 2;
    const allParticipantIds = collectLegParticipantIds(leg, results);

    for (const car of leg.cars) {
      const rate = car.is6Plus ? car.rate6Plus : car.rateNormal;
      const carCost = kmTotal * rate;

      if (car.driverId && results[car.driverId]) {
        results[car.driverId].totalPaid += carCost;
      }
    }

    const payingIds = [...allParticipantIds].filter(id => {
      const r = results[id];
      return r && r.role !== 'leader' && !r.exemptTransport;
    });
    legPayingMap.set(leg.id, { kmTotal, payingIds });
  }

  if (pricePerKm > 0) {
    for (const { kmTotal, payingIds } of legPayingMap.values()) {
      for (const id of payingIds) {
        results[id].transportShare += kmTotal * pricePerKm;
      }
    }
  }

  for (const expense of trip.expenses) {
    if (expense.paidById && results[expense.paidById]) {
      results[expense.paidById].totalPaid += expense.amount || 0;
    }

    const splitIds = (expense.splitAmongIds || []).filter(id => {
      const r = results[id];
      return r && !r.exemptExpenses;
    });
    if (splitIds.length > 0 && expense.amount > 0) {
      const perPerson = expense.amount / splitIds.length;
      for (const id of splitIds) {
        results[id].expenseShare += perPerson;
      }
    }
  }

  for (const id in results) {
    const r = results[id];
    r.totalOwed = r.transportShare + r.expenseShare;
    r.balance = r.totalOwed - r.totalPaid;
  }

  return results;
}

function computeTransfers(summaryResults) {
  const debtors = [];
  const creditors = [];

  for (const id in summaryResults) {
    const r = summaryResults[id];
    const bal = Math.round(r.balance * 100) / 100;
    if (bal > 0.01) {
      debtors.push({ id, name: r.name, amount: bal });
    } else if (bal < -0.01) {
      creditors.push({ id, name: r.name, amount: -bal });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let di = 0, ci = 0;

  while (di < debtors.length && ci < creditors.length) {
    const d = debtors[di];
    const c = creditors[ci];
    const transfer = Math.min(d.amount, c.amount);

    if (transfer > 0.01) {
      transfers.push({
        fromId: d.id,
        fromName: d.name,
        toId: c.id,
        toName: c.name,
        amount: Math.round(transfer * 100) / 100,
      });
    }

    d.amount -= transfer;
    c.amount -= transfer;

    if (d.amount < 0.01) di++;
    if (c.amount < 0.01) ci++;
  }

  return transfers;
}

export { computeSummary, computeTransfers, computeTransportMetrics };
