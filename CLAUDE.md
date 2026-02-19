# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Google Calendarのサイドバーにあるカレンダーにタグを付け、タグ単位で表示/非表示を一括切り替えするChrome拡張（Manifest V3）。WXT + Vue 3 + Tailwind CSS で構築。

## 開発コマンド

```bash
pnpm dev      # 開発サーバー起動（HMR対応、chrome://extensions で読み込み）
pnpm build    # 本番ビルド → .output/chrome-mv3/
pnpm preview  # ビルド後プレビュー
```

テストフレームワークは未導入。

## アーキテクチャ

### WXT設定

- `wxt.config.ts`: エントリポイントは `src/entrypoints/` に配置（`entrypointsDir`設定）
- `srcDir: '.'` のため、src以外のルートファイルもソースディレクトリに含まれる
- Vue対応は `@wxt-dev/module-vue` モジュールで提供

### 3つのランタイムコンテキスト

**Content Script** (`src/entrypoints/content/index.ts`)
- `calendar.google.com` にのみ注入
- Shadow DOM内にVue App (`src/content/App.vue`) をマウントし、カレンダーサイドバーにタグUIを挿入
- Tailwind CSSはinline importでShadow DOM内に閉じ込め（`tailwind.css?inline`）
- `MutationObserver` でSPAナビゲーション後の再マウントに対応
- ドラッグ&ドロップでタグカードの位置を変更可能（位置は `chrome.storage.local` に保持）
- `calendarDom.ts`: Google CalendarのDOM構造を解析してカレンダー一覧を取得（heading / aria-label / role=tree の3段フォールバック）
- `calendarToggle.ts`: チェックボックスのclickイベントでカレンダーの表示/非表示を切り替え

**Background** (`src/entrypoints/background.ts`)
- Service Worker。SidePanel ↔ Content Script間のメッセージルーティング
- `sidePanelState` Mapでウィンドウごとのサイドパネル開閉状態を管理

**Side Panel** (`src/entrypoints/sidepanel/main.ts` → `src/sidepanel/App.vue`)
- タグのCRUD管理UI（一覧 / 作成・編集フォーム）
- `useMessages` composableでContent Scriptへカレンダー取得・トグル指令を送信（5秒タイムアウト + キャッシュフォールバック）

### メッセージング

`src/shared/services/messaging.ts` に型定義。`RuntimeMessage`（chrome.runtime経由）と `ContentMessage`（tabs.sendMessage経由）の2系統。

### データモデルと永続化

- `TagItem`: `{ id, name, color, calendarIds }` — タグとカレンダーは多対多
- `chrome.storage.local` にキー `gcalTaggle` で保存（`StoragePayload`型）
- `storage.ts` にはレガシーデータ（`calendarRefs`形式）のマイグレーション処理あり
- `useTags` composableで `chrome.storage.onChanged` を監視し、Content Script / SidePanel間でリアクティブに同期

### UIテーマ

- Content Script側: `src/content/ui/tokens.ts` + `theme.ts` でタグボタンのスタイルを動的生成（active/inactive × light/dark）
- `useTheme` composableで `prefers-color-scheme` を監視
- カスタムフォント: Space Grotesk（`tailwind.config.js`の`fontFamily.display`）
- タグカラー: `TAG_COLORS`定数（8色プリセット）

## 言語

UIは日本語/英語のGoogle Calendarに対応（`calendarDom.ts`のヘッディングテキスト配列で両言語のセクション見出しを検索）。
