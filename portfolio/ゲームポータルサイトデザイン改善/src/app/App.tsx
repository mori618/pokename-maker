import { useState, useMemo, useEffect, useCallback } from "react";
import { Search, X, Play, ExternalLink, Gamepad2, ChevronRight } from "lucide-react";

/* ── Data ──────────────────────────────────────────────────────────────── */
const GAMES = [
  {
    id: "001",
    title: "ネオン迷路",
    title_en: "Neon Maze",
    description_short: "光と影が交差する迷路を突破せよ。ステージが進むほど複雑に絡み合う道が待ち受ける。",
    tags: ["パズル", "アクション"],
    created_at: "2025-01-10",
    in_development: false,
    disabled: false,
    detail_url: "#",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=120&h=120&fit=crop&auto=format",
  },
  {
    id: "002",
    title: "スペースランナー",
    title_en: "Space Runner",
    description_short: "無限に広がる宇宙空間を駆け抜ける無限スクロールゲーム。隕石を避けながらハイスコアを狙え。",
    tags: ["アクション", "スコアアタック"],
    created_at: "2024-11-22",
    in_development: false,
    disabled: false,
    detail_url: "#",
    thumbnail: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=120&h=120&fit=crop&auto=format",
  },
  {
    id: "003",
    title: "タイル崩し",
    title_en: "Tile Break",
    description_short: "クラシックなブロック崩しを現代風にアレンジ。特殊ブロックとコンボシステムで爽快感倍増。",
    tags: ["アクション", "クラシック"],
    created_at: "2024-09-05",
    in_development: false,
    disabled: false,
    detail_url: "#",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=120&fit=crop&auto=format",
  },
  {
    id: "004",
    title: "ワードハント",
    title_en: "Word Hunt",
    description_short: "文字パネルから隠れたワードを見つけ出せ。制限時間内にいくつのワードを発見できるか？",
    tags: ["パズル", "言葉"],
    created_at: "2024-07-18",
    in_development: false,
    disabled: false,
    detail_url: "#",
    thumbnail: "https://images.unsplash.com/photo-1632516643720-e7f5d7d6ecc9?w=120&h=120&fit=crop&auto=format",
  },
  {
    id: "005",
    title: "シャドウダンジョン",
    title_en: "Shadow Dungeon",
    description_short: "暗闇に包まれたダンジョンを攻略するローグライク。ランダム生成マップで毎回違う冒険が始まる。",
    tags: ["RPG", "ローグライク"],
    created_at: "2025-04-01",
    in_development: true,
    disabled: false,
    detail_url: "#",
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=120&h=120&fit=crop&auto=format",
  },
  {
    id: "006",
    title: "リズムバトル",
    title_en: "Rhythm Battle",
    description_short: "音楽に合わせてタイミングよくボタンを押すリズムゲーム。曲のビートを体で感じながら戦え。",
    tags: ["音楽", "アクション"],
    created_at: "2025-03-15",
    in_development: false,
    disabled: false,
    detail_url: "#",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&h=120&fit=crop&auto=format",
  },
  {
    id: "007",
    title: "カラーフロー",
    title_en: "Color Flow",
    description_short: "色の波を操作して画面を塗り尽くす戦略パズル。シンプルなルールの中に深い読み合いが宿る。",
    tags: ["パズル", "戦略"],
    created_at: "2024-05-30",
    in_development: false,
    disabled: true,
    detail_url: "#",
    thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=120&h=120&fit=crop&auto=format",
  },
  {
    id: "008",
    title: "タワーデフェンス X",
    title_en: "Tower Defense X",
    description_short: "押し寄せる敵の波からベースを守り抜け。タワーのアップグレードと配置の工夫が勝利の鍵。",
    tags: ["タワーディフェンス", "戦略"],
    created_at: "2025-05-20",
    in_development: true,
    disabled: false,
    detail_url: "#",
    thumbnail: "https://images.unsplash.com/photo-1600861194802-a2b11076bc51?w=120&h=120&fit=crop&auto=format",
  },
];

const ALL_TAGS = ["すべて", ...Array.from(new Set(GAMES.flatMap((g) => g.tags)))];

