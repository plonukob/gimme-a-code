var memberArray = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9'];
var score = 0;
var startTime;
var gameEnd = true;

// Переменные для статистики
var bestScore = 0;
var responseTimes = [];
var totalClicks = 0;
var successfulClicks = 0;

// Import SP1 integration
import { initializeSP1Game, processGameResult } from './sp1/gameIntegration.js';

window.addEventListener('DOMContentLoaded', async () => {
    initialisation();
    
    // Initialize SP1 integration
    try {
        await initializeSP1Game();
        console.log('SP1 integration ready');
    } catch (error) {
        console.error('Failed to initialize SP1:', error);
    }
});

function initialisation() {
    document.getElementById('game-field').addEventListener('click', function(data){
        totalClicks++; // Отслеживаем все клики
        
        if (memberArray.indexOf(data.target.id) !== -1) {
            // Записываем время отклика, если элемент имеет метку времени появления
            if (data.target.hasAttribute('data-appeared')) {
                const clickTime = Date.now();
                const responseTime = (clickTime - data.target.getAttribute('data-appeared')) / 1000;
                responseTimes.push(responseTime);
            }
            
            // Обновляем успешные клики
            successfulClicks++;
            
            removeMember(data.target.id);
            changeScore(++score);
            playHitSound();
            triggerHitAnimation(data.target);
            setTimeout(addMember, 300, getRandomMember());
            
            // Обновляем статистику в реальном времени
            updateStatistics();
        } else {
            // Просто обновляем статистику для промахов
            updateStatistics();
        }
    });
    
    // Поиск кнопок запуска разными способами
    const startButtonsByClass = document.getElementsByClassName('start-button');
    if (startButtonsByClass.length > 0) {
        for (let i = 0; i < startButtonsByClass.length; i++) {
            startButtonsByClass[i].addEventListener('mouseup', startGame);
        }
    }
    
    // Поиск по ID из нового кода
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('mouseup', startGame);
    }
    
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
        restartButton.addEventListener('mouseup', startGame);
    }
    
    // Загружаем лучший счет из localStorage, если доступен
    if (localStorage.getItem('bestScore')) {
        bestScore = parseInt(localStorage.getItem('bestScore'));
        if (document.getElementById('best-score')) {
            document.getElementById('best-score').textContent = bestScore;
        } else if (document.querySelector('.stats-value')) {
            document.querySelector('.stats-value').textContent = bestScore;
        }
    }
    
    // Создаем элементы фона
    createFallingElements();
}

