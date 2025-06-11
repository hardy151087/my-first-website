const display = document.getElementById('calc-display');
const previousOperandDisplay = document.querySelector('.previous-operand');

function appendToDisplay(value) {
    display.value += value;
}

function clearDisplay() {
    display.value = '';
    previousOperandDisplay.textContent = '';
}

function backspace() {
    display.value = display.value.toString().slice(0, -1);
}

function calculate() {
    if (display.value === '') return;
    
    try {
        let expression = display.value
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/e/g, 'Math.E')
            .replace(/√/g, 'Math.sqrt')
            .replace(/log/g, 'Math.log10')
            .replace(/\^/g, '**');

        expression = expression.replace(/sin\(/g, 'Math.sin(' + Math.PI / 180 + '*');
        expression = expression.replace(/cos\(/g, 'Math.cos(' + Math.PI / 180 + '*');
        expression = expression.replace(/tan\(/g, 'Math.tan(' + Math.PI / 180 + '*');
        
        previousOperandDisplay.textContent = display.value + '=';
        
        const result = eval(expression);
        display.value = result;

    } catch (error) {
        display.value = 'Error';
        previousOperandDisplay.textContent = '';
    }
}

function scientificFunction(func) {
    display.value += func;
}

function factorial() {
    if (display.value === '') return;
    try {
        let num = parseInt(display.value);
        if (num < 0) {
            display.value = 'Error';
            return;
        }
        if (num === 0) {
            display.value = '1';
            return;
        }
        let result = 1;
        for (let i = 2; i <= num; i++) {
            result *= i;
        }
        display.value = result;
    } catch {
        display.value = 'Error';
    }
}

function calculateEMI() {
    const loanAmount = parseFloat(document.getElementById('loan-amount').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value);
    const loanTenure = parseFloat(document.getElementById('loan-tenure').value);
    const interestType = document.getElementById('interest-type').value;
    const startDate = new Date(document.getElementById('start-date').value);
    if (isNaN(loanAmount) || loanAmount <= 0) { alert('Please enter a valid loan amount'); return; }
    if (isNaN(interestRate) || interestRate <= 0) { alert('Please enter a valid interest rate'); return; }
    if (isNaN(loanTenure) || loanTenure <= 0) { alert('Please enter a valid loan tenure'); return; }
    if (isNaN(startDate.getTime())) { alert('Please select a valid start date'); return; }
    const monthlyInterestRate = interestRate / 12 / 100;
    const numberOfPayments = loanTenure * 12;
    let emi, totalPayment, totalInterest;
    if (interestType === 'reducing') {
        emi = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    } else {
        totalInterest = loanAmount * (interestRate / 100) * loanTenure;
        emi = (loanAmount + totalInterest) / numberOfPayments;
    }
    totalPayment = emi * numberOfPayments;
    totalInterest = totalPayment - loanAmount;
    const payoffDate = new Date(startDate);
    payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);
    document.getElementById('monthly-emi').textContent = '₹' + emi.toFixed(2);
    document.getElementById('total-interest').textContent = '₹' + totalInterest.toFixed(2);
    document.getElementById('total-payment').textContent = '₹' + totalPayment.toFixed(2);
    document.getElementById('payoff-date').textContent = payoffDate.toLocaleDateString();
    generateAmortizationSchedule(loanAmount, interestRate, loanTenure, emi, interestType, startDate);
}
function generateAmortizationSchedule(principal, annualRate, years, emi, interestType, startDate) {
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;
    let balance = principal;
    const tableBody = document.getElementById('amortization-body');
    tableBody.innerHTML = '';
    const tableStartDate = new Date(startDate);
    for (let month = 1; month <= months; month++) {
        let interest, principalPaid;
        if (interestType === 'reducing') {
            interest = balance * monthlyRate;
            principalPaid = emi - interest;
        } else {
            interest = (principal * (annualRate / 100)) / 12;
            principalPaid = emi - interest;
        }
        if (balance - principalPaid < 0) { principalPaid = balance; emi = interest + principalPaid; }
        balance -= principalPaid;
        if (balance < 0.01) balance = 0;
        const currentDate = new Date(tableStartDate);
        currentDate.setMonth(currentDate.getMonth() + month);
        const row = document.createElement('tr');
        row.innerHTML = `<td>${currentDate.toLocaleDateString()}</td><td>₹${emi.toFixed(2)}</td><td>₹${principalPaid.toFixed(2)}</td><td>₹${interest.toFixed(2)}</td><td>₹${balance.toFixed(2)}</td>`;
        tableBody.appendChild(row);
    }
}
function setupApp() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').value = today;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
    document.querySelector('.calculate-btn').addEventListener('click', calculateEMI);
    document.querySelector('.amortization-btn').addEventListener('click', function() {
        const table = document.querySelector('.amortization-table');
        if (table.style.display === 'block') { table.style.display = 'none'; this.textContent = 'Show Amortization Schedule'; } 
        else { table.style.display = 'block'; this.textContent = 'Hide Amortization Schedule'; }
    });
}
setupApp();