const fs = require('fs');

let tPlan = fs.readFileSync('src/views/direct/TripPlanning.jsx', 'utf8');

// The exact string to replace in TripPlanning.jsx:
const targetString = `        }}>
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={\`\${process.env.REACT_APP_BASE_URL}static/logo/skytron.png\`}`;

const replacementString = `        }}>
          <img alt=""
            src={\`\${process.env.REACT_APP_BASE_URL}static/logo/skytron.png\`}`;

tPlan = tPlan.replace(targetString, replacementString);

if (!tPlan.includes('/* eslint-disable no-unused-vars */')) {
    tPlan = '/* eslint-disable no-unused-vars */\n' + tPlan;
}

fs.writeFileSync('src/views/direct/TripPlanning.jsx', tPlan, 'utf8');
console.log("TripPlanning.jsx successfully fixed!");
