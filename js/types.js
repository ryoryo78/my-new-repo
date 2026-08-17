// types.js
// タイプ一覧ページ（types.html）の動作を制御するスクリプト。
// 役割：16タイプ分のカード一覧の描画 → 画像クリックでの詳細モーダル表示・閉じる処理。
// 16タイプのデータ（personalityTypes / sakeRecommendations）はdata.jsで定義されているものをそのまま利用する。

// 画面上のDOM要素をまとめて保持しておくオブジェクト（init内で取得する）
let typesElements = {};

document.addEventListener("DOMContentLoaded", initTypesPage);

function initTypesPage() {
  cacheTypesElements();
  renderTypesGrid();
  setupModalCloseHandlers();
}

// 操作・描画に必要なDOM要素をまとめて取得する
function cacheTypesElements() {
  typesElements = {
    grid: document.getElementById("typesGrid"),
    modal: document.getElementById("typeDetailModal"),
    closeModalButton: document.getElementById("closeModalButton"),
    modalTypeCode: document.getElementById("modalTypeCode"),
    modalTypeImage: document.getElementById("modalTypeImage"),
    modalTypeName: document.getElementById("modalTypeName"),
    modalDescription: document.getElementById("modalDescription"),
    modalDietDescription: document.getElementById("modalDietDescription"),
    modalFavoriteFoods: document.getElementById("modalFavoriteFoods"),
    modalSakeBrand: document.getElementById("modalSakeBrand"),
    modalSakeBrewery: document.getElementById("modalSakeBrewery"),
    modalSakeArea: document.getElementById("modalSakeArea")
  };
}

// ------------------------------------------------------------
// タイプ一覧の描画
// ------------------------------------------------------------

// 16タイプ分のカードを一覧に描画する
function renderTypesGrid() {
  const typeCodes = Object.keys(personalityTypes);

  typeCodes.forEach((typeCode) => {
    const card = createTypeCardElement(typeCode);
    typesElements.grid.appendChild(card);
  });
}

// 1タイプ分のカード（画像・通称・タイプ名）のDOM要素を作成する
function createTypeCardElement(typeCode) {
  const personality = personalityTypes[typeCode];

  const card = document.createElement("div");
  card.className = "type-card";

  const imageButton = document.createElement("button");
  imageButton.type = "button";
  imageButton.className = "type-card-image-button";
  imageButton.setAttribute("aria-label", personality.typeName + "の詳細を見る");
  imageButton.addEventListener("click", () => openTypeDetailModal(typeCode));

  const image = document.createElement("img");
  image.className = "type-card-image";
  image.src = "images/" + typeCode.toLowerCase() + ".png";
  image.alt = personality.typeName;

  imageButton.appendChild(image);

  const nickname = document.createElement("p");
  nickname.className = "type-card-nickname";
  nickname.textContent = personality.typeName;

  const code = document.createElement("p");
  code.className = "type-card-code";
  code.textContent = typeCode;

  card.appendChild(imageButton);
  card.appendChild(nickname);
  card.appendChild(code);

  return card;
}

// ------------------------------------------------------------
// 詳細モーダルの表示・非表示
// ------------------------------------------------------------

// 指定したタイプの詳細をモーダルに反映して表示する
function openTypeDetailModal(typeCode) {
  const personality = personalityTypes[typeCode];
  const sake = sakeRecommendations[typeCode];

  typesElements.modalTypeCode.textContent = typeCode;
  typesElements.modalTypeImage.src = "images/" + typeCode.toLowerCase() + ".png";
  typesElements.modalTypeImage.alt = personality.typeName;
  typesElements.modalTypeName.textContent = personality.typeName;
  typesElements.modalDescription.textContent = personality.description;
  typesElements.modalDietDescription.textContent = personality.dietDescription;

  renderModalFavoriteFoods(personality.favoriteFoods);

  typesElements.modalSakeBrand.textContent = "銘柄：" + sake.brandName;
  typesElements.modalSakeBrewery.textContent = "酒蔵：" + sake.brewery;
  typesElements.modalSakeArea.textContent = "産地：" + sake.area;

  typesElements.modal.hidden = false;
}

// モーダル内の「好む食べ物」リストを描画する
function renderModalFavoriteFoods(favoriteFoods) {
  typesElements.modalFavoriteFoods.innerHTML = "";

  favoriteFoods.forEach((food) => {
    const listItem = document.createElement("li");
    listItem.textContent = food;
    typesElements.modalFavoriteFoods.appendChild(listItem);
  });
}

// モーダルを閉じる
function closeTypeDetailModal() {
  typesElements.modal.hidden = true;
}

// モーダルを閉じるための操作（閉じるボタン・外側クリック・Escキー）をまとめて設定する
function setupModalCloseHandlers() {
  typesElements.closeModalButton.addEventListener("click", closeTypeDetailModal);

  // モーダルの外側（暗いオーバーレイ部分）をクリックしたときも閉じる
  typesElements.modal.addEventListener("click", (event) => {
    if (event.target === typesElements.modal) {
      closeTypeDetailModal();
    }
  });

  // Escキーでも閉じられるようにする
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !typesElements.modal.hidden) {
      closeTypeDetailModal();
    }
  });
}