/* ── Icon thumbnail ────────────────────────────────────────────────────── */
function GameIcon({ game }: { game: (typeof GAMES)[number] }) {
  const [err, setErr] = useState(false);
  const gradients = [
    "from-violet-400 to-indigo-500",
    "from-sky-400 to-blue-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-400",
    "from-rose-400 to-pink-500",
    "from-fuchsia-400 to-purple-500",
  ];
  const g = gradients[(game.title.charCodeAt(0) || 0) % gradients.length];
  return (
    <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-gray-100 shadow-sm">
      {err ? (
        <div className={`w-full h-full bg-gradient-to-br ${g} flex items-center justify-center text-white text-xl font-bold`}>
          {game.title.charAt(0)}
        </div>
      ) : (
        <img
          src={game.thumbnail}
          alt={game.title}
          onError={() => setErr(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

/* ── Tag chip ──────────────────────────────────────────────────────────── */
function Tag({ label }: { label: string }) {
  const palette: Record<string, string> = {
    パズル:         "bg-violet-50 text-violet-600",
    アクション:     "bg-rose-50 text-rose-600",
    スコアアタック: "bg-amber-50 text-amber-600",
    クラシック:     "bg-stone-100 text-stone-500",
    言葉:           "bg-sky-50 text-sky-600",
    RPG:            "bg-emerald-50 text-emerald-600",
    ローグライク:   "bg-lime-50 text-lime-700",
    音楽:           "bg-pink-50 text-pink-600",
    戦略:           "bg-indigo-50 text-indigo-600",
    タワーディフェンス: "bg-orange-50 text-orange-600",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full ${palette[label] ?? "bg-gray-100 text-gray-500"}`}>
      {label}
    </span>
  );
}

/* ── Game row ──────────────────────────────────────────────────────────── */
function GameRow({ game, onOpen }: { game: (typeof GAMES)[number]; onOpen: (g: (typeof GAMES)[number]) => void }) {
  return (
    <button
      className={`group w-full text-left flex items-center gap-4 px-4 py-4 rounded-xl transition-colors duration-150 hover:bg-black/[0.03] ${
        game.disabled ? "opacity-40 pointer-events-none" : ""
      }`}
      onClick={() => onOpen(game)}
      disabled={game.disabled}
    >
      {/* Icon */}
      <GameIcon game={game} />

      {/* Text */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-[15px] text-gray-900 leading-tight">{game.title}</span>
          <span className="text-xs text-gray-400 font-normal">{game.title_en}</span>
          {game.in_development && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              開発中
            </span>
          )}
        </div>
        <p className="text-[13px] text-gray-500 leading-snug line-clamp-1 max-w-xl">{game.description_short}</p>
        <div className="flex gap-1.5 flex-wrap">
          {game.tags.map((t) => <Tag key={t} label={t} />)}
        </div>
      </div>

      {/* Arrow */}
      <ChevronRight size={18} className="shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" />
    </button>
  );
}

/* ── Modal ─────────────────────────────────────────────────────────────── */
function GameModal({ game, onClose }: { game: (typeof GAMES)[number] | null; onClose: () => void }) {
  useEffect(() => {
    if (!game) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [game, onClose]);

  if (!game) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 shrink-0">
        <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
          <X size={15} />
        </button>
        <GameIcon game={game} />
        <div>
          <p className="font-semibold text-sm text-gray-900">{game.title}</p>
          <p className="text-xs text-gray-400">{game.title_en}</p>
        </div>
        <a
          href={game.detail_url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
        >
          <Play size={12} fill="currentColor" />
          プレイ
        </a>
      </div>
      <div className="flex-1 bg-gray-50 flex items-center justify-center text-gray-300">
        <div className="text-center space-y-2">
          <Gamepad2 size={48} strokeWidth={1} className="mx-auto" />
          <p className="text-sm">{game.title}</p>
        </div>
      </div>
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────────────── */
export default function App() {
  const [tag, setTag] = useState("すべて");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "name">("newest");
  const [active, setActive] = useState<(typeof GAMES)[number] | null>(null);

  const filtered = useMemo(() => {
    let r = GAMES;
    if (tag !== "すべて") r = r.filter((g) => g.tags.includes(tag));
    if (query.trim()) {
      const q = query.toLowerCase();
      r = r.filter((g) => g.title.includes(q) || g.description_short.includes(q) || g.tags.some((t) => t.includes(q)));
    }
    return [...r].sort((a, b) => {
      if (sort === "newest") return +new Date(b.created_at) - +new Date(a.created_at);
      if (sort === "oldest") return +new Date(a.created_at) - +new Date(b.created_at);
      return a.title.localeCompare(b.title, "ja");
    });
  }, [tag, query, sort]);

  const open = useCallback((g: (typeof GAMES)[number]) => setActive(g), []);
  const close = useCallback(() => setActive(null), []);

  const playable = GAMES.filter((g) => !g.in_development && !g.disabled).length;

  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans JP', 'Geist', sans-serif" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Gamepad2 size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm text-gray-900 tracking-tight">GAME ARCADE</span>
          </div>

          {/* Search bar — expands inline */}
          <div className={`flex-1 transition-all duration-200 ${searchOpen ? "max-w-xs" : "max-w-0 overflow-hidden"}`}>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                autoFocus={searchOpen}
                type="text"
                placeholder="ゲームを検索..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-400 text-gray-900"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Tags toggle */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                searchOpen || query ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              aria-label="検索"
            >
              <Search size={13} />
            </button>
            <span className="text-[11px] text-gray-400 hidden sm:block" style={{ fontFamily: "'Geist Mono', monospace" }}>
              {playable} games
            </span>
          </div>
        </div>

        {/* Tag bar */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-2.5 flex items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {ALL_TAGS.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  tag === t
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="text-xs text-gray-400 bg-transparent focus:outline-none cursor-pointer hover:text-gray-700 transition-colors shrink-0"
          >
            <option value="newest">最新順</option>
            <option value="oldest">古い順</option>
            <option value="name">名前順</option>
          </select>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Divider */}
        <div className="flex items-center gap-2 my-3">
          <div className="h-px flex-1 bg-gray-100" />
          <span className="text-[11px] text-gray-400" style={{ fontFamily: "'Geist Mono', monospace" }}>
            {filtered.length} 件
          </span>
          <div className="h-px flex-1 bg-gray-100" />
        </div>

        {/* List */}
        <section className="-mx-4 sm:-mx-6">
          {filtered.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Gamepad2 size={32} strokeWidth={1} className="mx-auto text-gray-300" />
              <p className="text-sm text-gray-400">ゲームが見つかりませんでした</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((g) => <GameRow key={g.id} game={g} onOpen={open} />)}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="py-12 text-center text-xs text-gray-300 border-t border-gray-100 mt-4">
          © {new Date().getFullYear()} GAME ARCADE — all games handcrafted & free
        </footer>
      </div>

      <GameModal game={active} onClose={close} />
    </div>
  );
}
