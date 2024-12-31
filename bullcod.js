let balance = 0;
let bullTokens = 0;
let freeSpins = 0;
let autoSpinActive = false;
let rtpSettings = {
    fruit: 0.84, // 84% RTP для слота "Фрукты"
    mine: 0.86,  // 86% RTP для слота "Шахта"
    jack: 0.88  // 88% RTP для слота "Джек"
};
let hitFrequencySettings = {
    fruit: 0.10, // 10% шанс выигрыша на каждый спин для слота "Фрукты"
    mine: 0.08,  // 8% шанс выигрыша на каждый спин для слота "Шахта"
    jack: 0.12  // 12% шанс выигрыша на каждый спин для слота "Джек"
};

// Функция отображения игры
function showGame(gameType) {
    const gameContainers = document.querySelectorAll('.game-container');
    gameContainers.forEach(container => container.style.display = 'none');

    const activeButton = document.querySelector('.active-nav');
    if (activeButton) {
        activeButton.classList.remove('active-nav');
    }

    const button = document.querySelector(`[onclick="showGame('${gameType}')"]`);
    button.classList.add('active-nav');

    const gameContainer = document.getElementById(`${gameType}-game`);
    gameContainer.style.display = 'block';
}

// Функция пополнения баланса
function depositBalance() {
    // Интеграция с платежной системой через Telegram Кошелек или Many.co
    window.open('https://your-game.com/payment-options', '_blank');
    
    // Обработка подтверждения транзакции через веб-хук или API
    fetch('https://api.corefy.com/payments/<TRANSACTION_ID>')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'paid') {
                // Обновить баланс игрока
                balance += data.amount;
                const balanceElement = document.getElementById('balance');
                balanceElement.textContent = balance.toString();
                alert('Ваш баланс пополнен!');
            }
        });
}

// Функция покупки жетонов Bull
function buyBullTokens() {
    const amount = prompt("Введите количество жетонов Bull, которые вы хотите купить (1 жетон = 10 рублей):");
    if (amount && !isNaN(amount) && amount > 0) {
        const cost = amount * 10;
        if (balance >= cost) {
            balance -= cost;
            bullTokens += parseInt(amount);
            const balanceElement = document.getElementById('balance');
            balanceElement.textContent = balance.toString();
            const bullTokensElement = document.getElementById('bull-tokens');
            bullTokensElement.textContent = bullTokens.toString();
            alert(`Вы купили ${amount} жетонов Bull.`);
        } else {
            alert('Недостаточно средств для покупки жетонов Bull.');
        }
    }
}

// Функция вывода средств
function withdrawBalance() {
    const balanceElement = document.getElementById('balance');
    let balance = parseInt(balanceElement.textContent);
    if (balance >= 500) {
        const amountToWithdraw = balance;
        balance = 0;
        balanceElement.textContent = balance.toString();
        alert(`Вы вывели ${amountToWithdraw} рублей.`);
    } else {
        alert('Недостаточно средств для вывода.');
    }
}

// Функция кручения слотов
function spinSlots(gameType) {
    if (bullTokens < 1) {
        alert('Недостаточно жетонов Bull для прокрутки.');
        return;
    }

    bullTokens -= 1;
    document.getElementById('bull-tokens').textContent = bullTokens.toString();

    // Simulate slot machine spin
    const reels = document.querySelectorAll(`#${gameType}-game .slot-reel`);
    const symbols = reels.querySelectorAll('.symbols .symbol');
    const results = reels.map(reel => {
        const randomIndex = Math.floor(Math.random() * symbols.length);
        return symbols[randomIndex].textContent;
    });

    // Determine win based on hit frequency and RTP
    let win = 0;
    if (determineWin(gameType)) {
        win = getWinAmount(results, gameType);
        balance += win;
        const balanceElement = document.getElementById('balance');
        balanceElement.textContent = balance.toString();
    }

    // Update win display
    const winElement = document.getElementById(`win-${gameType}`);
    winElement.textContent = `Win: ${win} рублей`;

    // Animate the reels (basic example)
    slotsAnimation(results, gameType);

    // Auto spin mechanic
    if (autoSpinActive) {
        setTimeout(() => spinSlots(gameType), 2000);
    }
}

