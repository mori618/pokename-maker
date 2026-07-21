// 画面に表示されるテキストを管理するオブジェクト
const APP_TEXTS = {
  // ヘッダー部分
  header: {
    badge: "誰でも大歓迎", // ヘッダー上部の小さなバッジテキスト
    title: "個人ゲーム置き場", // メインタイトル
    description: "個人で作成したゲーム置き場です。課金要素などなく遊べますので、気軽に楽しんでいってください。" // タイトル下の説明文
  },
  
  // 状態表示（ローディング、エラー、空状態）
  status: {
    loading: "LOADING...", // 読み込み中に表示されるテキスト
    fetch_error: "データの読み込みに失敗しました", // データ取得失敗時のエラーメッセージ
    empty_title: "該当するゲームがありません", // ゲームが見つからなかった時の見出し
    empty_description: "フィルター条件を変更してみてください。" // ゲームが見つからなかった時の補足テキスト
  },

  // ゲームカード内
  card: {
    play_now: "詳細を見る", // ホバー時に表示されるオーバーレイのテキスト
    playable_title: "プレイ可能", // プレイ可能な状態を示す緑アイコンのホバーテキスト
    in_development_badge: "開発中", // 開発中のゲームに付与されるバッジのテキスト
    in_development_desc: "開発中のためバグや、おかしな部分があるかもしれません。見つけた際は〜〜までお伝えいただけると幸いです。" // 開発中のゲームの下部に表示される注意書き
  },

  // モーダルウィンドウ内
  modal: {
    close_aria: "閉じる", // 閉じるボタンのアクセシビリティ用ラベル
    new_tab_title: "別タブで開く" // 別タブで開くボタンのホバーテキスト
  },

  // フッター部分
  footer: {
    copyright: "ゆうらんど.", // コピーライト表示のテキスト（年数の後に続く）
    status: "開発中のものもあります." // フッター最下部のシステムステータステキスト
  }
};

// フィッシング・エボリューションのテキスト
APP_TEXTS.fishing = {
  hero: {
    title: "フィッシング<br class=\"hidden md:block\" />エボリューション", // メインタイトル
    subtitle: "釣りハクスラをイメージしています！<br class=\"md:hidden\" />\n        <span class=\"text-cyan-300\">魚を釣って装備を育てましょう</span><br class=\"hidden md:block\" />\n        ", // サブタイトル
    play_btn: "プレイ" // プレイボタン
  },
  point: {
    title: "ポイント", // セクションタイトル
    subtitle: "難しい操作はありません", // セクションサブタイトル
    desc1: "クリックだけで楽しめる釣りゲームです！ゲージをタイミングよく止めて大物を釣り上げましょう。<br class=\"hidden md:block\" />\n              釣った魚を売って、装備やスキルを手に入れられます。", // 説明1
    desc2: "魚図鑑コンプリート、スキルを組み合わせる自由な<span class=\"text-cyan-300 font-bold\">「ビルド構築」</span>、<br class=\"hidden md:block\" />\n                成長を楽しもう！" // 説明2
  },
  steps: {
    title: "遊び方の3ステップ", // セクションタイトル
    step1_title: "大物を釣り上げる！", // ステップ1タイトル
    step1_desc: "水面を見つめ、タイミングをあわせてゲージをストップ！", // ステップ1説明
    step2_title: "稼いで強化", // ステップ2タイトル
    step2_desc: "釣った魚を売却！稼いだお金で釣り竿やリールをアップグレード", // ステップ2説明
    step3_title: "スキルビルド", // ステップ3タイトル
    step3_desc: "様々な効果を持つスキルを獲得・合成。自分だけのビルドで、たくさん魚を釣り上げろ！" // ステップ3説明
  },
  footer: {
    tech: "<span class=\"text-cyan-500 mr-2\">✦</span>\n        <span class=\"font-bold text-slate-300\">開発技術:</span> JavaScript / HTML5 / CSS3 (Tailwind)", // 開発技術

  }
};

