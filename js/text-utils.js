// text-utils.js
// 日本語テキストを文節ごとのブロックに区切って表示するための共通ヘルパー。
// js/vendor/budoux-ja.min.js が提供する<budoux-ja>要素を使うことで、
// 画面幅が変わっても単語や助詞の途中で不自然に改行されないようにする。

// 指定した要素の中身を、文節ごとに区切られたテキストに置き換える
function setPhraseText(element, text) {
  element.textContent = "";

  const phraseWrapper = document.createElement("budoux-ja");
  phraseWrapper.textContent = text;

  element.appendChild(phraseWrapper);
}

// 丸数字（①②③…）。おすすめの日本酒が複数件あるときの通し番号表示などに使う（1件目=index 1）
const CIRCLED_NUMBERS = ["", "①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
