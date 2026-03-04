let stats = {
  totalCalls: 0,
  llamaCalls: 0,
  embeddingCalls: 0,
  indexedFiles: 0,
  dailyUsage: {},   // { "2026-03-03": 5 }
  recentActivity: []
};

function incrementCall(type) {
  stats.totalCalls++;

  const today = new Date().toISOString().slice(0, 10);

  if (!stats.dailyUsage[today]) {
    stats.dailyUsage[today] = 0;
  }
  stats.dailyUsage[today]++;

  if (type === "llama") stats.llamaCalls++;
  if (type === "embedding") stats.embeddingCalls++;

  stats.recentActivity.unshift({
    type,
    time: new Date().toLocaleTimeString()
  });

  stats.recentActivity = stats.recentActivity.slice(0, 10);
}

function incrementIndexedFiles() {
  stats.indexedFiles++;
}

function getStats() {
  return stats;
}

module.exports = {
  incrementCall,
  incrementIndexedFiles,
  getStats
};