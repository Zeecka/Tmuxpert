/**
 * English — the source of truth and the fallback for every other language.
 *
 * Conventions for translators (fr/es/ru/zh mirror these keys):
 * - Keep each value a COMPLETE phrase/sentence; never split a sentence across
 *   keys (word order varies by language).
 * - `{name}` placeholders are interpolated at runtime — keep them verbatim.
 * - Text in `backticks` renders as a keycap (e.g. `x`, `Esc`, `Ctrl-b`). NEVER
 *   translate what is inside backticks — those are literal Vim keys.
 * - Keep glyphs like ★, ☠, →, ▶ as-is.
 * - Vim itself, mode names shown as keycaps, and command mnemonics stay English.
 */
export const en: Record<string, string> = {
  // ── Language switcher ───────────────────────────────────────────────
  'lang.label': 'Language',
  'lang.auto': 'Auto-detected',

  // ── Common ──────────────────────────────────────────────────────────
  'common.cancel': 'Cancel',
  'common.backHome': 'back home',
  'common.close': 'Close',

  // ── Home ────────────────────────────────────────────────────────────
  'home.tagline': 'Learn tmux by playing. Real prefix keys, real muscle memory, no config to memorize.',
  'home.customize': 'customize your character',
  'home.customizeTitle': 'Customize your character',
  'home.continueCampaign': 'Continue Campaign',
  'home.startCampaign': 'Start Campaign',
  'home.motionRush': 'Prefix Rush',
  'home.quizMode': 'Quiz Mode',
  'home.resetProgress': 'reset progress',
  'home.resetTitle': 'Reset everything?',
  'home.resetBody':
    "This erases all progress — levels, XP, coins, streak and cosmetics — and can't be undone.",
  'home.resetConfirm': 'Reset everything',
  'home.freeOss': 'free & open source',
  'home.donate': 'donate',
  'stats.level': 'LEVEL',
  'stats.coins': 'COINS',
  'stats.solved': 'SOLVED',
  'stats.mastered': 'MASTERED',
  'stats.rush': 'RUSH',

  // ── HUD (top bar) ───────────────────────────────────────────────────
  'hud.customize': 'customize',
  'hud.maps': 'maps',
  'hud.mapsTitle': 'World map',
  'hud.quiz': 'quiz',
  'hud.quizTitle': 'Quiz mode — tap-to-answer trainer',
  'hud.cheatsheet': 'cheatsheet',
  'hud.share': 'share my score',
  'hud.shareTitle': 'Share my score',
  'hud.dayStreak': 'day streak',
  'hud.streakActive': '{n}-day streak — play daily to keep it alive',
  'hud.streakInactive': 'Play daily to build a streak',
  'hud.shopTitle': 'Shop',
  'hud.shopAria': 'Shop — {n} coins',
  'hud.mute': 'Mute sound',
  'hud.unmute': 'Unmute sound',
  'hud.shared': 'Shared! 🎉',
  'hud.scoreCopied': 'Score copied to clipboard!',
  'hud.shareFailed': 'Could not share — try again',
  'hud.signInNote': 'Sign in first and your share link shows a verified, server-stored score.',

  // ── World map ───────────────────────────────────────────────────────
  'map.title': 'Campaign',
  'map.subtitle': 'Clear a world to unlock the next. Fewer keystrokes = more stars.',
  'map.worldLabel': 'World {n} · {name}',
  'map.comingSoon': 'Coming soon',
  'map.cleared': 'Cleared',
  'map.locked': 'Locked',
  'map.stub': 'Curriculum stub — {subtitle}. Landing in a future update.',
  'map.lockedHint': 'Locked — clear World {prev} to unlock these {count} challenges.',

  // ── Campaign (playing a level) ──────────────────────────────────────
  'campaign.bossFight': 'Boss Fight',
  'campaign.worldLabel': 'World {n} · {title}',
  'campaign.goalPar': 'goal {par}',
  'campaign.needHint': 'Need a hint?',
  'campaign.howToPlay': 'How to play',
  'campaign.cheatsheet': 'Cheatsheet',
  'campaign.restart': 'Restart',
  'campaign.restartTitle': 'Restart this level from the beginning',
  'campaign.quit': 'Quit',
  'campaign.quitTitle': 'Leave this level and return to the world map',
  'campaign.hintLabel': 'Hint',
  'campaign.bossIntegrity': 'Boss integrity',
  'campaign.keystrokesLeft': '{n} keystrokes left',
  'campaign.repelled': 'REPELLED!',
  'campaign.repelledBody':
    '{title} shrugged off your {n} keystrokes — the budget was {budget}. Reload and clear it in {par} keystrokes or fewer to earn ★★★.',
  'campaign.retryFor3': 'Retry for 3 ★',
  'campaign.backToMap': 'Back to map',

  // ── Result screen ───────────────────────────────────────────────────
  'result.bossDefeated': 'BOSS DEFEATED!',
  'result.perfect': 'PERFECT!',
  'result.solved': 'SOLVED!',
  'result.keystrokesLabel': 'keystrokes',
  'result.goalLabel': 'goal',
  'result.improveHint': 'solve in {par} keystrokes or fewer to earn ★★★',
  'result.alreadyMastered': 'already mastered — replaying for practice',
  'result.levelUp': 'LEVEL UP → {n}',
  'result.commandMastered': 'binding mastered:',
  'result.retryFor3': 'Retry for 3 ★',
  'result.replay': 'Replay',
  'result.map': 'Map',
  'result.next': 'Next',
  'result.nextWorld': 'Next world',
  'result.pressEnter': 'press `Enter` to continue',
  'result.shareMyScore': 'share my score',
  'result.shared': 'Shared! 🎉',
  'result.copied': 'Copied to clipboard!',
  'result.shareFailed': 'Could not share',

  // ── Arcade (Prefix Rush) ────────────────────────────────────────────
  'arcade.title': 'Prefix Rush',
  'arcade.tagline': '{sec} seconds. Fire the `C-b` prefix, then the shown key — as fast as you can.',
  'arcade.best': 'Best',
  'arcade.bestOver': 'best {n}',
  'arcade.score': 'SCORE',
  'arcade.combo': 'COMBO',
  'arcade.time': 'TIME',
  'arcade.timeUp': 'TIME!',
  'arcade.newBest': 'New best!',
  'arcade.startDrill': 'Start drill',
  'arcade.goAgain': 'Go again',
  'arcade.then': 'then',
  'arcade.armed': 'prefix armed — press the key!',
  'arcade.pressPrefix': 'press the prefix first',
  'arcade.drill.split-h': 'Split left / right',
  'arcade.drill.split-v': 'Split top / bottom',
  'arcade.drill.new-window': 'New window',
  'arcade.drill.next-window': 'Next window',
  'arcade.drill.prev-window': 'Previous window',
  'arcade.drill.zoom': 'Zoom pane',
  'arcade.drill.select-pane': 'Cycle panes',
  'arcade.drill.kill-pane': 'Kill pane',
  'arcade.drill.detach': 'Detach session',
  'arcade.drill.copy-mode': 'Copy mode',

  // ── Shop ────────────────────────────────────────────────────────────
  'shop.title': 'Shop',
  'shop.subtitle': 'Earn coins by playing. Spend them on your look.',
  'shop.tab.characters': 'Characters',
  'shop.tab.theme': 'Themes',
  'shop.tab.background': 'Backgrounds',
  'shop.character': 'Character',
  'shop.finish': 'Finish',
  'shop.pickHint': 'Pick your character, then a finish — it appears everywhere you play.',
  'shop.dragRotate': 'drag to rotate',
  'shop.equipped': 'Equipped',
  'shop.equip': 'Equip',
  'shop.equipName': 'Equip {name}',
  'shop.buyName': 'Buy {name} for {price} coins',

  // ── Hero panel ──────────────────────────────────────────────────────
  'hero.yourHero': 'Your Hero',
  'hero.level': 'Level {n}',
  'hero.loadout': 'Loadout',
  'hero.trophy.worlds': 'worlds cleared',
  'hero.trophy.perfects': 'perfect solves',
  'hero.trophy.mastered': 'bindings mastered',
  'hero.trophy.solved': 'levels solved',
  'hero.trophy.rush': 'rush best',
  'hero.coins': 'Coins',
  'hero.earnMore': '· earn more to unlock gear in the Shop',
  'rank.0': 'Rookie',
  'rank.1': 'Operator',
  'rank.2': 'Multiplexer',
  'rank.3': 'Hacker',
  'rank.4': 'Wizard',
  'rank.5': 'Legend',

  // ── XP bar ──────────────────────────────────────────────────────────
  'xp.lvl': 'LVL',

  // ── GitHub button ───────────────────────────────────────────────────
  'github.title': 'Star this project on GitHub',
  'github.star': 'Star',

  // ── How to play ─────────────────────────────────────────────────────
  'howto.title': 'How to play',
  'howto.dialogLabel': 'How to play TmuxLegends',
  'howto.intro':
    "TmuxLegends teaches tmux in a simulated multiplexer — the keys transfer straight to your terminal, with nothing to install and no config to memorize. Sixty seconds and you're playing:",
  'howto.step1.title': 'Everything starts with the prefix',
  'howto.step1.body':
    'tmux listens for one key combo — the prefix, `Ctrl`+`b` by default. Press it, release, then press the command key. So "split the pane" is `C-b` then `%` — never held together. The badge above the surface shows when tmux is waiting for that second key.',
  'howto.step2.title': 'Panes, windows, sessions',
  'howto.step2.body':
    "A pane is a split of the screen, a window is a tab holding panes, and a session holds windows. Detach a session with `C-b` `d` and everything keeps running — that's tmux's superpower.",
  'howto.step3.title': 'Every keystroke counts',
  'howto.step3.body':
    "Each level has a task and a goal — the fewest keystrokes a pro would use. Match or beat the goal for ⭐⭐⭐. It's golf: think, don't mash.",
  'howto.step4.title': 'Never stuck',
  'howto.step4.body':
    'Below the surface: "Need a hint?" spells out the move, "Cheatsheet" lists every binding, and "Restart" resets the level if you tangle it up. You can\'t break anything.',
  'howto.letsGo': "Let's go",

  // ── Cheatsheet ──────────────────────────────────────────────────────
  'cheatsheet.label': 'Cheatsheet',
  'cheatsheet.buttonTitle': 'tmux cheatsheet — every binding, downloadable',
  'cheatsheet.buttonAria': 'Open the tmux cheatsheet',
  'cheatsheet.title': 'tmux Cheatsheet',
  'cheatsheet.dialogLabel': 'tmux cheatsheet',
  'cheatsheet.summary': '{n} entries · default prefix {prefix} — press it, release, then the key',
  'cheatsheet.close': 'Close cheatsheet',
  'cheatsheet.filter': 'Filter bindings...',
  'cheatsheet.filterAria': 'Filter bindings',
  'cheatsheet.clearFilter': 'Clear filter',
  'cheatsheet.mastered': 'playable in TmuxLegends',
  'cheatsheet.noMatch': 'Nothing matches “{q}”.',
  'cheatsheet.takeItWithYou': 'Take it with you:',
  'cheatsheet.downloadPdf': 'Download PDF',
  'cheatsheet.downloadPdfTitle': 'Download the full cheatsheet as a PDF',
  'cheatsheet.downloadedPdf': 'Downloaded PDF ✓',

  // ── Account ─────────────────────────────────────────────────────────
  'account.dialogLabel': 'Sign in',
  'account.title': 'Save your progress',
  'account.body':
    'No account is needed to play. Sign in to keep your XP, coins and gear across devices — and to share a verified score backed by the server, not just text anyone could edit.',
  'account.continueWith': 'Continue with {provider}',
  'account.shareWithout': 'share without an account',
  'account.mergedNote': 'Your local progress is merged when you sign in.',
  'account.close': 'close',
  'account.signIn': 'Sign in',
  'account.saving': 'Saving…',
  'account.saved': 'Progress saved to your account',
  'account.notSaved': 'Not saved yet',
  'account.viaSaved': 'via {provider} · progress saved',
  'account.viaNotSaved': 'via {provider} · not saved yet',
  'account.signOut': 'Sign out',

  // ── Profile (shared score page) ─────────────────────────────────────
  'profile.notExist': 'This score link does not exist (or was deleted).',
  'profile.loadError': 'Could not load this score right now.',
  'profile.loading': 'Loading verified score…',
  'profile.verified': 'verified score · stored server-side',
  'profile.streak': '{n}-day streak',
  'profile.lastPlayed': 'last played {date}',
  'profile.cta': 'Think you can beat it? Play TmuxLegends',
  'profile.ctaSub': 'Learn tmux by playing — real prefix keys, real muscle memory. Free, no account needed.',

  // ── Quiz mode ───────────────────────────────────────────────────────
  'quiz.title': 'Quiz',
  'quiz.subtitle': 'Tap the right answer — no keyboard needed. Perfect on the go.',
  'quiz.best': 'best',
  'quiz.mixedRound': 'Mixed round',
  'quiz.mixedDesc': '{n} questions from every world',
  'quiz.orDrill': 'Or drill one world',
  'quiz.complete': 'Quiz complete',
  'quiz.pctCorrect': '{pct}% correct',
  'quiz.newBest': 'new best!',
  'quiz.retry': 'Retry',
  'quiz.chooseTopic': 'Choose topic',
  'quiz.question': 'Question {n} / {total}',
  'quiz.seeResults': 'See results',
  'quiz.nextQuestion': 'Next question',

  // ── Binding Belt ────────────────────────────────────────────────────
  'belt.title': 'Binding Belt',
  'belt.mastered': '{n}/{total} mastered',
  'belt.cat.Prefix': 'Prefix',
  'belt.cat.Panes': 'Panes',
  'belt.cat.Windows': 'Windows',
  'belt.cat.Sessions': 'Sessions',
  'belt.cat.Copy mode': 'Copy mode',
  'belt.cat.Layout': 'Layout',
  'belt.cat.Command': 'Command',

  // ── Worlds (content) ────────────────────────────────────────────────
  'content.world.1.name': 'Split',
  'content.world.1.subtitle': 'Panes & the prefix',
  'content.world.2.name': 'Windows',
  'content.world.2.subtitle': 'Your terminal tabs',
  'content.world.3.name': 'Sessions & Copy',
  'content.world.3.subtitle': 'Detach, search, yank',
  'content.world.4.name': 'Rearrange',
  'content.world.4.subtitle': 'Layouts, swap & break',
  'content.world.5.name': 'Command Line',
  'content.world.5.subtitle': 'The : prompt & scripting',
  'content.world.6.name': 'Power User',
  'content.world.6.subtitle': 'Resize, paste & scripting',
}
