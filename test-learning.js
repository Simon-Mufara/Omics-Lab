const fs = require('fs');
const path = require('path');

// Read the learning-path.js file
const learningPathCode = fs.readFileSync('./js/learning-path.js', 'utf8');

// Create a mock environment for OmicsLab
global.OmicsLab = {};
global.OmicsLab.Icons = {
  svg: (name, size) => `<svg>${name}</svg>`
};
global.OmicsLab.Router = {
  navigate: (page) => console.log(`Navigating to ${page}`)
};
global.OmicsLab.Notify = {
  success: (msg) => console.log(`SUCCESS: ${msg}`),
  warning: (msg) => console.log(`WARNING: ${msg}`),
  info: (msg) => console.log(`INFO: ${msg}`)
};
global.OmicsLab.Toast = {
  show: (msg, type) => console.log(`[${type}] ${msg}`)
};
global.OmicsLab.SkillTree = {
  awardXP: (action, points) => console.log(`XP: ${action} +${points}`)
};

// Try to execute the learning path code
try {
  eval(learningPathCode);
  console.log('LearningPath module loaded successfully');

  // Test initialization
  const container = document.createElement('div');
  container.id = 'test-container';
  document.body.appendChild(container);

  // Initialize the learning path
  OmicsLab.LearningPath.init(container);
  console.log('LearningPath initialized successfully');

  // Clean up
  document.body.removeChild(container);
} catch (error) {
  console.error('Error loading LearningPath:', error);
  console.error(error.stack);
}