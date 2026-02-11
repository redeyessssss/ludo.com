// Test script to verify bot system logic
// Run with: node test-bot-system.js

const { LudoGameEngine } = require('./server/game/LudoGame');
const { LudoBot } = require('./server/game/LudoBot');

console.log('🧪 Testing Bot System Logic\n');

// Test 1: Create 2-player game
console.log('TEST 1: Creating 2-player bot game');
console.log('=====================================');

const humanPlayer = {
  id: 'test_human_123',
  username: 'TestPlayer',
  isBot: false
};

const botPlayer = {
  id: 'test_bot_456',
  username: 'Bot Alpha',
  isBot: true
};

const players = [humanPlayer, botPlayer];
const game = new LudoGameEngine(players);
game.isBotGame = true;
game.bots = [{
  botId: botPlayer.id,
  bot: new LudoBot(botPlayer.id, 'medium'),
  color: 'green'
}];

console.log('✅ Game created');
console.log(`Players: ${game.players.length}`);
console.log(`Player 0: ${game.players[0].username} (isBot: ${game.players[0].isBot})`);
console.log(`Player 1: ${game.players[1].username} (isBot: ${game.players[1].isBot})`);
console.log(`Current player index: ${game.currentPlayerIndex}`);
console.log(`Current player: ${game.getCurrentPlayer().username}`);
console.log(`Current player is bot: ${game.getCurrentPlayer().isBot}`);
console.log(`Current player ID: ${game.getCurrentPlayer().id}`);
console.log(`Human player ID: ${humanPlayer.id}`);
console.log(`IDs match: ${game.getCurrentPlayer().id === humanPlayer.id}`);

if (game.getCurrentPlayer().id !== humanPlayer.id) {
  console.error('❌ FAIL: Current player is not the human!');
  process.exit(1);
}

if (game.getCurrentPlayer().isBot) {
  console.error('❌ FAIL: Current player is a bot!');
  process.exit(1);
}

console.log('✅ PASS: Human player goes first\n');

// Test 2: Create 3-player game
console.log('TEST 2: Creating 3-player bot game');
console.log('=====================================');

const bot2Player = {
  id: 'test_bot_789',
  username: 'Bot Beta',
  isBot: true
};

const players3 = [humanPlayer, botPlayer, bot2Player];
const game3 = new LudoGameEngine(players3);
game3.isBotGame = true;

console.log('✅ Game created');
console.log(`Players: ${game3.players.length}`);
console.log(`Current player: ${game3.getCurrentPlayer().username}`);
console.log(`Current player is bot: ${game3.getCurrentPlayer().isBot}`);

if (game3.getCurrentPlayer().id !== humanPlayer.id) {
  console.error('❌ FAIL: Current player is not the human!');
  process.exit(1);
}

console.log('✅ PASS: Human player goes first in 3-player game\n');

// Test 3: Verify token colors
console.log('TEST 3: Verifying token colors');
console.log('=====================================');

console.log(`Player 0 (${game.players[0].username}): ${game.tokens[game.players[0].id].color}`);
console.log(`Player 1 (${game.players[1].username}): ${game.tokens[game.players[1].id].color}`);

if (game.tokens[humanPlayer.id].color !== 'red') {
  console.error('❌ FAIL: Human player is not red!');
  process.exit(1);
}

if (game.tokens[botPlayer.id].color !== 'green') {
  console.error('❌ FAIL: Bot Alpha is not green!');
  process.exit(1);
}

console.log('✅ PASS: Colors are correct\n');

// Test 4: Simulate turn passing
console.log('TEST 4: Simulating turn passing');
console.log('=====================================');

console.log(`Before: Current player is ${game.getCurrentPlayer().username}`);
game.nextTurn();
console.log(`After nextTurn(): Current player is ${game.getCurrentPlayer().username}`);

if (game.getCurrentPlayer().id !== botPlayer.id) {
  console.error('❌ FAIL: Turn did not pass to bot!');
  process.exit(1);
}

console.log('✅ PASS: Turn passed to bot correctly\n');

// Test 5: Verify bot instance
console.log('TEST 5: Verifying bot instance');
console.log('=====================================');

const botInstance = game.bots.find(b => b.botId === botPlayer.id);
if (!botInstance) {
  console.error('❌ FAIL: Bot instance not found!');
  process.exit(1);
}

console.log(`Bot ID: ${botInstance.botId}`);
console.log(`Bot difficulty: ${botInstance.bot.difficulty}`);
console.log('✅ PASS: Bot instance found\n');

console.log('🎉 ALL TESTS PASSED!');
console.log('The bot system logic is working correctly.');
console.log('If the game still doesn\'t work, the issue is in the socket communication.');
