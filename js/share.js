// share.js
// 結果画面（result.html）のSNSシェア用画像生成を担当するスクリプト。
// 役割：フォーマット選択 → Canvasへの描画 → Web Share APIでのワンタップシェア
//       （対応していない環境ではプレビュー表示＋PNG画像の保存にフォールバック）。
// 診断結果（currentDiagnosisResult）はresult.jsが結果取得時に設定したものをそのまま利用する。
//
// 補足：ブラウザやWebサイトから特定のSNS（X・Instagramなど）へ直接・自動で投稿することはできない
// （各SNS側がスパム防止のためそのような外部APIを提供していない）。
// そのため、ブラウザ標準のWeb Share API（navigator.share）でOSの共有シートを呼び出し、
// ユーザーがそこでシェア先のSNSをワンタップで選ぶ、という一般的な実装方法を採用している。

const FONT_FAMILY = '"Hiragino Maru Gothic ProN", "Yu Gothic", "Helvetica Neue", Arial, sans-serif';

// シェア画像のフォーマット定義（Instagramストーリーズ用／X投稿用）
const SHARE_IMAGE_FORMATS = {
  instagram: { width: 1080, height: 1920, label: "Instagramストーリーズ用" },
  x: { width: 1200, height: 675, label: "X投稿用" }
};

// 画面上のDOM要素をまとめて保持しておくオブジェクト
let shareElements = {};

// 現在プレビュー表示中の画像フォーマット（保存時のファイル名などに利用する）
let currentShareFormatKey = null;

document.addEventListener("DOMContentLoaded", initShareFeature);

function initShareFeature() {
  cacheShareDomElements();
  setupShareEventListeners();
}

// 操作に必要なDOM要素をまとめて取得する
function cacheShareDomElements() {
  shareElements = {
    shareOnInstagramButton: document.getElementById("shareOnInstagramButton"),
    shareOnXButton: document.getElementById("shareOnXButton"),
    previewArea: document.getElementById("sharePreviewArea"),
    previewCaption: document.getElementById("sharePreviewCaption"),
    canvas: document.getElementById("shareCanvas"),
    downloadButton: document.getElementById("downloadShareImageButton")
  };
}

// 各ボタンにクリック時の処理を割り当てる
function setupShareEventListeners() {
  shareElements.shareOnInstagramButton.addEventListener("click", () => handleShareButtonClick("instagram"));
  shareElements.shareOnXButton.addEventListener("click", () => handleShareButtonClick("x"));
  shareElements.downloadButton.addEventListener("click", downloadCurrentShareImage);
}

// ------------------------------------------------------------
// 画像生成 → ワンタップシェア
// ------------------------------------------------------------

// 「Instagramでシェア」「Xでシェア」ボタンが押されたときの処理
// 画像を生成したうえで、Web Share APIに対応していればそのままOSの共有シートを開く
// （対応していない場合のみ、画像プレビュー＋保存ボタンのフォールバック表示に切り替える）
async function handleShareButtonClick(formatKey) {
  // 診断結果が取得できていない場合は何もしない
  // （通常は結果が無いとこのボタン自体が表示されないため、念のための防御的チェック）
  if (!currentDiagnosisResult) {
    return;
  }

  const button = formatKey === "instagram" ? shareElements.shareOnInstagramButton : shareElements.shareOnXButton;
  const format = SHARE_IMAGE_FORMATS[formatKey];

  button.disabled = true;

  try {
    // タイプごとのキャラクター画像を読み込んでから描画する（読み込めない場合はnullのまま進む）
    const characterImage = await loadTypeCharacterImage(currentDiagnosisResult.typeCode);

    drawShareImage(shareElements.canvas, format, currentDiagnosisResult, characterImage);
    currentShareFormatKey = formatKey;

    const didShareNatively = await tryNativeShare();

    if (!didShareNatively) {
      showSharePreview(format);
    }
  } finally {
    button.disabled = false;
  }
}

// Web Share API（ファイル共有）に対応していれば、生成した画像でOSの共有シートを開く
// 対応していない場合や画像化に失敗した場合はfalseを返し、呼び出し側で保存プレビューにフォールバックする
function tryNativeShare() {
  return new Promise((resolve) => {
    shareElements.canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      const file = new File([blob], buildShareImageFileName(), { type: "image/png" });
      const canShareFiles =
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (!canShareFiles) {
        resolve(false);
        return;
      }

      try {
        await navigator.share({
          files: [file],
          title: "日本酒パーソナリティ診断",
          text: buildShareText()
        });
      } catch (error) {
        // ユーザーが共有シートをキャンセルした場合などもここに来るが、
        // シート自体は正しく表示できているため、保存プレビューへのフォールバックは行わない
      }

      resolve(true);
    }, "image/png");
  });
}

