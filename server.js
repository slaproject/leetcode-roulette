const express = require("express");
const cors = require("cors");
const { LeetCode } = require("leetcode-query");
const fs = require("fs");
const path = require("path");

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

// Load ratings from ratings.txt
// Create maps for both ID and titleSlug matching
let ratingsMapById = new Map();
let ratingsMapBySlug = new Map();

function loadRatings() {
  try {
    const ratingsPath = path.join(__dirname, "ratings.txt");
    const content = fs.readFileSync(ratingsPath, "utf-8");
    const lines = content.split("\n");
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split("\t");
      if (parts.length >= 5) {
        const rating = parseFloat(parts[0]);
        const id = String(parts[1]).trim();
        const titleSlug = parts[4] ? String(parts[4]).trim() : null;
        
        if (!isNaN(rating) && id) {
          // Store by ID
          ratingsMapById.set(id, rating);
          // Also store by titleSlug if available (as fallback)
          if (titleSlug) {
            ratingsMapBySlug.set(titleSlug, rating);
          }
        }
      }
    }
    console.log(`Loaded ${ratingsMapById.size} ratings by ID, ${ratingsMapBySlug.size} by slug`);
    
    // Debug: Show sample ratings
    const sampleIds = Array.from(ratingsMapById.keys()).slice(0, 5);
    console.log(`Sample rating IDs: ${sampleIds.join(', ')}`);
    sampleIds.forEach(id => {
      console.log(`  ID ${id}: rating ${ratingsMapById.get(id)}`);
    });
  } catch (e) {
    console.error("Error loading ratings:", e);
  }
}

loadRatings();

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
      // Try to get ID from multiple possible fields
      const questionId = String(q.frontendQuestionId || q.questionId || q.questionFrontendId || '');
      
      // Try to find rating by ID first, then by titleSlug as fallback
      let rating = ratingsMapById.get(questionId);
      if (!rating && q.titleSlug) {
        rating = ratingsMapBySlug.get(q.titleSlug);
      }
      
      // Debug: Log first few questions to see ID matching
      if (questions.length < 5) {
        console.log(`Question ${questions.length + 1}: ID="${questionId}", titleSlug="${q.titleSlug}", rating=${rating || 'null'}`);
      }
      
      questions.push({
        id: questionId,
        title: q.title,
        titleSlug: q.titleSlug,
        difficulty: q.difficulty, // Easy | Medium | Hard
        topicTags: (q.topicTags || []).map((t) => t.name),
        paidOnly: Boolean(q.paidOnly),
        acRate: q.acRate,
        isFavor: q.isFavor,
        freqBar: q.freqBar,
        status: q.status,
        rating: rating !== undefined ? rating : null, // Use undefined check to allow 0 ratings
      });
    }

    if (pageQuestions.length < pageSize) break;
    offset += pageSize;
  }

  cachedQuestions = questions;
  lastFetchTs = now;
  return questions;
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

// Debug endpoint to check rating matching
app.get("/api/debug/ratings", async (_req, res) => {
  try {
    const questions = await getAllQuestions();
    const questionsWithRatings = questions.filter(q => q.rating !== null && q.rating !== undefined);
    const questionsWithoutRatings = questions.filter(q => q.rating === null || q.rating === undefined);
    
    // Sample some questions to see their IDs
    const sampleWith = questionsWithRatings.slice(0, 10).map(q => ({ 
      id: q.id, 
      title: q.title, 
      titleSlug: q.titleSlug,
      rating: q.rating 
    }));
    const sampleWithout = questionsWithoutRatings.slice(0, 10).map(q => ({ 
      id: q.id, 
      title: q.title,
      titleSlug: q.titleSlug
    }));
    
    res.json({
      totalQuestions: questions.length,
      withRatings: questionsWithRatings.length,
      withoutRatings: questionsWithoutRatings.length,
      ratingsMapByIdSize: ratingsMapById.size,
      ratingsMapBySlugSize: ratingsMapBySlug.size,
      sampleWithRatings: sampleWith,
      sampleWithoutRatings: sampleWithout,
      sampleRatingIds: Array.from(ratingsMapById.keys()).slice(0, 10),
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
    const minRating = req.query.minRating && req.query.minRating !== '' ? parseFloat(req.query.minRating) : null;
    const maxRating = req.query.maxRating && req.query.maxRating !== '' ? parseFloat(req.query.maxRating) : null;
    const includeUnrated = req.query.includeUnrated === "true";

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
    
    // Filter by rating range - only apply if at least one rating filter is set
    if (minRating !== null || maxRating !== null) {
      filtered = filtered.filter((q) => {
        // If question has no rating
        if (q.rating === null || q.rating === undefined) {
          return includeUnrated; // Only include if flag is set
        }
        
        // Question has a rating, check if it's in range
        const rating = q.rating;
        const inMinRange = minRating === null || rating >= minRating;
        const inMaxRange = maxRating === null || rating <= maxRating;
        return inMinRange && inMaxRange;
      });
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