function createFallingElements() {
    const container = document.createElement('div');
    container.className = 'falling-elements';
    document.body.appendChild(container);
    
    const images = ['meme.png', 'dvd.png', 'hat.png', 'crab.png'];
    const numberOfElements = 15; // Больше элементов для более насыщенного фона
    
    for (let i = 0; i < numberOfElements; i++) {
        const element = document.createElement('img');
        const randomImage = images[Math.floor(Math.random() * images.length)];
        element.src = `img/${randomImage}`;
        element.className = 'falling-item';
        
        // Случайное позиционирование и свойства
        const gameField = document.getElementById('game-field');
        const gameFieldRect = gameField.getBoundingClientRect();
        
        // Получаем размеры окна
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Определяем границы игрового поля
        const gameFieldLeft = gameFieldRect.left;
        const gameFieldRight = gameFieldRect.right;
        const gameFieldTop = gameFieldRect.top;
        const gameFieldBottom = gameFieldRect.bottom;
        
        // Случайная позиция (гарантируем, что она вне игрового поля)
        let startX, startY;
        let isPositionValid = false;
        
        // Генерируем случайные позиции, пока не найдем ту, что вне игрового поля
        while (!isPositionValid) {
            startX = Math.random() * 100; // Позиция в единицах vh
            startY = Math.random() * 100; // Позиция в единицах vw
            
            // Конвертируем проценты в пиксели для сравнения
            const pixelX = (startX / 100) * windowWidth;
            const pixelY = (startY / 100) * windowHeight;
            
            // Проверяем, что позиция вне игрового поля с некоторым запасом
            if (!(pixelX > gameFieldLeft - 50 && pixelX < gameFieldRight + 50 &&
                  pixelY > gameFieldTop - 50 && pixelY < gameFieldBottom + 50)) {
                isPositionValid = true;
            }
        }
        
        const size = Math.random() * 50 + 30; // Размер между 30px и 80px
        const opacity = Math.random() * 0.3 + 0.2; // Прозрачность между 0.2 и 0.5
        const rotationSpeed = Math.random() * 20 + 10; // Скорость вращения
        
        // Выбираем случайный шаблон анимации
        const animationPattern = Math.floor(Math.random() * 4);
        let animationStyle;
        
        switch(animationPattern) {
            case 0: // Диагональный дрейф
                animationStyle = `
                    diagonal-drift ${Math.random() * 60 + 40}s linear infinite,
                    gentle-rotate ${rotationSpeed}s ease-in-out infinite
                `;
                break;
            case 1: // Отскакивание
                animationStyle = `
                    bounce ${Math.random() * 20 + 10}s ease-in-out infinite,
                    gentle-rotate ${rotationSpeed}s ease-in-out infinite
                `;
                break;
            case 2: // Круговая траектория
                animationStyle = `
                    circular-path ${Math.random() * 40 + 30}s linear infinite,
                    gentle-rotate ${rotationSpeed}s ease-in-out infinite
                `;
                break;
            case 3: // Зигзаг
                animationStyle = `
                    zigzag ${Math.random() * 30 + 20}s ease-in-out infinite,
                    gentle-rotate ${rotationSpeed * 0.8}s ease-in-out infinite
                `;
                break;
        }
        
        // Устанавливаем CSS свойства
        element.style.cssText = `
            top: ${startY}vh;
            left: ${startX}vw;
            width: ${size}px;
            height: auto;
            opacity: ${opacity};
            z-index: -1; /* Убедимся, что это за игровым полем */
            animation: ${animationStyle};
            animation-delay: -${Math.random() * 30}s;
        `;
        
        container.appendChild(element);
    }
    
    // Добавляем уникальные мигающие элементы
    const blinkingContainer = document.createElement('div');
    blinkingContainer.className = 'blinking-elements';
    document.body.appendChild(blinkingContainer);
    
    for (let i = 0; i < 5; i++) {
        const element = document.createElement('div');
        element.className = 'succinct-pixel';
        
        const size = Math.random() * 6 + 4; // Размер между 4px и 10px
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const blinkSpeed = Math.random() * 3 + 1; // Скорость мигания
        const hue = Math.random() * 60 + 300; // Диапазон оттенков от фиолетового до розового
        
        element.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            top: ${startY}vh;
            left: ${startX}vw;
            background-color: hsl(${hue}, 100%, 70%);
            animation: blink ${blinkSpeed}s ease-in-out infinite;
            animation-delay: -${Math.random() * 3}s;
        `;
        
        blinkingContainer.appendChild(element);
    }
}

function updateStatistics() {
    // Обновляем лучший счет
    if (score > bestScore) {
        bestScore = score;
        // Проверяем оба возможных элемента для отображения лучшего счета
        if (document.getElementById('best-score')) {
            document.getElementById('best-score').textContent = bestScore;
        }
        if (document.querySelector('.stats-value')) {
            document.querySelector('.stats-value').textContent = bestScore;
        }
        localStorage.setItem('bestScore', bestScore);
    }
    
    // Вычисляем и обновляем среднее время отклика
    if (responseTimes.length > 0) {
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        if (document.getElementById('avg-response')) {
            document.getElementById('avg-response').textContent = avgResponseTime.toFixed(1) + 's';
        }
        // Проверка элемента в новой разметке
        const statsValues = document.querySelectorAll('.stats-value');
        if (statsValues && statsValues.length > 1) {
            statsValues[1].textContent = avgResponseTime.toFixed(1) + 's';
        }
    }
    
    // Вычисляем и обновляем процент успеха
    if (totalClicks > 0) {
        const successRate = (successfulClicks / totalClicks) * 100;
        if (document.getElementById('success-rate')) {
            document.getElementById('success-rate').textContent = Math.round(successRate) + '%';
        }
        // Проверка элемента в новой разметке
        const statsValues = document.querySelectorAll('.stats-value');
        if (statsValues && statsValues.length > 2) {
            statsValues[2].textContent = Math.round(successRate) + '%';
        }
    }
    
    // Обновляем финальный счет, если элемент существует
    if (document.getElementById('final-score')) {
        document.getElementById('final-score').textContent = score;
    }
}

function triggerHitAnimation(target) {
    target.style.transform = 'scale(1.2) rotate(10deg)';
    setTimeout(() => {
        target.style.transform = 'scale(1) rotate(0deg)';
    }, 200);
}

function playHitSound() {
    const hitSounds = [
        new Audio('sound/hit1.mp3'),
        new Audio('sound/hit2.mp3'),
        new Audio('sound/hit3.mp3')
    ];
    const randomSound = hitSounds[Math.floor(Math.random() * hitSounds.length)];
    randomSound.volume = 0.5;
    randomSound.play();
}

function getRandomMember() {
    return memberArray[Math.floor(Math.random() * memberArray.length)];
}

function addMember(id) {
    const memberElement = document.getElementById(id);
    memberElement.style.display = 'block';
    memberElement.style.animation = 'pulse 0.5s ease-in-out';
    
    // Сохраняем временную метку появления элемента для статистики
    memberElement.setAttribute('data-appeared', Date.now());
    
    if (!gameEnd) {
        setTimeout(function(){
            if (memberElement.style.display != 'none') {
                removeMember(id);
                setTimeout(addMember, Math.random() * Math.floor(300) + 100, getRandomMember());
            } 
        }, Math.round(Math.random() * Math.floor(800)) + 300);
    }
}

function removeMember(id) {
    document.getElementById(id).style.display = 'none';
}

function changeScore() {
    const scoreElement = document.getElementById('score').getElementsByTagName('span')[0];
    scoreElement.innerHTML = 'Codes: ' + score;
    
    // Анимация
    scoreElement.style.transform = 'scale(1.1) rotateX(20deg)';
    setTimeout(() => {
        scoreElement.style.transform = 'scale(1) rotateX(0deg)';
    }, 200);
}

function startTimer() {
    startTime = Date.now();
    changeTimer();
}

function changeTimer() {
    if ((Date.now() - startTime) >= 20000) {
        endGame();
    } else {
        setTimeout(changeTimer, 50);
        const remainingTime = Math.round(20 - (Date.now() - startTime) / 1000);
        const progressPercentage = 100 - (Date.now() - startTime) * 0.005;
        
        document.getElementById('progress').style.width = progressPercentage + '%';
        document.getElementById('timer').getElementsByTagName('span')[0].innerHTML = 'Time left: ' + remainingTime + ' seconds';
        
        // Добавляем визуальную интенсивность, когда время на исходе
        if (remainingTime <= 5) {
            document.getElementById('timer').style.animation = 'shake 0.5s infinite';
        } else {
            document.getElementById('timer').style.animation = '';
        }
    }
}

function clearField() {
    let members = document.getElementsByClassName('member-img');
    for (let i = 0; i < members.length; i++) {
        members[i].style.display = 'none';
    }
}

function startGame() {
    // Сбрасываем значения игры
    score = 0;
    changeScore();
    responseTimes = [];
    totalClicks = 0;
    successfulClicks = 0;
    
    // Проверяем обе структуры оверлея для обработки любой версии
    // Оригинальная структура
    if (document.getElementById('game-info')) {
        document.getElementById('game-info').style.display = 'none';
    }
    if (document.getElementById('game-end')) {
        document.getElementById('game-end').classList.add('hidden');
    }
    
    // Новая структура
    if (document.getElementById('start-overlay')) {
        document.getElementById('start-overlay').classList.add('hidden');
    }
    if (document.getElementById('game-over-overlay')) {
        document.getElementById('game-over-overlay').classList.add('hidden');
    }
    
    clearField();
    gameEnd = false;
    startTimer();
    setTimeout(addMember, 300, getRandomMember());
    
    // Обновляем статистику
    updateStatistics();
}

function typeWriter(element, text, speed = 50) {
    element.innerHTML = '';
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function endGame() {
    clearInterval(gameTimer);
    gameEnd = true;
    
    // Убираем анимацию таймера
    if (document.getElementById('timer')) {
        document.getElementById('timer').style.animation = '';
    }
    
    // Обновляем статистику в последний раз
    updateStatistics();
    
    // Собираем данные для SP1 верификации
    const gameData = {
        score: score,
        time: Date.now() - startTime,
        responseTimes: responseTimes,
        totalClicks: totalClicks,
        successfulClicks: successfulClicks,
        accuracy: successfulClicks > 0 ? (successfulClicks / totalClicks * 100).toFixed(1) : 0,
        avgResponseTime: responseTimes.length > 0 ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2) : 0
    };
    
    // Верифицируем результат с SP1 в фоне
    if (typeof processGameResult === 'function') {
        processGameResult(gameData).then(verifiedResult => {
            console.log('SP1 verification completed:', verifiedResult);
        }).catch(err => {
            console.error('SP1 verification failed:', err);
        });
    }
    
    // Определяем текст в зависимости от счета
    let resultText, subText;
    if (score >= 20) {
        resultText = 'At this rate, Yinger will hire you as an assistant, DM him bro';
        subText = `Given ${score} codes. Great result Prover, you are just a SP1 dream!`;
    } else if (score < 20 && score > 8) {
        resultText = 'Cool, but ETH requires more!';
        subText = `You gave out ${score} codes. Try working like a Yinger next time!`;
    } else {
        resultText = 'ARE YOU GOING TO PROVE SOMETHING???';
        subText = `Given only ${score} codes. You either didn't figure out how to do it, or you fell asleep...`;
    }
    
    // Проверяем обе структуры оверлея для обработки любой версии
    // Оригинальная структура
    if (document.getElementById('game-end')) {
        const h1 = document.getElementById('game-end').getElementsByTagName('h1')[0];
        const h2 = document.getElementById('game-end').getElementsByTagName('h2')[0];
        
        if (h1 && h2) {
            h1.classList.add('glitch-text');
            h2.classList.add('typing-text');
            
            h1.setAttribute('data-text', resultText);
            h1.innerHTML = resultText;
            typeWriter(h2, subText);
        }
        
        document.getElementById('game-end').classList.remove('hidden');
    }
    
    // Новая структура
    if (document.getElementById('game-over-overlay')) {
        document.getElementById('game-over-overlay').classList.remove('hidden');
        
        const h1 = document.querySelector('#game-over-overlay h1');
        const h2 = document.querySelector('#game-over-overlay h2');
        
        if (h1) {
            h1.innerHTML = resultText;
            if (!h1.classList.contains('glitch-text')) {
                h1.classList.add('glitch-text');
            }
            h1.setAttribute('data-text', resultText);
        }
        
        // Обновляем подтекст с эффектом печати
        if (h2 && h2.nextElementSibling && h2.nextElementSibling.tagName === 'H3') {
            const h3 = h2.nextElementSibling;
            typeWriter(h3, subText);
        } else if (h2) {
            typeWriter(h2, subText);
        }
    }
}
