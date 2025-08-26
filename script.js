async function loadQuestions() {
  const res = await fetch("questions.json");
  return res.json();
}

function buildQuiz(questions) {
  const quizContainer = document.getElementById("quiz");
  quizContainer.innerHTML = "";
  questions.forEach((q, i) => {
    const answers = q.options.map((opt, j) => `
      <label>
        <input type="radio" name="q${i}" value="${j}">
        ${opt}
      </label>
    `).join("");
    quizContainer.innerHTML += `
      <div class="question">
        <p><b>${i+1}. ${q.question}</b></p>
        ${answers}
      </div>
    `;
  });
  document.getElementById("submit").style.display = "block";
}

function showResults(questions) {
  let score = 0;
  questions.forEach((q, i) => {
    const answer = document.querySelector(`input[name="q${i}"]:checked`);
    if (answer && parseInt(answer.value) === q.answer) {
      score++;
    }
  });
  document.getElementById("results").innerText =
    `Você acertou ${score} de ${questions.length} questões.`;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") || "full";
  const data = await loadQuestions();
  const configDiv = document.getElementById("config");
  let selectedQuestions = [];

  if (mode === "full") {
    let all = [];
    Object.values(data).forEach(qs => all = all.concat(qs));
    selectedQuestions = shuffle(all).slice(0, 40);
    buildQuiz(selectedQuestions);

  } else if (mode === "custom") {
    configDiv.innerHTML = "<h3>Selecione os tópicos:</h3>";
    Object.keys(data).forEach(topic => {
      configDiv.innerHTML += `
        <label><input type="checkbox" value="${topic}"> ${topic}</label>
      `;
    });
    const startBtn = document.createElement("button");
    startBtn.textContent = "Iniciar Prova";
    configDiv.appendChild(startBtn);

    startBtn.addEventListener("click", () => {
      const checked = [...configDiv.querySelectorAll("input:checked")].map(i => i.value);
      let all = [];
      checked.forEach(topic => all = all.concat(data[topic]));
      selectedQuestions = shuffle(all).slice(0, 20);
      configDiv.innerHTML = "";
      buildQuiz(selectedQuestions);
    });

  } else if (mode === "single") {
    configDiv.innerHTML = "<h3>Escolha um assunto:</h3>";
    const select = document.createElement("select");
    Object.keys(data).forEach(topic => {
      const opt = document.createElement("option");
      opt.value = topic;
      opt.textContent = topic;
      select.appendChild(opt);
    });
    const startBtn = document.createElement("button");
    startBtn.textContent = "Iniciar Prova";
    configDiv.appendChild(select);
    configDiv.appendChild(startBtn);

    startBtn.addEventListener("click", () => {
      selectedQuestions = data[select.value];
      configDiv.innerHTML = "";
      buildQuiz(selectedQuestions);
    });
  }

  document.getElementById("submit").addEventListener("click", () => {
    showResults(selectedQuestions);
  });
});
function showResults(questions) {
  let score = 0;
  const desempenho = {};

  // Inicializa desempenho por tópico
  questions.forEach(q => {
    if (!desempenho[q.topic]) {
      desempenho[q.topic] = { acertos: 0, erros: 0 };
    }
  });

  // Conta acertos e erros por tópico
  questions.forEach((q, i) => {
    const answer = document.querySelector(`input[name="q${i}"]:checked`);
    const topico = q.topic;
    if (answer && parseInt(answer.value) === q.answer) {
      score++;
      desempenho[topico].acertos++;
    } else {
      desempenho[topico].erros++;
    }
  });

  // Mostra nota total
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `Você acertou ${score} de ${questions.length} questões.`;

  // Cria botão “Assuntos a Melhorar”
  const btn = document.createElement("button");
  btn.textContent = "Assuntos a Melhorar";
  btn.style.marginTop = "10px";
  resultsDiv.appendChild(btn);

  // Div para exibir tópicos a reforçar
  const reforcoDiv = document.createElement("div");
  reforcoDiv.style.marginTop = "10px";
  resultsDiv.appendChild(reforcoDiv);

  // Função para definir a cor da porcentagem
  function getColor(percentual) {
    if (percentual <= 30) return "red";
    else if (percentual <= 50) return "yellow";
    else if (percentual <= 70) return "green";
    else if (percentual <= 90) return "green";
    else return "blue";
  }

  // Evento de clique
  btn.addEventListener("click", () => {
    reforcoDiv.innerHTML = "<h3>Assuntos a melhorar:</h3>";
    for (const topico in desempenho) {
      const total = desempenho[topico].acertos + desempenho[topico].erros;
      const percentual = ((desempenho[topico].acertos / total) * 100).toFixed(0);

      // Apenas mostra os tópicos abaixo de 70%
      if (percentual < 70) {
        const p = document.createElement("p");
        p.textContent = `- ${topico} → ${percentual}% de acertos`;
        p.style.color = getColor(percentual);
        reforcoDiv.appendChild(p);
      }
    }
  });
}
