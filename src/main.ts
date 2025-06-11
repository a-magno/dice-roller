import { DiceRoller, type RollOutcome } from './lib'; // Import types

// Tell TypeScript that the 'marked' library is available globally from the CDN
declare const marked: {
    parseInline(markdown: string): string;
};

// --- App Shell (no changes to the HTML structure) ---
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">Dice Roller</h1>
      <p class="text-center text-gray-500 dark:text-gray-400 mb-6">Enter a dice expression like "2d20+5", "4d6r<2", or "Attack: 10d6>=5".</p>
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <input id="dice-input" type="text" placeholder="e.g., 8d10r<3>=8" class="flex-grow w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
          <button id="roll-button" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">Roll</button>
      </div>
      <div id="result-container" class="mt-4 min-h-[200px]"></div>
  </div>
  <p class="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">Powered by a Modular Pratt Parser</p>
`;

// --- UI Interaction Logic ---
const rollButton = document.getElementById('roll-button') as HTMLButtonElement;
const input = document.getElementById('dice-input') as HTMLInputElement;
const resultContainer = document.getElementById('result-container') as HTMLDivElement;

const roller = new DiceRoller();

function performRoll() {
    const expression = input.value;
    if (!expression) return;
    const result = roller.roll(expression);
    displayResult(result);
}

function displayResult(result: RollOutcome | null) {
    resultContainer.innerHTML = ''; // Clear previous results
    if (!result) return;

    let contentHtml = '';
    // This type guard checks if the result is an error object
    if ('errors' in result && result.errors) {
        contentHtml = `
        <div class="result-card bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 animate-fade-in">
            <h3 class="font-bold text-red-800 dark:text-red-200">Parsing Error</h3>
            <pre class="whitespace-pre-wrap text-red-700 dark:text-red-300 text-sm mt-2">${result.errors.join('\n')}</pre>
        </div>`;
    } else if ('value' in result) { // This type guard confirms it is a successful RollResult
        // CORRECTED: Parse the Markdown string into HTML before rendering
        const renderedMarkdown = result.formattedString ? marked.parseInline(result.formattedString) : '';

        contentHtml = `
        <div class="result-card bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 animate-fade-in">
            ${result.title ? `<h3 class="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">${result.title}</h3>` : ''}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                    <p class="text-4xl font-bold text-blue-600 dark:text-blue-400">${result.value}</p>
                </div>
                ${'successes' in result ? `
                <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Successes</p>
                    <p class="text-4xl font-bold text-green-600 dark:text-green-400">${result.successes}</p>
                </div>` : ''}
            </div>
            ${result.formattedString ? `
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Roll Breakdown</p>
                <div class="text-lg bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md break-words">
                   ${renderedMarkdown} = <span class="font-bold">${result.value}</span>
                </div>
            </div>
            ` : ''}
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>Expression: <code class="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-800 dark:text-gray-200">${result.expression}</code></p>
            </div>
        </div>`;
    }
    resultContainer.innerHTML = contentHtml;
}

rollButton.addEventListener('click', performRoll);
input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        performRoll();
    }
});
