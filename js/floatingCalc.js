function initializeFloatingCalculator() {
    const calculatorContainer = document.getElementById('calculatorContainer');
    const floatingBtn = document.getElementById('floatingCalculatorBtn');
    const display = document.getElementById('calculatorCurrentInput');
    const historyDisplay = document.getElementById('calculatorHistory');
    const buttons = document.querySelectorAll('.calc-btn');

    let currentInput = '0';
    let operator = null;
    let previousInput = null;
    let history = [];
    let shouldResetDisplay = false;

    const updateDisplay = () => {
        if (currentInput === 'Error') {
            display.textContent = 'Error';
            return;
        }
        let integerPart = '0';
        let decimalPart = undefined;

        if (typeof currentInput === 'string') {
             [integerPart, decimalPart] = currentInput.split('.');
        } else if (currentInput !== null) {
            [integerPart, decimalPart] = String(currentInput).split('.');
        }

        let formattedInteger;
        try {
            if (integerPart && !integerPart.includes('e') && (integerPart.length > 15 || integerPart.length < -15)) {
                 formattedInteger = BigInt(integerPart).toLocaleString('en-US');
            } else {
                 formattedInteger = parseFloat(integerPart || '0').toLocaleString('en-US');
            }
        } catch (e) {
            formattedInteger = 'Error';
        }

        if (formattedInteger === 'NaN') formattedInteger = '0';

        if (decimalPart !== undefined) {
            display.textContent = `${formattedInteger}.${decimalPart}`;
        } else {
            display.textContent = formattedInteger;
        }
    };

    const updateHistory = () => {
        historyDisplay.innerHTML = history.slice(-3).map(item => `<div>${item}</div>`).join('');
    };

    const getOperatorSymbol = (op) => {
        switch (op) {
            case '+': return '+';
            case '-': return '−';
            case '*': return '×';
            case '/': return '÷';
            default: return '';
        }
    }

    const handleInput = (value) => {
        if (shouldResetDisplay) {
            currentInput = '0';
            shouldResetDisplay = false;
        }

        if (currentInput === '0' && value !== '.') {
            currentInput = value;
        } else {
            if (String(currentInput).length < 20) {
                currentInput += value;
            }
        }
        updateDisplay();
    };

    const handleOperator = (nextOperator) => {
        if (currentInput === 'Error') return;

        const currentValue = parseFloat(currentInput);
        if (isNaN(currentValue)) return;

        if (operator && !shouldResetDisplay) {
            calculate();
            if (currentInput === 'Error') return;
        }

        previousInput = parseFloat(currentInput);
        operator = nextOperator;
        shouldResetDisplay = true;

        let displayValue = Number(previousInput).toLocaleString('en-US');
        display.textContent = `${displayValue} ${getOperatorSymbol(operator)}`;
    };

    const calculate = () => {
        if (operator === null || shouldResetDisplay) {
            return;
        }

        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        if (isNaN(current) || isNaN(prev)) return;

        let result = 0;

        switch (operator) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '*': result = prev * current; break;
            case '/':
                if (current === 0) {
                    currentInput = 'Error';
                    operator = null;
                    previousInput = null;
                    shouldResetDisplay = true;
                    updateDisplay();
                    history.push(`${prev.toLocaleString()} ÷ 0 = Error`);
                    updateHistory();
                    return;
                }
                result = prev / current;
                break;
        }

        const calculationString = `${prev.toLocaleString()} ${getOperatorSymbol(operator)} ${current.toLocaleString()} = ${result.toLocaleString()}`;
        history.push(calculationString);
        updateHistory();

        currentInput = String(result);
        updateDisplay();

        operator = null;
        previousInput = null;
        shouldResetDisplay = true;
    };

    const handleFunction = (func) => {
        if (currentInput === 'Error' && func !== 'AC' && func !== 'c') return;

        switch (func) {
            case 'AC':
            case 'c':
                currentInput = '0';
                operator = null;
                previousInput = null;
                shouldResetDisplay = false;
                history = [];
                updateHistory();
                break;
            case '%':
                if (!shouldResetDisplay) {
                    currentInput = String(parseFloat(currentInput) / 100);
                }
                break;
            case '.':
                if (shouldResetDisplay) {
                    currentInput = '0';
                    shouldResetDisplay = false;
                }
                if (!String(currentInput).includes('.')) {
                    currentInput += '.';
                }
                break;
            case 'Backspace':
                if (shouldResetDisplay) return;
                currentInput = String(currentInput);
                if (currentInput.length > 1) {
                    currentInput = currentInput.slice(0, -1);
                } else {
                    currentInput = '0';
                }
                break;
        }
        updateDisplay();
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const key = button.dataset.key;
            if (!isNaN(key)) {
                handleInput(key);
            } else if (key === '.') {
                handleFunction(key);
            } else if (['+', '-', '*', '/'].includes(key)) {
                handleOperator(key);
            } else if (key === '=' || key === 'Enter') {
                calculate();
            } else {
                handleFunction(key);
            }
        });
    });

    window.addEventListener('keydown', (e) => {
        const targetTagName = e.target.tagName;
        if (targetTagName === 'INPUT' || targetTagName === 'SELECT' || targetTagName === 'TEXTAREA') {
            return;
        }

        const key = e.key;
        let button;
        if (key === 'Enter') {
            button = document.querySelector(`.calc-btn[data-key="="]`);
        } else {
            button = document.querySelector(`.calc-btn[data-key="${key}"]`);
        }

        if (button) {
            e.preventDefault();
            button.click();
        }
    });

    floatingBtn.addEventListener('click', () => {
        calculatorContainer.classList.toggle('open');
    });

    updateDisplay();
}