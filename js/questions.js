// questions.js
// 質問画面（questions.html）の動作を制御するスクリプト。
// 役割：質問データの読み込み → 32問まとめての一覧表示 → 回答の記録 →
//       スコア集計 → タイプ判定 → result.html への受け渡し。

// ------------------------------------------------------------
// 診断全体で共有する状態（グローバル変数）
// ------------------------------------------------------------
const RESULT_STORAGE_KEY = "sakePersonalityResult"; // result.htmlへ渡す際のsessionStorageキー

let questionList = []; // 読み込んだ32問分の質問データ
let userAnswers = [];  // 各質問への回答を格納する配列（"agree" / "disagree" / null）、questionListと同じ並び順

// 画面上のDOM要素をまとめて保持しておくオブジェクト（init内で取得する）
let elements = {};

// ------------------------------------------------------------
// 初期化処理
// ------------------------------------------------------------

// ページ読み込み完了後に診断をスタートする
document.addEventListener("DOMContentLoaded", init);

function init() {
  // 操作対象のDOM要素をまとめて取得しておく
  cacheDomElements();

  // 質問データを取得し、成功したら診断画面を表示する
  try {
    questionList = loadQuestionData();
    initializeQuizState();
    renderQuestionsList();
    setupSubmitButton();
    updateProgress();
    showQuizContainer();
  } catch (error) {
    // 質問データが読み込めない場合はエラーメッセージを表示する
    showErrorMessage();
  }
}

// 操作に必要なDOM要素をまとめて取得する
function cacheDomElements() {
  elements = {
    errorMessage: document.getElementById("errorMessage"),
    quizContainer: document.getElementById("quizContainer"),
    progressBarFill: document.getElementById("progressBarFill"),
    progressText: document.getElementById("progressText"),
    questionsList: document.getElementById("questionsList"),
    submitButton: document.getElementById("submitButton"),
    unansweredHint: document.getElementById("unansweredHint")
  };
}

// ------------------------------------------------------------
// 質問データの読み込み
// ------------------------------------------------------------

// questionsData.js（<script>タグで読み込み済み）で定義されたquestionsDataを取得する
// fetch()でJSONファイルを取得する方式だと、index.htmlを直接開いた場合（file://）に
// ブラウザのCORS制限で読み込みが失敗するため、あらかじめJSの変数として質問データを持たせている
function loadQuestionData() {
  if (typeof questionsData === "undefined" || !Array.isArray(questionsData) || questionsData.length === 0) {
    throw new Error("質問データの形式が不正です");
  }

  return questionsData;
}

// 診断状態（回答の記録用配列など）を初期化する
function initializeQuizState() {
  // 質問数と同じ長さの配列を作り、すべて未回答（null）にしておく
  userAnswers = new Array(questionList.length).fill(null);
}

// ------------------------------------------------------------
// 画面表示（エラー／診断本体の切り替え）
// ------------------------------------------------------------

// エラーメッセージを表示し、診断本体は非表示にする
function showErrorMessage() {
  elements.errorMessage.hidden = false;
  elements.quizContainer.hidden = true;
}

// 診断本体エリアを表示する
function showQuizContainer() {
  elements.errorMessage.hidden = true;
  elements.quizContainer.hidden = false;
}

// ------------------------------------------------------------
// 質問一覧の描画
// ------------------------------------------------------------

// 32問すべてを一覧としてquestionsListに描画する
function renderQuestionsList() {
  elements.questionsList.innerHTML = "";

  questionList.forEach((question, questionIndex) => {
    const questionItem = createQuestionItemElement(question, questionIndex);
    elements.questionsList.appendChild(questionItem);
  });
}

