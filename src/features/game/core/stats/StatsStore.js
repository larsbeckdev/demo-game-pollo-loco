export default class StatsStore {
  constructor({ health = 100, coins = 0, bottles = 100, boss = 100 } = {}) {
    this.health = health;
    this.coins = coins;
    this.bottles = bottles;
    this.boss = boss;
  }

  // Health 0..100
  setHealth(value) {
    this.health = Math.max(0, Math.min(100, value));
  }

  // Coins 0..100 (oder 0..10, wie du willst)
  addCoin(amount = 1) {
    this.coins = Math.max(0, Math.min(100, this.coins + amount));
  }

  // Bottles 0..100
  addBottle(amount = 20) {
    this.bottles = Math.max(0, Math.min(100, this.bottles + amount));
  }

  useBottle(amount = 20) {
    this.bottles = Math.max(0, Math.min(100, this.bottles - amount));
  }

  // Boss 0..100
  setBoss(value) {
    this.boss = Math.max(0, Math.min(100, value));
  }

  reset() {
    this.health = 100;
    this.coins = 0;
    this.bottles = 100;
    this.boss = 100;
  }
}
