const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let objetos = [];
let explosiones = [];
let contador = 0;

// ============================
// FUNCIÓN: GENERAR POSICIÓN SEGURA
// ============================
function posicionValida(size) {
  let intentos = 0;

  while (intentos < 100) {
    let x = Math.random() * (canvas.width - size);
    let y = Math.random() * (canvas.height - size);

    let valido = true;

    for (let obj of objetos) {
      let dx = x - obj.x;
      let dy = y - obj.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < size) {
        valido = false;
        break;
      }
    }

    if (valido) return { x, y };

    intentos++;
  }

  // fallback (evita bloqueo)
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  };
}

// ============================
// CLASE OBJETO
// ============================
class Objeto {
  constructor() {
    this.reset();
  }

  reset() {
    this.size = 65;

    let pos = posicionValida(this.size);
    this.x = pos.x;
    this.y = pos.y;

    this.tipo = Math.floor(Math.random() * 4);

    this.vx = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1);
    this.vy = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1);

    this.angle = Math.random() * Math.PI * 2;

    this.visible = true;
    this.timer = Math.random() * 300 + 200;

    this.img = new Image();
    this.img.src = "assets/img/enemy.webp";
  }

  update() {
    if (!this.visible) return;

    switch (this.tipo) {

      case 0:
        this.x += this.vx;
        break;

      case 1:
        this.y += this.vy;
        break;

      case 2:
        this.x += this.vx;
        this.y += this.vy;
        break;

      case 3:
        this.angle += 0.05;
        this.x += Math.cos(this.angle) * this.vx;
        this.y += Math.sin(this.angle) * this.vy;
        break;
    }

    if (this.x <= 0 || this.x >= canvas.width - this.size) this.vx *= -1;
    if (this.y <= 0 || this.y >= canvas.height - this.size) this.vy *= -1;

  }

  draw() {
    if (!this.visible) return;
    ctx.drawImage(this.img, this.x, this.y, this.size, this.size);
  }
}

// ============================
// CREAR OBJETOS
// ============================
for (let i = 0; i < 25; i++) {
  let obj = new Objeto();
  objetos.push(obj);
}

// ============================
// COLISIONES
// ============================
function detectarColisiones() {
  for (let i = 0; i < objetos.length; i++) {
    for (let j = i + 1; j < objetos.length; j++) {

      let a = objetos[i];
      let b = objetos[j];

      if (!a.visible || !b.visible) continue;

      let dx = a.x - b.x;
      let dy = a.y - b.y;
      let dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < a.size) {

        a.vx *= -1;
        a.vy *= -1;
        b.vx *= -1;
        b.vy *= -1;

        // EXPLOSIÓN
        explosiones.push(new Explosion(a.x, a.y));
      }
    }
  }
}

// ============================
// CLASE EXPLOSIÓN (SPRITE)
// ============================
class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.frame = 0;
    this.maxFrames = 10;

    this.size = 50;

    this.img = new Image();
    this.img.src = "assets/img/explosion.png";

    this.frameWidth = 76;
    this.frameHeight = 76;

    // NUEVO ↓
    this.delay = 0;
    this.frameDelay = 4; // velocidad (más alto = más lento)
  }

  draw() {
    ctx.drawImage(
      this.img,
      this.frame * this.frameWidth,
      0,
      this.frameWidth,
      this.frameHeight,
      this.x,
      this.y,
      this.size,
      this.size
    );

    // Control de velocidad
    this.delay++;
    if (this.delay >= this.frameDelay) {
      this.frame++;
      this.delay = 0;
    }
  }
}

// ============================
// DIBUJAR EXPLOSIONES
// ============================
function dibujarExplosiones() {
  explosiones.forEach((exp, index) => {
    exp.draw();

    if (exp.frame >= exp.maxFrames) {
      explosiones.splice(index, 1);
    }
  });
}

// ============================
// CLICK
// ============================
canvas.addEventListener("click", function(e) {

  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  objetos.forEach(obj => {

    if (!obj.visible) return;

    if (
      mouseX >= obj.x &&
      mouseX <= obj.x + obj.size &&
      mouseY >= obj.y &&
      mouseY <= obj.y + obj.size
    ) {

      obj.visible = false;

      contador++;
      document.getElementById("contador").textContent = contador;

      // EXPLOSIÓN AL CLICK
      explosiones.push(new Explosion(obj.x, obj.y));

      setTimeout(() => obj.reset(), 800);
    }
  });
});

// ============================
// ANIMACIÓN
// ============================
function animar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  objetos.forEach(obj => {
    obj.update();
    obj.draw();
  });

  detectarColisiones();
  dibujarExplosiones();

  requestAnimationFrame(animar);
}

animar();