// 1問分のDOM要素（質問番号・質問文・回答2択ボタン）を作成する
function createQuestionItemElement(question, questionIndex) {
  const questionItem = document.createElement("div");
  questionItem.className = "question-item";
  questionItem.dataset.questionIndex = String(questionIndex);

  const questionNumber = document.createElement("p");
  questionNumber.className = "question-item-number";
  questionNumber.textContent = "Q" + (questionIndex + 1);

  const questionText = document.createElement("p");
  questionText.className = "question-item-text";
  questionText.textContent = question.question;

  const answerArea = document.createElement("div");
  answerArea.className = "question-item-answers";

  const agreeButton = createAnswerButtonElement(questionIndex, "agree", "当てはまる");
  const disagreeButton = createAnswerButtonElement(questionIndex, "disagree", "当てはまらない");

  answerArea.appendChild(agreeButton);
  answerArea.appendChild(disagreeButton);

  questionItem.appendChild(questionNumber);
  questionItem.appendChild(questionText);
  questionItem.appendChild(answerArea);

  return questionItem;
}

// 1つの回答ボタン（当てはまる／当てはまらない）のDOM要素を作成する
function createAnswerButtonElement(questionIndex, answerType, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "answer-button";
  button.textContent = label;
  button.dataset.questionIndex = String(questionIndex);
  button.dataset.answerType = answerType;

  button.addEventListener("click", () => handleAnswerButtonClick(questionIndex, answerType));

  return button;
}

// ------------------------------------------------------------
// 回答の記録
// ------------------------------------------------------------

// いずれかの質問の回答ボタンが押されたときの処理
function handleAnswerButtonClick(questionIndex, answerType) {
  recordAnswer(questionIndex, answerType);
  updateAnswerButtonsVisual(questionIndex);
  clearUnansweredWarning(questionIndex);
  updateProgress();
}

// 指定した質問への回答をuserAnswersに記録する
function recordAnswer(questionIndex, answerType) {
  userAnswers[questionIndex] = answerType;
}

// 指定した質問の回答ボタンの選択表示（枠線・チェックマーク）を更新する
function updateAnswerButtonsVisual(questionIndex) {
  const currentAnswer = userAnswers[questionIndex];
  const buttons = elements.questionsList.querySelectorAll('[data-question-index="' + questionIndex + '"].answer-button');

  buttons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.answerType === currentAnswer);
  });
}

// 回答したことで警告表示が不要になった質問から、警告表示用のクラスを外す
function clearUnansweredWarning(questionIndex) {
  const questionItem = elements.questionsList.querySelector('.question-item[data-question-index="' + questionIndex + '"]');

  if (questionItem) {
    questionItem.classList.remove("unanswered-warning");
  }
}

// ------------------------------------------------------------
// 進捗表示・送信ボタンの状態管理
// ------------------------------------------------------------

// 回答済み数に応じて、進捗バー・進捗テキスト・送信ボタンの活性状態を更新する
function updateProgress() {
  const totalQuestions = questionList.length;
  const answeredCount = userAnswers.filter((answer) => answer !== null).length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  elements.progressBarFill.style.width = progressPercent + "%";
  elements.progressText.textContent = "回答済み： " + answeredCount + " / " + totalQuestions + "問";

  // 全問回答済みのときだけ「診断結果を見る」ボタンを活性化する
  elements.submitButton.disabled = answeredCount < totalQuestions;
}

// ------------------------------------------------------------
// 結果画面への遷移
// ------------------------------------------------------------

// 「診断結果を見る」ボタンにクリック時の処理を割り当てる
function setupSubmitButton() {
  elements.submitButton.addEventListener("click", handleSubmitButtonClick);
}

// 「診断結果を見る」ボタンが押されたときの処理
function handleSubmitButtonClick() {
  const unansweredIndexes = findUnansweredQuestionIndexes();

  // 未回答のまま結果画面へ進めないようにするための防御的チェック
  // （通常はボタンが非活性のため到達しないが、念のため確認する）
  if (unansweredIndexes.length > 0) {
    showUnansweredWarning(unansweredIndexes);
    return;
  }

  finishQuiz();
}

// まだ回答されていない質問のインデックス一覧を返す
function findUnansweredQuestionIndexes() {
  const unansweredIndexes = [];

  userAnswers.forEach((answer, index) => {
    if (answer === null) {
      unansweredIndexes.push(index);
    }
  });

  return unansweredIndexes;
}

