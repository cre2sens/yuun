import fs from 'fs';
console.log('API KEY:', process.env.GEMINI_API_KEY ? 'EXISTS' : 'MISSING');
console.log('VITE KEY:', process.env.VITE_GEMINI_API_KEY ? 'EXISTS' : 'MISSING');
