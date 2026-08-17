// questionsData.js
// 32問分の質問データをJavaScriptの変数として定義したファイル。
// data/questions.json と同じ内容だが、<script>タグで読み込むことで
// ブラウザでindex.htmlを直接開いた場合（file://）でも、fetch()のCORS制限を受けずに動作するようにしている。
// 内容を変更する場合は、data/questions.json と両方を同じ内容に更新すること。
const questionsData = [
  { "id": 29, "question": "寒さや暑さに弱く、冷え性や体温調節に悩まされることが多い。", "agreeType": "S", "disagreeType": "C" },
  { "id": 4,  "question": "悩み事やストレスがあるときは、誰かに話してスッキリしたい。", "agreeType": "E", "disagreeType": "I" },
  { "id": 17, "question": "何をするにも時間効率（タイパ）や無駄のなさを最優先に考えたい。", "agreeType": "F", "disagreeType": "D" },
  { "id": 31, "question": "ストレスや不安が溜まると、食生活が大きく乱れる。", "agreeType": "S", "disagreeType": "C" },
  { "id": 8,  "question": "自宅で一人で静かに食べる食事より、みんなでワイワイ賑やかに食べる食事が好きだ。", "agreeType": "E", "disagreeType": "I" },
  { "id": 14, "question": "突発的なトラブルが起きても焦らず、冷静に次の計画を修正できる。", "agreeType": "P", "disagreeType": "A" },
  { "id": 2,  "question": "初対面の人ばかりの集まりでも、それほど緊張せず自分から話しかけられる。", "agreeType": "E", "disagreeType": "I" },
  { "id": 25, "question": "嫌なことや落ち込むことがあっても、一晩寝れば引きずらない方だ。", "agreeType": "C", "disagreeType": "S" },
  { "id": 20, "question": "スキマ時間を、作業や短時間の予定で有効活用するのが得意だ。", "agreeType": "F", "disagreeType": "D" },
  { "id": 11, "question": "自分の感覚や感情を信じて決定を下す事が多い。", "agreeType": "A", "disagreeType": "P" },
  { "id": 32, "question": "暴飲暴食をしたり、夜遅くに重いものを食べたりすると、翌朝高確率で胃もたれや肌荒れが起きる。", "agreeType": "S", "disagreeType": "C" },
  { "id": 6,  "question": "自分の考えやその日あった出来事を、進んで人にシェアしたい方だ。", "agreeType": "E", "disagreeType": "I" },
  { "id": 27, "question": "季節の変わり目や天気の変化（気圧の低下など）で、頭痛や体のだるさを感じやすい。", "agreeType": "S", "disagreeType": "C" },
  { "id": 15, "question": "買い物に行く前に、冷蔵庫の中身を確認して、計画を立ててから行く。", "agreeType": "P", "disagreeType": "A" },
  { "id": 1,  "question": "週末は一人で過ごすより、友達や誰かと一緒に過ごす方が元気が出る。", "agreeType": "E", "disagreeType": "I" },
  { "id": 22, "question": "自分の専門分野や趣味に関して、他人が気づかないような細かい部分まで徹底的にこだわりたい。", "agreeType": "D", "disagreeType": "F" },
  { "id": 9,  "question": "物事を進めるときは、事前にしっかり計画を立ててから行動する。", "agreeType": "P", "disagreeType": "A" },
  { "id": 30, "question": "ちょっとした他人の一言がしばらく気になって、夜なかなか眠れなくなることがある。", "agreeType": "S", "disagreeType": "C" },
  { "id": 13, "question": "自宅では、自分で決めたルーティンを着実にこなす方が安心感を得られる。", "agreeType": "P", "disagreeType": "A" },
  { "id": 5,  "question": "休日の予定は、何日も前から誰かと約束を入れることが多い。", "agreeType": "E", "disagreeType": "I" },
  { "id": 19, "question": "準備やプロセスを楽しむより、早く結果や成果を出したいせっかちなタイプだ。", "agreeType": "F", "disagreeType": "D" },
  { "id": 24, "question": "食事は味だけでなく、お皿の綺麗さ、盛り付けの美しさ（彩り）も満足感に大きく影響する。", "agreeType": "D", "disagreeType": "F" },
  { "id": 10, "question": "締め切りや約束の時間は、何があっても厳格に守るタイプだ。", "agreeType": "P", "disagreeType": "A" },
  { "id": 28, "question": "メンタルが常に安定しており、緊張する場面でも普段通りの実力を出せる。", "agreeType": "C", "disagreeType": "S" },
  { "id": 3,  "question": "自分の部屋にこもっている時間が長くなると、退屈や寂しさを感じやすい。", "agreeType": "E", "disagreeType": "I" },
  { "id": 18, "question": "日常の持ち物やインテリアの「見た目の美しさ・デザイン」には強いこだわりがある。", "agreeType": "D", "disagreeType": "F" },
  { "id": 12, "question": "衝動買いをすることは滅多になく、本当に必要かよく考えてからお金を使う。", "agreeType": "P", "disagreeType": "A" },
  { "id": 26, "question": "周りの人の不機嫌な態度や、その場のピリピリした空気を過剰に気にしてしまう。", "agreeType": "S", "disagreeType": "C" },
  { "id": 16, "question": "メニューを選ぶときは、その時の気分より、栄養バランスやカロリーを優先する。", "agreeType": "P", "disagreeType": "A" },
  { "id": 21, "question": "多少雑であっても、スピード感を持って物事を早く終わらせる方がスッキリする。", "agreeType": "F", "disagreeType": "D" },
  { "id": 7,  "question": "SNSで見かけた話題のお店や新しいレストランには、誰かを誘って一緒に行きたい。", "agreeType": "E", "disagreeType": "I" },
  { "id": 23, "question": "栄養ゼリーやプロテイン、丼ものなど、短時間で手軽にサッと食べられるものは合理的で好きだ。", "agreeType": "F", "disagreeType": "D" }
];
