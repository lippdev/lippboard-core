import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../showcase/index.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../showcase/app.js', import.meta.url), 'utf8');
assert.match(html, /id="task-form"/);
assert.match(html, /id="event-log"/);
assert.match(html, /viewport/);
assert.match(app, /\.\.\/src\/domain\/appState\.js/);
assert.match(app, /createTask.*deleteTask.*updateTask/s);
assert.doesNotMatch(app, /innerHTML|localStorage|fetch\(/);
console.log('Showcase checks OK');
