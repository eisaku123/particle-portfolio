# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

マウスに反応するパーティクルと3D地球儀を備えたインタラクティブなポートフォリオサイト。純粋なHTML/CSS/JavaScriptのみで構築。フレームワーク・ビルドツール・外部依存なし。

## 実行方法

```bash
open particle-portfolio/index.html
```

ビルド不要、サーバー不要。package.json・リンター・テストフレームワークは未導入。

## アーキテクチャ

全コードは `particle-portfolio/` 配下:

- **index.html** — セマンティックHTML。2つの`<canvas>`要素（パーティクル用・地球儀用）とポートフォリオコンテンツ
- **css/style.css** — CSS変数によるテーマ管理(`--color-*`)、レスポンシブ対応（900px/768px/480px）
- **js/main.js** — IIFE内に3つのクラスを含むアプリケーション全体のロジック

### JavaScriptクラス構成 (js/main.js)

- **Particle** — 個々のパーティクル。位置・速度・wobble（ゆらぎ）で有機的な浮遊を実現。マウスに引き寄せられる
- **ParticleSystem** — パーティクル群の管理。Canvas 2D描画ループ(requestAnimationFrame)、近接パーティクル間の接続線描画（O(n²)、二乗距離で最適化）、画面サイズに応じたパーティクル数調整（モバイル40-60、デスクトップ80-150）
- **Globe** — 簡略化した大陸輪郭（緯度経度座標データ）を持つ3Dワイヤーフレーム地球儀。ドラッグ回転（マウス+タッチ）・慣性・自動回転・ホバーグロー対応。Y軸回転+X軸傾斜による3D→2D投影

末尾にユーティリティ関数: `initFadeIn()`（IntersectionObserver）、`initHeaderScroll()`、`initMobileNav()`

### z-indexレイヤー構造

| レイヤー | z-index | 要素 |
|---------|---------|------|
| パーティクル | 0 | `#particle-canvas`（fixed、pointer-events: none） |
| コンテンツ | 1 | 全`<section>`要素 |
| 地球儀 | 10 | `.globe-fixed` canvas（fixed中央配置、border-radiusで円形ヒットエリア） |
| ヘッダー | 100 | `.header` ナビゲーション |

## コーディング規約

- コメント・仕様書は日本語
- CSSクラス名・コード識別子は英語
- スタイルは`:root`で定義したCSS変数を使用
- Canvas要素は`position: fixed`で背景/オーバーレイとして配置
- モバイルのタッチリスナーは`{ passive: true }`でスクロール性能を確保