// GG Demonのテキスト
APP_TEXTS.ggdemon = {
  hero: {
    title: "<span class=\"text-neon-title block mb-2\">GG DEMON</span>\n        <span class=\"text-3xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-game-secondary to-blue-500 tracking-widest font-bold\">Battle Charge</span>",
    subtitle: "読み合いと戦略がすべて。<br class=\"md:hidden\" />\n        <span class=\"text-white font-bold border-b-2 border-game-primary/50 pb-1\">エネルギーを管理</span>してバトル<br class=\"hidden md:block\" />\n        ターン制バトルサバイバル！",
    play_btn: "プレイ！"
  },
  point: {
    title: "ポイント",
    desc1_title: "運か、実力か。<br /><span class=\"text-game-primary\">極限の読み合い！</span>",
    desc1_text: "ルールは簡単。敵の行動を予測し、「チャージ」「攻撃」「ガード」から最適な行動を選択。",
    desc2_title: "無限のタワーと<br /><span class=\"text-game-secondary\">最強ビルド構築</span>",
    desc2_text: "タワーモードでは無限に強くなる敵に立ち向かい、宝箱から強力なスキルや強化アイテムを手に入れて進めます。階層ごとのボスを撃破し、自分だけの最強ビルドで深層を目指せ！"
  },
  steps: {
    title: "遊び方",
    step1_title: "チャージ",
    step1_desc: "エネルギーを溜めます。攻撃はエネルギーがないとできません。一定数エネルギーを貯められれば勝利です",
    step2_title: "ガード",
    step2_desc: "敵の攻撃を見極め、ガードで防御。",
    step3_title: "攻撃",
    step3_desc: "相手の隙を突いて攻撃！溜めたエネルギーを使用して相手のHPを削りましょう。"
  },
  footer: {
    tech: "JavaScript / HTML5 / Tailwind CSS",

  }
};

// Puzzle Rogueのテキスト
APP_TEXTS.puzrogue = {
  hero: {
    title: "Puzzle Rogue",
    subtitle: "大連鎖！<br class=\"md:hidden\" />どんどんコンボしよう<br />\n        <span class=\"text-transparent bg-clip-text bg-gradient-to-r from-game-accent to-game-primary\">ローグライクパズル！</span>",
    play_btn: "プレイ！"
  },
  point: {
    title: "パズルを楽しもう<br /><span class=\"text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400\">！</span>",
    desc1: "「パズル」と「ローグライク」の融合。どんどん増えていくコンボを楽しもう。",
    desc2: "ピースを繋げて大連鎖！ショップで手に入る様々な性能のトークンを組み合わせ、自分だけの最強ビルドを構築しよう！"
  },
  steps: {
    step1_title: "パズルを連鎖させる",
    step1_desc: "同じ色のピースをなぞって繋げよう！目標コンボを達成しよう。",
    step2_title: "強力なスキルを獲得",
    step2_desc: "「トークン」を装備して能力を強化。組み合わせ次第でコンボはどんどん増えていく",
    step3_title: "深層へ挑む",
    step3_desc: "目標コンボはどんどん増えていく。トークンの組み合わせを考えて高みを目指せ"
  },
  footer: {
    tech: "<span class=\"font-bold text-slate-400\">System Ready:</span> React 18 / Tailwind CSS / LocalStorage",
    copyright: "&copy; 2026 Puzzle Rogue. All rights reserved."
  }
};

// スウィングジャンプのテキスト
APP_TEXTS.swingjump = {
  hero: {
    title: "スウィングジャンプ",
    subtitle: "限界を超えろ！<br class=\"md:hidden\" />ブランコの反動を活かして空高く舞い上がる<br />爽快ジャンプアクション！",
    play_btn: "今すぐプレイ！"
  },
  point: {
    title: "熱狂のポイント",
    desc1: "「あと少しだけ…！」が止まらない。",
    desc2: "操作は超シンプル。ブランコが最も勢いづいた瞬間を狙ってクリック（タップ）するだけ！振り子の物理挙動を読み切り、完璧なタイミングで空に飛び出そう。",
    desc3: "自己ベストを更新した時の爽快感は格別。友達とスコアを競い合って、トップジャンパーの称号を手にいれよう！"
  },
  steps: {
    title: "遊び方",
    step1_title: "パワーを貯める",
    step1_desc: "ブランコが勢いよく揺れるのを見極めよう！",
    step2_title: "タイミングを狙う",
    step2_desc: "最高点に達した瞬間にクリックまたはタップ！",
    step3_title: "空へテイクオフ！",
    step3_desc: "遠くまで飛んで最高記録を叩き出せ！"
  },
  footer: {
    tech: "<span class=\"font-bold text-slate-300\">開発技術:</span> JavaScript / HTML5 / CSS3",

  }
};
