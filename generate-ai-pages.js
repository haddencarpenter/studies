// Script to generate all individual AI pages for each question
// Run with: node generate-ai-pages.js

const fs = require('fs');
const path = require('path');

// Read the template
const templatePath = path.join(__dirname, 'question-q1-shumi.html');
const template = fs.readFileSync(templatePath, 'utf8');

// AI keys in order (sorted by score for Q1)
const aiOrder = {
  'q1': ['shumi', 'bingx', 'sentient', 'neurodexai', 'intellectia', 'chaingpt', 'nansen', 'hustleai'],
  // Q2 and Q3 will be added later
};

// Function to generate AI page HTML
function generateAIPage(questionId, aiKey) {
  let html = template;
  
  // Replace question ID references
  html = html.replace(/question-q1-/g, `question-${questionId}-`);
  html = html.replace(/Q1/g, questionId.toUpperCase());
  html = html.replace(/q1/g, questionId);
  
  // Replace AI-specific content (will be populated by JavaScript from data.js)
  // The template already uses JavaScript to load data, so we just need to update file names
  
  return html;
}

// Generate all pages for Q1
const questionId = 'q1';
aiOrder[questionId].forEach(aiKey => {
  const fileName = `question-${questionId}-${aiKey}.html`;
  const filePath = path.join(__dirname, fileName);
  
  // Skip if already exists (shumi)
  if (aiKey === 'shumi') {
    console.log(`Skipping ${fileName} (already exists)`);
    return;
  }
  
  let html = template;
  
  // Replace all question references
  html = html.replace(/question-q1-/g, `question-${questionId}-`);
  html = html.replace(/Q1/g, questionId.toUpperCase());
  
  // Update the AI key in the script
  html = html.replace(/const aiKey = 'shumi';/g, `const aiKey = '${aiKey}';`);
  
  // Update title
  html = html.replace(/<title>AI Comparison - Q1: Shumi AI<\/title>/g, 
    `<title>AI Comparison - ${questionId.toUpperCase()}: ${aiKey.charAt(0).toUpperCase() + aiKey.slice(1)} AI</title>`);
  
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Generated ${fileName}`);
});

console.log('Done generating AI pages for Q1');
