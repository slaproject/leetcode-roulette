const express = require("express");
const cors = require("cors");
const { LeetCode } = require("leetcode-query");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
// Serve production client if built
app.use(express.static("client/dist"));

const lc = new LeetCode();

// Cache questions in memory to avoid repeated fetches
let cachedQuestions = null;
let lastFetchTs = 0;
const CACHE_MS = 1000 * 60 * 30; // 30 minutes

async function getAllQuestions() {
  const now = Date.now();
  if (cachedQuestions && now - lastFetchTs < CACHE_MS) {
    return cachedQuestions;
  }

  // Fetch ALL problems via pagination (library defaults to 100 per page)
  const pageSize = 2900;
  let offset = 0;
  let total = Infinity;
  const questions = [];

  while (offset < total) {
    const page = await lc.problems({ offset, limit: pageSize });
    const pageQuestions = page?.questions || [];
    if (typeof page?.total === "number") {
      total = page.total;
    }

    for (const q of pageQuestions) {
      questions.push({
        id: q.frontendQuestionId,
        title: q.title,
        titleSlug: q.titleSlug,
        difficulty: q.difficulty, // Easy | Medium | Hard
        topicTags: (q.topicTags || []).map((t) => t.name),
        paidOnly: Boolean(q.paidOnly),
        acRate: q.acRate,
        isFavor: q.isFavor,
        freqBar: q.freqBar,
        status: q.status,
      });
    }

    if (pageQuestions.length < pageSize) break;
    offset += pageSize;
  }

  cachedQuestions = questions;
  lastFetchTs = now;
  return cachedQuestions;
}

app.get("/api/meta", async (_req, res) => {
  try {
    const questions = await getAllQuestions();
    const tags = new Set();
    for (const q of questions) {
      for (const t of q.topicTags) tags.add(t);
    }
    res.json({
      difficulties: ["Easy", "Medium", "Hard"],
      tags: Array.from(tags).sort(),
      total: questions.length,
    });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
});

app.get("/api/roulette", async (req, res) => {
  try {
    const difficulty = req.query.difficulty; // optional: Easy|Medium|Hard
    const tag = req.query.tag; // optional: topic name
    const excludePaid = req.query.excludePaid !== "false"; // default true

    const questions = await getAllQuestions();
    let filtered = questions;

    if (difficulty) {
      filtered = filtered.filter((q) => q.difficulty === difficulty);
    }
    if (tag) {
      filtered = filtered.filter((q) => q.topicTags.includes(String(tag)));
    }
    if (excludePaid) {
      filtered = filtered.filter((q) => !q.paidOnly);
    }

    if (filtered.length === 0) {
      return res.json({ count: 0, question: null });
    }

    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    const link = `https://leetcode.com/problems/${pick.titleSlug}/`;
    res.json({ count: filtered.length, question: pick, link });
  } catch (e) {
    res.status(500).json({ error: String(e && e.message ? e.message : e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


