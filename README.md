Dice Roller LibraryA flexible and powerful TypeScript library for parsing and evaluating dice expressions, built with the Pratt parsing technique. It's designed to be easy to use and extend, supporting standard dice notation as well as more complex RPG-style mechanics.FeaturesStandard Dice Notation: Roll dice like d20, 2d6, d100.Arithmetic Operations: Supports +, -, *, / with correct operator precedence.Roll Titles: Add descriptive titles to your rolls, like "Attack Roll: 2d10+7".Reroll Mechanics: Automatically reroll dice that meet a certain condition (e.g., 4d6r<2 to reroll any 1s).Success Counting: Count the number of dice that meet or exceed a target number (e.g., 10d8>=6 to count all rolls of 6 or higher).Customizable Formatting: Define your own Markdown-friendly syntax to display roll results.Quick Start & UsageTo use the library in your project, import the DiceRoller class and call the roll() method.import { DiceRoller } from './lib'; // Adjust path as needed

const roller = new DiceRoller();

// Perform a simple roll
const result = roller.roll("Strength Check: 2d6+3");

// The 'result' object contains all the details of the roll.
// Use a type guard to check if the roll was successful.
if (result && 'value' in result) {
    console.log(`Title: ${result.title}`); // "Strength Check"
    console.log(`Final Value: ${result.value}`);
    console.log(`Formatted Rolls: ${result.formattedString}`);
} else if (result && 'errors' in result) {
    console.error("An error occurred:", result.errors.join(', '));
}
Supported ExpressionsExpressionDescriptiond20Roll one 20-sided die.2d10+5Roll two 10-sided dice and add 5.(1d4+1)*d6Roll 1d4, add 1, then multiply by a d6 roll.8d6r<3Roll eight 6-sided dice, rerolling any result < 3.10d10>=8Roll ten 10-sided dice, counting results >= 8.Vampire Bite: 5d10r<2>=7A complex roll with a title, rerolls, and successes.Custom FormattingYou can customize the output by passing a configuration object to the roll() method. The default configuration is:{
  "default": "{n}",
  "success": "**{n}**",
  "failure": "{n}",
  "reroll": "~~{n}~~ → {m}",
  "separator": " + "
}
{n} is the initial value of the die.{m} is the new value after a reroll.Example of custom formatting:const customFormat = {
  success: "✅ {n}",
  failure: "❌ {n}",
  reroll: "({n}  rerolled to {m})",
  separator: " | "
};

const result = roller.roll("5d6>=5", customFormat);
// Possible output: "✅ 5 | ❌ 2 | ✅ 6 | ❌ 4 | ✅ 5"
