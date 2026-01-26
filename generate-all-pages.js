// Script to generate all question pages (Q2, Q3) from Q1 templates
const fs = require('fs');
const path = require('path');

const questions = ['q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9'];
const ais = ['shumi', 'bingx', 'sentient', 'neurodexai', 'intellectia', 'chaingpt', 'nansen', 'hustleai'];

// Read Q1 templates
const summaryTemplate = fs.readFileSync('question-q1-summary.html', 'utf8');
const aiTemplate = fs.readFileSync('question-q1-shumi.html', 'utf8');

questions.forEach(questionId => {
  // Generate summary page
  const summaryContent = summaryTemplate
    .replace(/q1/g, questionId)
    .replace(/Q1/g, questionId.toUpperCase())
    .replace(/question-q1-/g, `question-${questionId}-`)
    .replace(/QUESTION 1/g, `QUESTION ${questionId.toUpperCase().replace('Q', '')}`);
  
  fs.writeFileSync(`question-${questionId}-summary.html`, summaryContent);
  console.log(`Generated question-${questionId}-summary.html`);

  // Generate individual AI pages
  ais.forEach(aiKey => {
    const aiContent = aiTemplate
      .replace(/q1/g, questionId)
      .replace(/Q1/g, questionId.toUpperCase())
      .replace(/question-q1-/g, `question-${questionId}-`)
      .replace(/shumi/g, aiKey)
      .replace(/Shumi AI/g, getAIDisplayName(aiKey))
      .replace(/QUESTION 1/g, `QUESTION ${questionId.toUpperCase().replace('Q', '')}`);
    
    fs.writeFileSync(`question-${questionId}-${aiKey}.html`, aiContent);
    console.log(`Generated question-${questionId}-${aiKey}.html`);
  });
});

function getAIDisplayName(aiKey) {
  const names = {
    shumi: 'Shumi AI',
    bingx: 'BingX AI',
    sentient: 'Sentient AI',
    neurodexai: 'NeuroDexAI',
    intellectia: 'Intellectia AI',
    chaingpt: 'ChainGPT',
    nansen: 'Nansen AI',
    hustleai: 'HustleAI'
  };
  return names[aiKey] || aiKey;
}

console.log('Done generating all pages!');
