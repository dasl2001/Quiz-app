const API_URL = "https://opentdb.com/api.php?amount=5&type=multiple&category=";
const categoryMapping = {
    "Sport": 21,     
    "Geography": 22, 
    "Cars": 28       
};
let currentQuestionIndex = 0;
let score = 0;
let totalTime = 0;
let quizQuestions = [];
let quizStartTime;
let timerInterval;
function startQuiz(subject) {
    const categoryId = categoryMapping[subject];
    fetch(`${API_URL}${categoryId}`)
        .then(response => response.json())
        .then(data => {
            quizQuestions = data.results;
            showScreen('quizScreen');
            startQuizTimer();
            loadQuestion();
        });
}
function showScreen(screenId) {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById(screenId).style.display = 'block';
}
function startQuizTimer() {
    quizStartTime = Date.now();
}
function loadQuestion() {
    clearInterval(timerInterval);
    document.getElementById('questionCounter').innerHTML = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
    const currentQuestion = quizQuestions[currentQuestionIndex];
    document.getElementById('questionContainer').innerHTML = `
        <h2>${currentQuestion.question}</h2>
        ${currentQuestion.incorrect_answers.concat(currentQuestion.correct_answer).sort().map((answer, index) => `
            <button class="answerBtn" onclick="submitAnswer(this, '${answer}', '${currentQuestion.correct_answer}')">${answer}</button>
        `).join('')}
    `;
    document.getElementById('nextButton').style.display = 'none';
    startQuestionTimer();
}
function startQuestionTimer() {
    let timeRemaining = 30;
    document.getElementById('timer').innerHTML = `Time Left: ${timeRemaining} Seconds`;
    timerInterval = setInterval(() => {
        timeRemaining--;
        document.getElementById('timer').innerHTML = `Time Left: ${timeRemaining} Seconds`;
        if (timeRemaining === 0) {
            clearInterval(timerInterval);
            submitAnswer(null, '', quizQuestions[currentQuestionIndex].correct_answer); // Om tiden går ut
        }
    }, 1000);
}
function submitAnswer(button, selectedAnswer, correctAnswer) {
    clearInterval(timerInterval);
    const allButtons = document.querySelectorAll('.answerBtn');
    allButtons.forEach(btn => {
        btn.disabled = true; 
        if (btn.textContent === correctAnswer) {
            btn.classList.add('correct'); 
        }
        if (btn.textContent === selectedAnswer && selectedAnswer !== correctAnswer) {
            btn.classList.add('incorrect'); 
        }
    });
    if (selectedAnswer === correctAnswer) {
        score++;
    }
    document.getElementById('nextButton').style.display = 'block'; // Visar knappen för nästa fråga
}
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        document.getElementById('nextButton').style.display = 'none';
        loadQuestion();
    } else {
        showResults();
    }
}
function showResults() {
    const timeTaken = (Date.now() - quizStartTime) / 1000;
    totalTime = timeTaken;
    document.getElementById('score').innerHTML = `Your Score: ${score}/${quizQuestions.length}`;
    document.getElementById('timeTaken').innerHTML = `Time: ${totalTime} seconds`;
    const previousBestTime = localStorage.getItem('bestTime');
    if (!previousBestTime || totalTime < previousBestTime) {
        localStorage.setItem('bestTime', totalTime);
        alert('New Highscore!');
    }
    showScreen('resultScreen');
}
function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    showScreen('startScreen');
}

