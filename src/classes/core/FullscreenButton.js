export default class FullscreenButton {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.width = 120;
    this.height = 40;
    this.padding = 12;

    this.updatePosition();

    // Binding wichtig für removeEventListener
    this.handleClick = this.handleClick.bind(this);

    this.initEvents();
  }

  /* -----------------------------
   * Position berechnen
   * ----------------------------- */
  updatePosition() {
    this.x = this.canvas.width - this.width - this.padding;
    this.y = this.padding;
  }

  /* -----------------------------
   * Events registrieren
   * ----------------------------- */
  initEvents() {
    this.canvas.addEventListener("click", this.handleClick);

    window.addEventListener("resize", () => {
      this.updatePosition();
    });

    document.addEventListener("fullscreenchange", () => {
      this.updatePosition();
    });
  }

  destroy() {
    this.canvas.removeEventListener("click", this.handleClick);
  }

  /* -----------------------------
   * Klick Handling
   * ----------------------------- */
  handleClick(event) {
    const pos = this.getMousePosition(event);

    if (this.isInside(pos.x, pos.y)) {
      this.toggleFullscreen();
    }
  }

  /* -----------------------------
   * Mausposition korrekt umrechnen
   * (CSS -> Canvas Koordinaten)
   * ----------------------------- */
  getMousePosition(event) {
    const rect = this.canvas.getBoundingClientRect();

    const cssX = event.clientX - rect.left;
    const cssY = event.clientY - rect.top;

    const x = cssX * (this.canvas.width / rect.width);
    const y = cssY * (this.canvas.height / rect.height);

    return { x, y };
  }

  /* -----------------------------
   * Hit-Test
   * ----------------------------- */
  isInside(px, py) {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }

  /* -----------------------------
   * Fullscreen umschalten
   * ----------------------------- */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.canvas.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  /* -----------------------------
   * Zeichnen
   * ----------------------------- */
  draw() {
    const ctx = this.ctx;

    ctx.save();

    // Hintergrund
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Rahmen
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Text
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      document.fullscreenElement ? "Exit" : "Fullscreen",
      this.x + this.width / 2,
      this.y + this.height / 2,
    );

    ctx.restore();
  }
}
