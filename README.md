# LeetCode Roulette 🎰

**Spin and Code!** A fun and educational tool that randomly selects LeetCode problems to help you practice coding challenges with precision.

## About

LeetCode Roulette is a web application that randomly selects LeetCode problems based on your preferences. Whether you want to practice specific topics, difficulty levels, or target problems within a certain rating range, this tool makes your practice sessions more engaging and efficient.

## The Story

This project started when my friend **Ishan** and I (**Prathamesh**) discovered we could create a game-like experience to make LeetCode practice more fun and less overwhelming. Instead of scrolling through hundreds of problems trying to decide what to solve next, we envisioned a "roulette" system that would randomly pick problems for you.

During our research, we came across [zerotrac](https://github.com/zerotrac)'s incredible work on LeetCode problem ratings. Zerotrac's project calculates the difficulty ratings of LeetCode contest problems using sophisticated algorithms (Elo rating system and Maximum Likelihood Estimation), providing a more accurate representation of problem difficulty than the standard Easy/Medium/Hard classifications.

By integrating zerotrac's ratings data, Ishan and I were able to add a powerful feature that helps students:
- **Target their skill level** by filtering problems within specific rating ranges
- **Progress systematically** from easier to harder problems
- **Understand true difficulty** beyond the basic three-tier system
- **Practice more effectively** with data-driven problem selection

This combination of gamification and data-driven insights makes LeetCode practice more engaging and helps students learn more efficiently.

## Features

- 🎯 **Smart Filtering**: Filter by difficulty (Easy/Medium/Hard), topic tags, and rating ranges
- 📊 **Rating-Based Selection**: Uses contest ratings to help you find problems at your skill level
- 🎲 **Random Selection**: Let fate decide your next challenge
- 🚫 **Exclude Paid Problems**: Focus on free problems only
- 🔗 **Direct Links**: One-click access to problems on LeetCode

## Problem Ratings

The ratings used in this project are provided by [zerotrac](https://github.com/zerotrac). These ratings are calculated based on:

- **Elo Rating System**: Similar to chess ratings, problems are rated based on contest performance
- **Maximum Likelihood Estimation**: Statistical methods to estimate true problem difficulty

> **Note from zerotrac**: The corresponding backend calculates the rating of problems in LeetCode weekly/biweekly contests based on the Elo rating system as well as Maximum Likelihood Estimation. It is not a 100% accurate result, but sufficient for evaluating the relative difficulty of a problem.
>
> All the data needed during calculation are obtained by web crawlers. In order not to violate any potential terms and regulations, the backend code is not open-sourced. Moreover, as the APIs are different amongst contests, the result does not contain the problems in 1st-62nd weekly contests.
>
> Please refer to `ratings.txt` for the raw data sorted in descending order. This will be updated every week after the contest(s).

## Credits

- **Problem Ratings**: [zerotrac](https://github.com/zerotrac) - For providing the LeetCode problem ratings data that powers the rating-based filtering feature
- **LeetCode**: For the problem database and platform

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/leetcoderoulette.git
cd leetcoderoulette
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

4. Start the development server:
```bash
# Terminal 1: Start backend server
npm start

# Terminal 2: Start frontend dev server
npm run client:dev
```

5. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal)

### Production Build

```bash
# Build the client
npm run client:build

# Start the server (serves both API and static client)
npm start
```

## How It Works

1. **Select Filters**: Choose your preferred difficulty, topic, and rating range
2. **Spin**: Click the "Spin" button to randomly select a problem
3. **Practice**: Open the problem on LeetCode and start coding!

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

See [LICENSE](LICENSE) file for details.
