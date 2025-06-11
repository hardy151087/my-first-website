// --- Helper functions for degree-based calculations ---
const sin = (deg) => Math.sin(deg * Math.PI / 180);
const cos = (deg) => Math.cos(deg * Math.PI / 180);
const tan = (deg) => Math.tan(deg * Math.PI / 180);
const PI = Math.PI;
const e = Math.E;
const sqrt = Math.sqrt;
const log = Math.log10;
const abs = Math.abs;

function fact(num) {
    if (num < 0) return NaN;
    if (num === 0) return 1;
    let result = 1;
    for (let i = 2; i <= num; i++) result *= i;
    return result;
}

// --- Tab Switching Logic ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// --- Scientific Calculator Logic ---
const calcDisplay = document.getElementById('calc-display');
const previousOperandDisplay = document.querySelector('.previous-operand');

document.querySelector('.buttons').addEventListener('click', (event) => {
    if (!event.target.matches('.btn')) return;

    const button = event.target;
    const value = button.textContent;
    
    if (button.classList.contains('clear')) {
        calcDisplay.value = '';
        previousOperandDisplay.textContent = '';
    } else if (button.classList.contains('delete')) {
        calcDisplay.value = calcDisplay.value.slice(0, -1);
    } else if (button.classList.contains('equals')) {
        try {
            let expression = calcDisplay.value
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/\^/g, '**')
                .replace(/π/g, 'PI');
            
            // Factorial (n!) handling
            expression = expression.replace(/(\d+)!/g, (match, num) => `fact(${num})`);

            previousOperandDisplay.textContent = calcDisplay.value + ' =';
            calcDisplay.value = eval(expression);
        } catch (error) {
            calcDisplay.value = 'Error';
            console.error(error);
        }
    } else if (button.dataset.action === 'factorial') {
         calcDisplay.value += '!';
    }
     else {
        // Replace 'abs(' with 'abs(' to ensure correct function call in eval
        let displayValue = value.replace(/abs\(/, 'abs(');
        calcDisplay.value += displayValue;
    }
});

// --- Advanced EMI Calculator Logic ---
document.getElementById('start-date').value = new Date().toISOString().split('T')[0];
document.querySelector('.calculate-btn').addEventListener('click', calculateEMI);
document.querySelector('.amortization-btn').addEventListener('click', toggleAmortization);

function calculateEMI() {
    const loanAmount = parseFloat(document.getElementById('loan-amount').value);
    const interestRate = parseFloat(document.getElementById('interest-rate').value);
    const loanTenure = parseFloat(document.getElementById('loan-tenure').value);
    const interestType = document.getElementById('interest-type').value;
    const startDate = new Date(document.getElementById('start-date').value);

    if ([loanAmount, interestRate, loanTenure].some(v => isNaN(v) || v <= 0) || isNaN(startDate.getTime())) {
        alert('Please enter valid details for all fields.');
        return;
    }

    const monthlyInterestRate = interestRate / 12 / 100;
    const numberOfPayments = loanTenure * 12;
    let emi, totalPayment, totalInterest;

    if (interestType === 'reducing') {
        emi = (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
        totalPayment = emi * numberOfPayments;
        totalInterest = totalPayment - loanAmount;
    } else { // Fixed Interest
        totalInterest = loanAmount * (interestRate / 100) * loanTenure;
        totalPayment = loanAmount + totalInterest;
        emi = totalPayment / numberOfPayments;
    }

    if (!isFinite(emi)) { alert('Calculation error. Check inputs.'); return; }
    
    const payoffDate = new Date(startDate);
    payoffDate.setMonth(payoffDate.getMonth() + numberOfPayments);

    document.getElementById('monthly-emi').textContent = `₹${emi.toFixed(2)}`;
    document.getElementById('total-interest').textContent = `₹${totalInterest.toFixed(2)}`;
    document.getElementById('total-payment').textContent = `₹${totalPayment.toFixed(2)}`;
    document.getElementById('payoff-date').textContent = payoffDate.toLocaleDateString();
    
    generateAmortizationSchedule(loanAmount, interestRate, loanTenure, emi, interestType, startDate);
}

function generateAmortizationSchedule(principal, annualRate, years, emi, interestType, startDate) {
    const tableBody = document.getElementById('amortization-body');
    tableBody.innerHTML = '';
    let balance = principal;
    const months = years * 12;

    for (let month = 1; month <= months; month++) {
        const currentMonthDate = new Date(startDate);
        currentMonthDate.setMonth(startDate.getMonth() + month);
        
        let interest, principalPaid;
        if (interestType === 'reducing') {
            interest = balance * (annualRate / 12 / 100);
            principalPaid = emi - interest;
        } else {
            interest = (principal * annualRate / 100) / 12;
            principalPaid = emi - interest;
        }
        
        if (balance - principalPaid < 0.01) { principalPaid = balance; }
        balance -= principalPaid;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${currentMonthDate.toLocaleDateString()}</td>
            <td>₹${(interest + principalPaid).toFixed(2)}</td>
            <td>₹${principalPaid.toFixed(2)}</td>
            <td>₹${interest.toFixed(2)}</td>
            <td>₹${balance.toFixed(2)}</td>
        `;
        tableBody.appendChild(row);
    }
}

function toggleAmortization() {
    const table = document.querySelector('.amortization-table');
    const isVisible = table.style.display === 'block';
    table.style.display = isVisible ? 'none' : 'block';
    this.textContent = isVisible ? 'Show Amortization Schedule' : 'Hide Amortization Schedule';
}