// Функция автоматического кручения
function autoSpin(gameType) {
    autoSpinActive = !autoSpinActive;
    const autoSpinButton = document.querySelector(`#auto-spin-${gameType}`);
    autoSpinButton.textContent = autoSpinActive ? 'Стоп Авто Спин' : 'Авто Спин';
}

// Функция определения выигрыша с учетом RTP
function determineWin(gameType) {
    if (Math.random() < hitFrequencySettings[gameType]) {
        // If a winning combination is hit, check RTP
        if (Math.random() < rtpSettings[gameType] / hitFrequencySettings[gameType]) {
            return true; // Win
        } else {
            return false; // No win
        }
    } else {
        return false; // No win
    }
}

// Функция проверки выигрыша
function checkWin(results, gameType) {
    const paytable = document.querySelector(`#${gameType}-game #paytable-${gameType}`);
    const rows = paytable.querySelectorAll('tr');
    for (let i = 1; i < rows.length; i++) {
        const combination = rows[i].querySelector('td:first-child').textContent;
        if (results.join('') === combination) {
            return true;
        }
    }
    return false;
}

// Функция получения суммы выигрыша
function getWinAmount(results, gameType) {
    const paytable = document.querySelector(`#${gameType}-game #paytable-${gameType}`);
    const rows = paytable.querySelectorAll('tr');
    for (let i = 1; i < rows.length; i++) {
        const combination = rows[i].querySelector('td:first-child').textContent;
        if (results.join('') === combination) {
            return parseInt(rows[i].querySelector('td:last-child').textContent.replace('x', '')) * 10; // Example win amount calculation
        }
    }
    return 0;
}

// Анимация кручения слотов
async function slotsAnimation(results, gameType) {
    playing = true;
    let speed = 20;
    while (playing) {
        const slotsRandom = getSlots(gameType);
        const reels = document.querySelectorAll(`#${gameType}-game .slot-reel`);
        reels.forEach((reel, index) => {
            reel.querySelector('.symbols').innerHTML = slotsRandom.map(slot => `<span class="symbol">${slot}</span>`).join('');
        });
        if (speed >= 1000) {
            reels.forEach((reel, index) => {
                reel.querySelector('.symbols').innerHTML = results.map(slot => `<span class="symbol">${slot}</span>`).join('');
            });
            playing = false;
            break;
        }
        speed += 50;
        await sleep(speed);
    }
}

// Функция получения случайных слотов
function getSlots(gameType) {
    let symbols;
    switch (gameType) {
        case 'fruit':
            symbols = ['🍒', '🍋', '🍉', '🍇', '🍓', '🥝', '🍌', '🍑'];
            break;
        case 'mine':
            symbols = ['💎', '🔷', '💠', '💙', '💚', '💛', '🧡', '❤️'];
            break;
        case 'jack':
            symbols = ['♣️', '♦️', '♥️', '♠️', '7', 'Q', 'A', 'K', 'J'];
            break;
        default:
            symbols = [];
    }
    return symbols.map(() => symbols[Math.ceil(Math.random() * symbols.length - 1)]);
}

// Функция ожидания
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = balance.toString();
    const bullTokensElement = document.getElementById('bull-tokens');
    bullTokensElement.textContent = bullTokens.toString();

    // Обновление кнопок кручения для каждой слот-машины
    document.getElementById('spin-fruit').onclick = () => spinSlots('fruit');
    document.getElementById('spin-mine').onclick = () => spinSlots('mine');
    document.getElementById('spin-jack').onclick = () => spinSlots('jack');

    // Обновление кнопок автоматического кручения для каждой слот-машины
    document.getElementById('auto-spin-fruit').onclick = () => autoSpin('fruit');
    document.getElementById('auto-spin-mine').onclick = () => autoSpin('mine');
    document.getElementById('auto-spin-jack').onclick = () => autoSpin('jack');

    // Валидация данных от Telegram
    if (window.Telegram.WebApp) {
        const initData = window.Telegram.WebApp.initData;
        const userId = initData.user_id;
        const firstName = initData.first_name;
        const lastName = initData.last_name;
        // Использование данных пользователя
    }
});
