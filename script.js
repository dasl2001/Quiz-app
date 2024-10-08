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
/*
API_URL: Basadressen för Open Trivia API som hämtar frågor. Den hämtar 5 frågor av typ "multiple choice".
categoryMapping: En objektmappning som kopplar ämnena till deras respektive ID
i trivia API.
currentQuestionIndex: Håller reda på vilken fråga användaren befinner sig på.
score: Håller användarens poäng.
totalTime: Håller tiden det tog att genomföra quizet.
quizQuestions: En array som lagrar de hämtade quizfrågorna.
quizStartTime: Tidpunkten när quizet startar.
timerInterval: Referens till intervallet som hanterar tidtagningen.
*/


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
/*
startQuiz(subject): Funktion som startar quizet baserat på det valda ämnet.
Hämtar kategori-ID från categoryMapping.
Använder fetch för att hämta frågor från API
och konverterar svaret till JSON.
Lagrar resultaten i quizQuestions, visar quizskärmen och startar tidtagningen.
*/


function showScreen(screenId) {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('quizScreen').style.display = 'none';
    document.getElementById('resultScreen').style.display = 'none';
    document.getElementById(screenId).style.display = 'block';
}
/*
showScreen(screenId): Funktion som döljer alla skärmar och visar den skärm som motsvarar screenId.
*/


function startQuizTimer() {
    quizStartTime = Date.now();
}
/*
startQuizTimer(): Funktion som registrerar starttiden för quizet.
*/


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
/*
loadQuestion(): Funktion som laddar den aktuella frågan.
Återställer timerintervallet och uppdaterar frågeräknaren.
Laddar den aktuella frågan och svarsalternativen, som presenteras som knappar.
Knapparna aktiverar submitAnswer-funktionen när de klickas.
Döljer knappen för nästa fråga och startar en timer för den aktuella frågan.
*/


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
/*
startQuestionTimer(): Funktion som hanterar tidtagningen för varje fråga.
Sätter en nedräkning på 30 sekunder och uppdaterar timer-displayen.
När tiden tar slut, anropas submitAnswer med den korrekta svaret.
*/


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
/*
submitAnswer(button, selectedAnswer, correctAnswer): Funktion som hanterar inlämningen av svar.
Stoppar timerintervallet och avaktiverar alla svarsknappar.
Visar vilket svar som var korrekt och vilket som var fel.
Ökar poängen om det valda svaret är korrekt.
Visar knappen för att gå vidare till nästa fråga.
*/


function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        document.getElementById('nextButton').style.display = 'none';
        loadQuestion();
    } else {
        showResults();
    }
}
/*
nextQuestion(): Funktion som går vidare till nästa fråga.
Ökar currentQuestionIndex och laddar nästa fråga eller visar resultat om det inte finns fler frågor.
*/


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
/*
showResults(): Funktion som visar resultatet av quizet.
Beräknar hur lång tid quizet tog och uppdaterar skärmen med poäng och tid.
Kontrollerar om den nuvarande tiden är snabbare än den tidigare bästa tiden och sparar den i localStorage om så är fallet.
Visar resultatsidan.
*/


function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    showScreen('startScreen');
}
/*
restartQuiz(): Funktion som återställer quizet till startskärmen.
Återställer currentQuestionIndex och score, och visar startskärmen igen.
*/
