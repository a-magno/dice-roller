import { DiceRoller, type RollOutcome, type VariableContext } from './lib';

// Tell TypeScript that the 'marked' library is available globally
declare const marked: { parseInline(markdown: string): string; };

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">Dice Roller</h1>
      <p class="text-center text-gray-500 dark:text-gray-400 mb-6">Enter an expression like "d20 + str >= 15" or "10d6>=5".</p>

      <div class="space-y-4">
          <div>
              <label for="dice-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expression</label>
              <input id="dice-input" type="text" placeholder="e.g., d20 + prof >= 15" class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
          </div>
          <div>
              <label for="context-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Variables (JSON)</label>
              <textarea id="context-input" rows="4" class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder='{ "str": 4, "prof": 2 }'></textarea>
          </div>
          <button id="roll-button" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">Roll</button>
      </div>
      
      <div id="result-container" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 min-h-[150px]"></div>
  </div>
`;

// --- UI Interaction Logic ---
const rollButton = document.getElementById('roll-button') as HTMLButtonElement;
const input = document.getElementById('dice-input') as HTMLInputElement;
const contextInput = document.getElementById('context-input') as HTMLTextAreaElement;
const resultContainer = document.getElementById('result-container') as HTMLDivElement;

const roller = new DiceRoller();

function performRoll() {
    const expression = input.value;
    if (!expression) return;

    let context: VariableContext = {};
    try {
        if (contextInput.value.trim()) {
            context = JSON.parse(contextInput.value);
        }
    } catch (e) {
        displayResult({ errors: ['Invalid JSON in variables input.'] });
        return;
    }
    
    const result = roller.roll(expression, { context });
    displayResult(result);
}

function displayResult(result: RollOutcome | null) {
    resultContainer.innerHTML = ''; // Clear previous results
    if (!result) return;

    let contentHtml = '';
    if ('errors' in result && result.errors) {
        contentHtml = `
        <div class="result-card bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 animate-fade-in">
            <h3 class="font-bold text-red-800 dark:text-red-200">Error</h3>
            <pre class="whitespace-pre-wrap text-red-700 dark:text-red-300 text-sm mt-2">${result.errors.join('\n')}</pre>
        </div>`;
    } else if ('value' in result) {
        const renderedMarkdown = result.formattedString ? marked.parseInline(result.formattedString) : '';

        // Determine how to display the primary result
        let primaryResultHtml = '';
        if (result.successes !== undefined) {
             // Case 1: Success Counting (e.g., 10d6>=5)
            primaryResultHtml = `
                <p class="text-sm text-gray-500 dark:text-gray-400">Successes</p>
                <p class="text-5xl font-bold text-green-500">${result.successes}</p>
            `;
        } else if (result.expression.match(/<=|>=|<|>/) && (result.value === 0 || result.value === 1)) {
            // Case 2: General Comparison Check (e.g., d20+5 >= 15)
            const resultLabel = result.value === 1 ? 'Success' : 'Failure';
            const resultColor = result.value === 1 ? 'text-green-500' : 'text-red-500';
            primaryResultHtml = `
                <p class="text-sm text-gray-500 dark:text-gray-400">Result</p>
                <p class="text-5xl font-bold ${resultColor}">${resultLabel}</p>
            `;
        } else {
            // Case 3: Standard arithmetic roll
            primaryResultHtml = `
                <p class="text-sm text-gray-500 dark:text-gray-400">Total</p>
                <p class="text-5xl font-bold text-blue-500">${result.value}</p>
            `;
        }


        contentHtml = `
        <div class="result-card bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5 animate-fade-in">
            ${result.title ? `<h3 class="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">${result.title}</h3>` : ''}
            <div class="text-center">
                ${primaryResultHtml}
            </div>
            ${result.formattedString ? `
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Breakdown</p>
                <div class="text-lg bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md break-words text-center">
                   ${renderedMarkdown}
                </div>
            </div>
            ` : ''}
        </div>`;
    }
    resultContainer.innerHTML = contentHtml;
}

rollButton.addEventListener('click', performRoll);
input.addEventListener('keydown', (e) => e.key === 'Enter' && performRoll());
contextInput.addEventListener('keydown', (e) => e.key === 'Enter' && performRoll());