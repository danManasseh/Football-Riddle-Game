let riddles = [];
let currentIndex = 0;
let score = 0;
let timer;
let totalTime = 20;
let timeLeft = 20;
let percent = 0;

  async function startGame(difficulty) {
    // Fetch riddles from Flask
    const response = await fetch(`/get_riddles/${difficulty}`);
    riddles = await response.json();
    currentIndex = 0;
    score = 0;
    showRiddle();
}

function showRiddle() {
    if (currentIndex >= riddles.length) {
        document.getElementById("riddle-box").innerHTML = `
            <h2 class="text-xl font-bold">Game Over!</h2>
            <p>Your score: ${score} out of ${riddles.length}</p>
        `;
        document.getElementById('timer').innerHTML = `<p id="timer">Time: 0</p>`;
        document.getElementById("progress-bar").style.width = `0%`;
        document.getElementById("house").classList.add('fa-shake');
        document.getElementById("sb").innerHTML = `<p style=font-weight:"bold">Score: ${score}</p>`;

        return;
    }
    const riddle = riddles[currentIndex];
    document.getElementById("riddle-box").innerHTML = `<p class="mb-4">I played with: <strong>${riddle.teammates.join(", ")}</strong></p>`;
    document.getElementById('timer').innerHTML = `<p id="timer">Time: ${timeLeft}</p>`;
    document.getElementById("progress-bar").style.width = `${percent}%`;
    document.getElementById("sb").innerHTML = `<p style=font-weight:"bold">Score: ${score}</p>`;

    startTimer();
}

function startTimer() {
    timeLeft = 20;
    document.getElementById("timer").innerHTML = `<p id="timer">Time: ${timeLeft}</p>`;
    document.getElementById("progress-bar").style.width = "100%";
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      document.getElementById("timer").innerHTML = `<p id="timer">Time: ${timeLeft}</p>`;
      percent = (timeLeft / totalTime) * 100;
      document.getElementById("progress-bar").style.width = `${percent}%`;

        if (timeLeft <= 0) {
          clearInterval(timer);
          document.getElementById("progress-bar").style.width = "0%";
          showFeedback(false, riddles[currentIndex].answers[0], true);
        }
    }, 1000);
}

function submitAnswer() {
  clearInterval(timer);

  const userAnswer = document.getElementById("answer").value

  if (checkAnswer(userAnswer, riddles[currentIndex].answers)) {
    score ++;
    showFeedback(true);
  } else {
    showFeedback(false, riddles[currentIndex].answers[0]);
  }
}

function checkAnswer(userAnswer, correctAnswers) {
  const normalizedUser = normalize(userAnswer);
  return correctAnswers.some(ans => {
    const normalizedAns = normalize(ans);
    return normalizedUser == normalizedAns;
  });
}

function normalize(s) {
  s = s.trim().toLowerCase();
  s = s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/[’']/g, "");
  s = s.replace(/[^a-z0-9]/g, "");
  return s;
}
function showFeedback(isCorrect, correctAnswer="", isEmpty = false) {
  const feedbackEl = document.getElementById("feedback");

  if (isCorrect) {
      feedbackEl.classList.add("alert-success")
      feedbackEl.innerHTML = "✅ Correct!";
    } else { 
    feedbackEl.classList.add("alert-danger")
      if (isEmpty) {
    feedbackEl.innerHTML = `🛑⏱️ Time Out! The answer was ${correctAnswer}`
  }else feedbackEl.innerHTML = `❌ Wrong! The answer was ${correctAnswer}`
    }
  setTimeout(() => {
    document.getElementById('answer').value = "";
    feedbackEl.classList.remove("alert-success", "alert-danger");
    feedbackEl.innerHTML = "";
    currentIndex++;
    showRiddle();
    }, 3000); 
}