const fs = require('fs');

let tViewer = fs.readFileSync('src/views/direct/TripViewer.jsx', 'utf8');

// Remove both lines of comment from TripViewer
tViewer = tViewer.replace(/\/\/\s*eslint-disable-next-line\s+jsx-a11y\/alt-text\n/g, '');
tViewer = tViewer.replace(/\{\/\*\s*eslint-disable-next-line\s+jsx-a11y\/alt-text\s*\*\/\}\n/g, '');
tViewer = tViewer.replace(/<img\s*src=\{`\$\{process\.env\.REACT_APP_BASE_URL\}static\/logo\/skytron\.png`\}/g, '<img alt="" src={`\\${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}');

// Also add the top comment if it doesn't exist
if (!tViewer.includes('/* eslint-disable no-unused-vars */')) {
    tViewer = '/* eslint-disable no-unused-vars */\n' + tViewer;
}

fs.writeFileSync('src/views/direct/TripViewer.jsx', tViewer, 'utf8');


let tPlan = fs.readFileSync('src/views/direct/TripPlanning.jsx', 'utf8');
tPlan = tPlan.replace(/\/\/\s*eslint-disable-next-line\s+jsx-a11y\/alt-text\n/g, '');
tPlan = tPlan.replace(/\{\/\*\s*eslint-disable-next-line\s+jsx-a11y\/alt-text\s*\*\/\}\n/g, '');
// Since TripPlanning has a newline after <img
tPlan = tPlan.replace(/<img\s*\n\s*src=\{`\$\{process\.env\.REACT_APP_BASE_URL\}static\/logo\/skytron\.png`\}/, '<img alt=""\n            src={`\\${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}');

// Top comment
if (!tPlan.includes('/* eslint-disable no-unused-vars */')) {
    tPlan = '/* eslint-disable no-unused-vars */\n' + tPlan;
}

fs.writeFileSync('src/views/direct/TripPlanning.jsx', tPlan, 'utf8');
console.log('Fixed both');