// シェア時に添える紹介文を組み立てる
function buildShareText() {
  return (
    currentDiagnosisResult.typeCode +
    "「" + currentDiagnosisResult.personality.typeName + "」" +
    " - 日本酒パーソナリティ診断"
  );
}

// タイプコードに対応するキャラクター画像（images/タイプコード.png）を読み込む
// 読み込みに失敗した場合はnullを返し、呼び出し側で代替表示にフォールバックする
function loadTypeCharacterImage(typeCode) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = "images/" + typeCode.toLowerCase() + ".png";
  });
}

// Canvasに指定フォーマット・診断結果の内容を描画する
function drawShareImage(canvas, format, resultData, characterImage) {
  canvas.width = format.width;
  canvas.height = format.height;

  const context = canvas.getContext("2d");

  drawBackground(context, format.width, format.height);
  const card = drawCard(context, format.width, format.height);
  drawContent(context, card, resultData, characterImage);
}

// 背景のグラデーションを描画する
function drawBackground(context, width, height) {
  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#fff1e2");
  gradient.addColorStop(1, "#ffcda0");

  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

// コンテンツを載せる白い角丸カードを描画し、カードの座標・サイズを返す
function drawCard(context, width, height) {
  const marginX = width * 0.06;
  const marginY = height * 0.06;
  const card = {
    x: marginX,
    y: marginY,
    width: width - marginX * 2,
    height: height - marginY * 2
  };
  const cornerRadius = Math.min(card.width, card.height) * 0.06;

  context.save();
  context.shadowColor = "rgba(232, 93, 42, 0.25)";
  context.shadowBlur = width * 0.03;
  context.shadowOffsetY = height * 0.01;

  context.fillStyle = "#ffffff";
  drawRoundedRectPath(context, card.x, card.y, card.width, card.height, cornerRadius);
  context.fill();
  context.restore();

  return card;
}

// 角丸の矩形パスを作成する（塗り・線の指定は呼び出し側で行う）
function drawRoundedRectPath(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

// カード内にタイトル・タイプ情報・日本酒情報を描画する
// カードの高さに対する割合（0〜1）で各要素の縦位置を決めることで、
// 縦長（Instagram）・横長（X）どちらのフォーマットでも崩れにくいようにしている
function drawContent(context, card, resultData, characterImage) {
  const centerX = card.x + card.width / 2;
  const baseFontSize = Math.min(card.width, card.height);

  context.textAlign = "center";
  context.textBaseline = "middle";

  // アプリのロゴ・コピー
  context.fillStyle = "#e85d2a";
  context.font = "bold " + Math.round(baseFontSize * 0.05) + "px " + FONT_FAMILY;
  context.fillText("日本酒パーソナリティ診断", centerX, card.y + card.height * 0.1);

  // タイプごとのキャラクター画像（読み込めなかった場合は絵文字で代替表示する）
  if (characterImage) {
    drawCharacterImage(context, characterImage, centerX, card.y + card.height * 0.23, card.height * 0.16);
  } else {
    context.font = Math.round(baseFontSize * 0.14) + "px sans-serif";
    context.fillText("🍶", centerX, card.y + card.height * 0.23);
  }

  // タイプコード（バッジ風の表示）
  drawTypeCodeBadge(context, centerX, card.y + card.height * 0.38, baseFontSize, resultData.typeCode);

  // タイプ名
  context.fillStyle = "#4a3f35";
  context.font = "bold " + Math.round(baseFontSize * 0.09) + "px " + FONT_FAMILY;
  context.fillText(resultData.personality.typeName, centerX, card.y + card.height * 0.48);

  // 区切り線
  drawDividerLine(context, centerX, card.y + card.height * 0.56, card.width * 0.4);

  // おすすめの日本酒ラベル
  context.fillStyle = "#8a7f72";
  context.font = Math.round(baseFontSize * 0.038) + "px " + FONT_FAMILY;
  context.fillText("おすすめの日本酒", centerX, card.y + card.height * 0.64);

  // おすすめの日本酒銘柄名（長い場合は折り返す）
  context.fillStyle = "#e85d2a";
  context.font = "bold " + Math.round(baseFontSize * 0.055) + "px " + FONT_FAMILY;
  const brandLines = wrapTextLines(context, resultData.sake.brandName, card.width * 0.82);
  drawMultilineCenteredText(context, brandLines, centerX, card.y + card.height * 0.74, baseFontSize * 0.07);

  // フッター（ハッシュタグ）
  context.fillStyle = "#8a7f72";
  context.font = Math.round(baseFontSize * 0.032) + "px " + FONT_FAMILY;
  context.fillText("#日本酒パーソナリティ診断", centerX, card.y + card.height * 0.94);
}

// タイプごとのキャラクター画像を、指定した中心座標を基準に正方形の枠に収まるよう描画する
// 画像の縦横比を保ったまま、はみ出さないように縮小して中央揃えする（contain方式）
function drawCharacterImage(context, image, centerX, centerY, boxSize) {
  const aspectRatio = image.naturalWidth / image.naturalHeight;
  const drawWidth = aspectRatio >= 1 ? boxSize : boxSize * aspectRatio;
  const drawHeight = aspectRatio >= 1 ? boxSize / aspectRatio : boxSize;

  context.drawImage(image, centerX - drawWidth / 2, centerY - drawHeight / 2, drawWidth, drawHeight);
}

// タイプコードを、丸い背景（バッジ）付きで描画する
function drawTypeCodeBadge(context, centerX, centerY, baseFontSize, typeCode) {
  context.font = "bold " + Math.round(baseFontSize * 0.055) + "px " + FONT_FAMILY;

  const paddingX = baseFontSize * 0.05;
  const textWidth = context.measureText(typeCode).width;
  const badgeWidth = textWidth + paddingX * 2;
  const badgeHeight = baseFontSize * 0.09;

  context.fillStyle = "#ffe4d1";
  drawRoundedRectPath(
    context,
    centerX - badgeWidth / 2,
    centerY - badgeHeight / 2,
    badgeWidth,
    badgeHeight,
    badgeHeight / 2
  );
  context.fill();

  context.fillStyle = "#e85d2a";
  context.fillText(typeCode, centerX, centerY);
}

// 中央揃えの水平な区切り線を描画する
function drawDividerLine(context, centerX, y, lineWidth) {
  context.strokeStyle = "#ffd9b8";
  context.lineWidth = Math.max(2, lineWidth * 0.01);
  context.beginPath();
  context.moveTo(centerX - lineWidth / 2, y);
  context.lineTo(centerX + lineWidth / 2, y);
  context.stroke();
}

// 指定した最大幅に収まるよう、テキストを1文字ずつ改行して配列で返す
// （日本語は単語間にスペースが無いため、単語単位ではなく文字単位で折り返す）
function wrapTextLines(context, text, maxWidth) {
  const lines = [];
  let currentLine = "";

  for (const character of text) {
    const testLine = currentLine + character;

    if (context.measureText(testLine).width > maxWidth && currentLine !== "") {
      lines.push(currentLine);
      currentLine = character;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine !== "") {
    lines.push(currentLine);
  }

  return lines;
}

// 複数行のテキストを、指定した中心座標を基準に上下均等に配置して描画する
function drawMultilineCenteredText(context, lines, centerX, centerY, lineHeight) {
  const totalHeight = lineHeight * lines.length;
  const startY = centerY - totalHeight / 2 + lineHeight / 2;

  lines.forEach((line, index) => {
    context.fillText(line, centerX, startY + lineHeight * index);
  });
}

// ------------------------------------------------------------
// プレビュー表示
// ------------------------------------------------------------

// 生成した画像のプレビューエリアを表示し、キャプションを更新する
function showSharePreview(format) {
  shareElements.previewArea.hidden = false;
  shareElements.previewCaption.textContent =
    "プレビュー：" + format.label + "（" + format.width + "×" + format.height + "px）";
}

// ------------------------------------------------------------
// 画像の保存（ダウンロード）
// ------------------------------------------------------------

// 「画像を保存する」ボタンが押されたときの処理：現在のCanvasの内容をPNGとしてダウンロードする
function downloadCurrentShareImage() {
  if (!currentShareFormatKey) {
    return;
  }

  const fileName = buildShareImageFileName();

  shareElements.canvas.toBlob((blob) => {
    if (!blob) {
      return;
    }
    triggerBlobDownload(blob, fileName);
  }, "image/png");
}

// 保存時のファイル名を組み立てる（例：sake-personality-EPFC-instagram.png）
function buildShareImageFileName() {
  const typeCode = currentDiagnosisResult ? currentDiagnosisResult.typeCode : "result";
  return "sake-personality-" + typeCode + "-" + currentShareFormatKey + ".png";
}

// Blobを一時的なリンクとして生成し、クリックしてダウンロードを発火させる
function triggerBlobDownload(blob, fileName) {
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = blobUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  URL.revokeObjectURL(blobUrl);
}
