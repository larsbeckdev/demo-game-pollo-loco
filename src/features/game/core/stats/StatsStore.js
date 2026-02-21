export default class StatsStore {
  constructor({ health = 100 } = {}) {
    this.coins = 0;
    this.bottles = 0;
    this.health = health; // 0..100
  }

  addCoin(n = 1) {
    this.coins += n;
  }

  addBottle(n = 1) {
    this.bottles += n;
  }

  spendBottle(n = 1) {
    if (this.bottles < n) return false;
    this.bottles -= n;
    return true;
  }

  damage(n = 10) {
    this.health = Math.max(0, this.health - n);
  }

  heal(n = 10) {
    this.health = Math.min(100, this.health + n);
  }
}
