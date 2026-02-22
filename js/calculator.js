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
      isExempt: p.role === 'leader' || p.role === 'deputy',
    };
  }

  for (const leg of trip.legs) {
    const kmTotal = (leg.kmOneWay || 0) * 2;

    const allParticipantIds = new Set();
    let totalLegCost = 0;

    for (const car of leg.cars) {
      const rate = car.is6Plus ? car.rate6Plus : car.rateNormal;
      const carCost = kmTotal * rate;
      totalLegCost += carCost;

      if (car.driverId && results[car.driverId]) {
        results[car.driverId].totalPaid += carCost;
        allParticipantIds.add(car.driverId);
      }

      for (const passId of car.passengerIds) {
        allParticipantIds.add(passId);
      }
    }

    const payingIds = [...allParticipantIds].filter(id => {
      const r = results[id];
      return r && !r.isExempt;
    });

    if (payingIds.length > 0 && totalLegCost > 0) {
      const costPerPerson = totalLegCost / payingIds.length;
      for (const id of payingIds) {
        results[id].transportShare += costPerPerson;
      }
    }
  }

  for (const expense of trip.expenses) {
    if (expense.paidById && results[expense.paidById]) {
      results[expense.paidById].totalPaid += expense.amount || 0;
    }

    const splitIds = expense.splitAmongIds || [];
    if (splitIds.length > 0 && expense.amount > 0) {
      const perPerson = expense.amount / splitIds.length;
      for (const id of splitIds) {
        if (results[id]) {
          results[id].expenseShare += perPerson;
        }
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

export { computeSummary, computeTransfers };
