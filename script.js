function calculateEMI(principal, annualRate, years) {
  const months = years * 12;
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / months;
  return (
    principal * monthlyRate * Math.pow(1 + monthlyRate, months)
  ) / (Math.pow(1 + monthlyRate, months) - 1);
}

function formatINR(num) {
  return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

document.getElementById('carForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const exShowroom = parseFloat(document.getElementById('exShowroom').value);
  const onRoad = parseFloat(document.getElementById('onRoad').value);
  const tenure = parseInt(document.getElementById('tenure').value, 10);
  const downpayment = parseFloat(document.getElementById('downpayment').value) || 0;
  const annualInsurance = parseFloat(document.getElementById('insurance').value) || 0;
  const annualInterestRate = 9.5;

  if (
    isNaN(exShowroom) || exShowroom <= 0 ||
    isNaN(onRoad) || onRoad <= 0 ||
    isNaN(tenure) || tenure <= 0 ||
    downpayment < 0 ||
    downpayment >= exShowroom ||
    downpayment >= onRoad ||
    annualInsurance < 0
  ) {
    document.getElementById('result').innerHTML = `<p style="color:red;">Please enter valid values. Downpayment must be less than both prices.</p>`;
    return;
  }

  const netExShowroom = exShowroom - downpayment;
  const netOnRoad = onRoad - downpayment;
  const emiExShowroom = calculateEMI(netExShowroom, annualInterestRate, tenure);
  const emiOnRoad = calculateEMI(netOnRoad, annualInterestRate, tenure);
  const residualValueExShowroom = netExShowroom * 0.20;
  const totalInsuranceCost = annualInsurance * (tenure - 1);
  const totalCostExShowroom = (emiExShowroom * tenure * 12) + downpayment + residualValueExShowroom;
  const totalCostOnRoad = (emiOnRoad * tenure * 12) + downpayment + totalInsuranceCost;
  const savings = totalCostOnRoad - totalCostExShowroom;

  document.getElementById('result').innerHTML = `
    <h3>Ex-Showroom Purchase</h3>
    <p><b>EMI:</b> ${formatINR(emiExShowroom)}</p>
    <p><b>Residual Value:</b> ${formatINR(residualValueExShowroom)}</p>
    <p><b>Total Cost (EMI + Downpayment + Residual Value):</b> ${formatINR(totalCostExShowroom)}</p>
    <hr>
    <h3>On-Road Purchase</h3>
    <p><b>EMI:</b> ${formatINR(emiOnRoad)}</p>
    <p><b>Insurance (Years 2-${tenure}):</b> ${formatINR(totalInsuranceCost)}</p>
    <p><b>Total Cost (EMI + Downpayment + Insurance):</b> ${formatINR(totalCostOnRoad)}</p>
    <hr>
    <h3>Comparison</h3>
    <p><b>Savings (On-Road vs Ex-Showroom):</b> ${formatINR(savings)}</p>
  `;
});