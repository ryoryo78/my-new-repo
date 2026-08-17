// result.js
// 結果画面（result.html）の動作を制御するスクリプト。
// 役割：sessionStorageからの診断結果取得 → 該当タイプデータの検索 →
//       画面への描画 → （データが不正な場合の）エラー表示。
// 16タイプのデータ（personalityTypes / sakeRecommendations）は
// data.js で定義されているものをそのまま利用する。

const RESULT_STORAGE_KEY = "sakePersonalityResult"; // questions.js側と揃えるストレージキー

// 画面上のDOM要素をまとめて保持しておくオブジェクト（init内で取得する）
let elements = {};

// 現在表示中の診断結果（タイプコード・性格データ・日本酒データ）
// share.js側のシェア画像生成でも参照するため、モジュール変数として保持しておく
let currentDiagnosisResult = null;

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheDomElements();
  setupRestartLink();

  const resultData = getResultDataFromStorage();

  // 診断結果が取得できない場合はエラー表示にする
  if (resultData === null) {
    showError();
    return;
  }

  const typeCode = resultData.typeCode;
  const personality = personalityTypes[typeCode];
  const sake = sakeRecommendations[typeCode];

  // タイプコードに該当するデータが16タイプの中に見つからない場合もエラー表示にする
  if (!personality || !sake) {
    showError();
    return;
  }

  // share.js（SNSシェア画像生成）が参照できるよう、確定した結果を保持しておく
  currentDiagnosisResult = { typeCode: typeCode, personality: personality, sake: sake };

  renderResult(typeCode, personality, sake);
  renderAnsweredQuestions(resultData.answeredQuestions);
  showResultContainer();
}

// 操作・描画に必要なDOM要素をまとめて取得する
function cacheDomElements() {
  elements = {
    errorContainer: document.getElementById("errorContainer"),
    resultContainer: document.getElementById("resultContainer"),
    typeCodeText: document.getElementById("typeCodeText"),
    typeImage: document.getElementById("typeImage"),
    typeNameText: document.getElementById("typeNameText"),
    descriptionText: document.getElementById("descriptionText"),
    dietDescriptionText: document.getElementById("dietDescriptionText"),
    favoriteFoodsList: document.getElementById("favoriteFoodsList"),
    sakeBrandText: document.getElementById("sakeBrandText"),
    sakeBreweryText: document.getElementById("sakeBreweryText"),
    sakeAreaText: document.getElementById("sakeAreaText"),
    restartLink: document.getElementById("restartLink"),
    answersSection: document.getElementById("answersSection"),
    answersList: document.getElementById("answersList")
  };
}

// ------------------------------------------------------------
// 診断結果データの取得
// ------------------------------------------------------------

// sessionStorageから診断結果（タイプコードとスコア）を読み込んで返す
// 取得できない・形式が不正な場合はnullを返す
function getResultDataFromStorage() {
  const rawData = sessionStorage.getItem(RESULT_STORAGE_KEY);

  if (!rawData) {
    return null;
  }

  try {
    const parsedData = JSON.parse(rawData);

    if (!parsedData.typeCode) {
      return null;
    }

    return parsedData;
  } catch (error) {
    // JSON.parseに失敗した場合（データが壊れている場合）もnullを返す
    return null;
  }
}

// ------------------------------------------------------------
// 画面への描画
// ------------------------------------------------------------

// タイプコード・性格データ・日本酒データを画面に反映する
function renderResult(typeCode, personality, sake) {
  elements.typeCodeText.textContent = typeCode;
  elements.typeNameText.textContent = personality.typeName;
  elements.descriptionText.textContent = personality.description;
  elements.dietDescriptionText.textContent = personality.dietDescription;

  renderFavoriteFoods(personality.favoriteFoods);
  renderTypeImage(typeCode, personality.typeName);

  elements.sakeBrandText.textContent = "銘柄：" + sake.brandName;
  elements.sakeBreweryText.textContent = "酒蔵：" + sake.brewery;
  elements.sakeAreaText.textContent = "産地：" + sake.area;
}

// 好む食べ物の配列を、リスト（<li>要素）として描画する
function renderFavoriteFoods(favoriteFoods) {
  elements.favoriteFoodsList.innerHTML = "";

  favoriteFoods.forEach((food) => {
    const listItem = document.createElement("li");
    listItem.textContent = food;
    elements.favoriteFoodsList.appendChild(listItem);
  });
}

// タイプ画像（images/タイプコード.png）を表示する
// 該当する画像が存在しない場合は、画像エリアごと非表示にする
function renderTypeImage(typeCode, typeName) {
  const imagePath = "images/" + typeCode.toLowerCase() + ".png";

  elements.typeImage.src = imagePath;
  elements.typeImage.alt = typeName;
  elements.typeImage.onerror = () => {
    elements.typeImage.hidden = true;
  };
}

// 全32問の質問文と選択した回答の一覧を描画する
// 古い形式のデータ（回答一覧を保存していない結果）が残っている場合はセクションごと非表示にする
function renderAnsweredQuestions(answeredQuestions) {
  if (!Array.isArray(answeredQuestions) || answeredQuestions.length === 0) {
    elements.answersSection.hidden = true;
    return;
  }

  elements.answersList.innerHTML = "";

  answeredQuestions.forEach((item) => {
    const listItem = createAnswerRecordElement(item);
    elements.answersList.appendChild(listItem);
  });

  elements.answersSection.hidden = false;
}

// 1問分の「質問文＋選択した回答」のDOM要素を作成する
function createAnswerRecordElement(item) {
  const listItem = document.createElement("li");
  listItem.className = "answer-record-item";

  const questionText = document.createElement("p");
  questionText.className = "answer-record-question";
  questionText.textContent = "Q" + item.questionNumber + ". " + item.questionText;

  const answerText = document.createElement("p");
  answerText.className = "answer-record-answer";
  answerText.textContent = "回答：" + item.answerLabel;

  listItem.appendChild(questionText);
  listItem.appendChild(answerText);

  return listItem;
}

// エラーメッセージを表示し、結果表示エリアは非表示にする
function showError() {
  elements.errorContainer.hidden = false;
  elements.resultContainer.hidden = true;
}

// 結果表示エリアを表示する
function showResultContainer() {
  elements.errorContainer.hidden = true;
  elements.resultContainer.hidden = false;
}

// ------------------------------------------------------------
// トップ画面への導線
// ------------------------------------------------------------

// 「もう一度診断する」リンクをクリックしたときに、
// 古い診断結果が残らないようsessionStorageをクリアしておく
function setupRestartLink() {
  const restartLink = document.getElementById("restartLink");

  if (restartLink) {
    restartLink.addEventListener("click", () => {
      sessionStorage.removeItem(RESULT_STORAGE_KEY);
    });
  }
}
