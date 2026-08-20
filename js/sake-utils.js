// sake-utils.js
// 「おすすめの日本酒」カード（銘柄→酒蔵名→画像→ボタン）を描画する共通処理。
// result.html（結果画面）・types.html（タイプ詳細モーダル）の両方から利用する。
// データ（sakeRecommendations）はdata.jsで定義されているものをそのまま利用する。

// おすすめの日本酒（1件以上）を一覧として描画する
// result.js・types.jsの両方から共通で呼び出せるよう、描画先の要素を引数で受け取る
function renderSakeRecommendations(listContainer, sakeList) {
  listContainer.innerHTML = "";

  // 複数銘柄ある場合のみ、①②…と番号を振って区別しやすくする
  const showNumber = sakeList.length > 1;

  sakeList.forEach((sake, index) => {
    const item = createSakeRecommendationElement(sake, showNumber ? index + 1 : null);
    listContainer.appendChild(item);
  });
}

// 1件分のおすすめ日本酒カード（銘柄→酒蔵名→画像→ボタン）のDOM要素を作成する
function createSakeRecommendationElement(sake, number) {
  const item = document.createElement("div");
  item.className = "sake-recommendation-item";

  const brandText = document.createElement("p");
  brandText.className = "sake-brand";
  const brandLabel = number === null ? sake.brandName : CIRCLED_NUMBERS[number] + sake.brandName;
  setPhraseText(brandText, brandLabel);

  const breweryText = document.createElement("p");
  breweryText.className = "sake-brewery";
  setPhraseText(breweryText, sake.breweryName + "（" + sake.prefecture + "）");

  const image = document.createElement("img");
  image.className = "sake-image";
  image.src = sake.imageUrl;
  image.alt = sake.brandName;

  item.appendChild(brandText);
  item.appendChild(breweryText);
  item.appendChild(image);

  const buttons = createSakeLinkButtons(sake);
  if (buttons) {
    item.appendChild(buttons);
  }

  return item;
}

// 「ホームページ」「購入はこちらから」ボタンをまとめた要素を作成する
// URLが未定（null）のボタンは表示しない。どちらのURLも無ければnullを返す
function createSakeLinkButtons(sake) {
  if (!sake.homepageUrl && !sake.purchaseUrl) {
    return null;
  }

  const buttons = document.createElement("div");
  buttons.className = "sake-buttons";

  if (sake.homepageUrl) {
    buttons.appendChild(createSakeLinkButton(sake.homepageUrl, "ホームページ", "sake-link-button-homepage"));
  }

  if (sake.purchaseUrl) {
    buttons.appendChild(createSakeLinkButton(sake.purchaseUrl, "購入はこちらから", "sake-link-button-purchase"));
  }

  return buttons;
}

// 外部サイトへのリンクボタン（新しいタブで開く）を1つ作成する
function createSakeLinkButton(url, label, modifierClassName) {
  const link = document.createElement("a");
  link.className = "sake-link-button " + modifierClassName;
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  setPhraseText(link, label);
  return link;
}