// 未回答の質問に警告表示を付け、最初の未回答質問までスクロールする
function showUnansweredWarning(unansweredIndexes) {
  elements.unansweredHint.hidden = false;
  elements.unansweredHint.textContent =
    "まだ回答していない質問が" + unansweredIndexes.length + "問あります。上にスクロールして回答してください。";

  unansweredIndexes.forEach((index) => {
    const questionItem = elements.questionsList.querySelector('.question-item[data-question-index="' + index + '"]');
    if (questionItem) {
      questionItem.classList.add("unanswered-warning");
    }
  });

  const firstUnansweredItem = elements.questionsList.querySelector('.question-item[data-question-index="' + unansweredIndexes[0] + '"]');
  if (firstUnansweredItem) {
    firstUnansweredItem.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// 全問回答後の処理：スコア集計・タイプ判定・結果の受け渡し・画面遷移
function finishQuiz() {
  const axisScores = calculateAxisScores();
  const personalityTypeCode = determinePersonalityType(axisScores);
  const answeredQuestions = buildAnsweredQuestionsSummary();

  saveResultToSessionStorage(personalityTypeCode, axisScores, answeredQuestions);

  window.location.href = "result.html";
}

// ------------------------------------------------------------
// スコア集計・タイプ判定ロジック
// ------------------------------------------------------------

// 全32問の回答から、8つの文字（E/I/P/A/F/D/C/S）ごとの得点を集計する
function calculateAxisScores() {
  // 8種類すべての文字を0点で初期化しておく
  const scores = { E: 0, I: 0, P: 0, A: 0, F: 0, D: 0, C: 0, S: 0 };

  questionList.forEach((question, index) => {
    const answer = userAnswers[index];

    // 「当てはまる」ならagreeTypeに2点、「当てはまらない」ならdisagreeTypeに2点加算する
    const scoredLetter = answer === "agree" ? question.agreeType : question.disagreeType;
    scores[scoredLetter] += 2;
  });

  return scores;
}

// 1つの軸のスコアから、前半文字と後半文字のどちらのタイプかを判定する
// score: 後半文字（positiveLetter）の得点（0〜16点）
// positiveLetter: 後半文字（I, A, D, S）
// negativeLetter: 前半文字（E, P, F, C）
function judgeAxis(score, positiveLetter, negativeLetter) {
  // 8点以上（同点の8点を含む）なら後半文字と判定する
  return score >= 8 ? positiveLetter : negativeLetter;
}

// 4軸分の判定結果を連結して、最終的なタイプコード（例："EPFC"）を生成する
function determinePersonalityType(scores) {
  const environmentAxis = judgeAxis(scores.I, "I", "E"); // 環境軸：E（社交・外食派）/ I（内省・自炊派）
  const actionAxis = judgeAxis(scores.A, "A", "P");      // 行動軸：P（計画・管理派）/ A（衝動・刺激派）
  const approachAxis = judgeAxis(scores.D, "D", "F");    // アプローチ軸：F（効率・タイパ派）/ D（こだわり・美的派）
  const vitalAxis = judgeAxis(scores.S, "S", "C");       // バイタル軸：C（安定・タフ派）/ S（繊細・ケア派）

  return environmentAxis + actionAxis + approachAxis + vitalAxis;
}

// ------------------------------------------------------------
// 結果画面への受け渡し
// ------------------------------------------------------------

// 回答ボタンの内部的な値（agree/disagree）を、画面表示用の日本語ラベルに変換する
const ANSWER_LABELS = {
  agree: "当てはまる",
  disagree: "当てはまらない"
};

// 全32問について「質問文」と「選択した回答」をまとめた一覧を作成する
// result.html側で回答一覧として表示するために使う
function buildAnsweredQuestionsSummary() {
  return questionList.map((question, index) => ({
    questionNumber: index + 1,
    questionText: question.question,
    answerLabel: ANSWER_LABELS[userAnswers[index]]
  }));
}

// 診断結果（タイプコード・軸ごとのスコア・回答一覧）をsessionStorageに保存する
// result.html側はこのキーを読み取ってタイプ判定結果や回答一覧を表示する
function saveResultToSessionStorage(typeCode, scores, answeredQuestions) {
  const resultData = {
    typeCode: typeCode,
    scores: scores,
    answeredQuestions: answeredQuestions
  };

  sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(resultData));
}
