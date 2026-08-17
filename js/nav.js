// nav.js
// 全ページ共通の右上ナビゲーション（3本線ボタン）の開閉を制御するスクリプト。
// 役割：ボタンクリックでのメニュー開閉 → 外側クリック／Escキーでのメニュー閉じる処理。

document.addEventListener("DOMContentLoaded", initNavMenu);

function initNavMenu() {
  const toggleButton = document.getElementById("navToggleButton");
  const menu = document.getElementById("navMenu");

  // ナビゲーションが存在しないページでは何もしない
  if (!toggleButton || !menu) {
    return;
  }

  toggleButton.addEventListener("click", () => handleToggleButtonClick(toggleButton, menu));
  setupOutsideClickHandler(toggleButton, menu);
  setupEscapeKeyHandler(menu, toggleButton);
}

// ハンバーガーボタンが押されたときの処理：開いていれば閉じる、閉じていれば開く
function handleToggleButtonClick(toggleButton, menu) {
  if (menu.hidden) {
    openNavMenu(toggleButton, menu);
  } else {
    closeNavMenu(toggleButton, menu);
  }
}

// メニューを開く
function openNavMenu(toggleButton, menu) {
  menu.hidden = false;
  toggleButton.setAttribute("aria-expanded", "true");
  toggleButton.setAttribute("aria-label", "メニューを閉じる");
}

// メニューを閉じる
function closeNavMenu(toggleButton, menu) {
  menu.hidden = true;
  toggleButton.setAttribute("aria-expanded", "false");
  toggleButton.setAttribute("aria-label", "メニューを開く");
}

// メニューの外側をクリックしたときに閉じるようにする
function setupOutsideClickHandler(toggleButton, menu) {
  document.addEventListener("click", (event) => {
    const isClickInsideNav = toggleButton.contains(event.target) || menu.contains(event.target);

    if (!isClickInsideNav && !menu.hidden) {
      closeNavMenu(toggleButton, menu);
    }
  });
}

// Escキーでメニューを閉じられるようにする
function setupEscapeKeyHandler(menu, toggleButton) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      closeNavMenu(toggleButton, menu);
    }
  });
}
