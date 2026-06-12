self.onmessage = (event) => {
  const { mass, friction, seed } = event.data;
  const deterministic = (seed * 9301 + 49297) % 233280;
  const noise = deterministic / 233280;
  const velocity = Math.max(0.1, (20 - mass) * (1 - friction) * 0.08 + noise * 0.1);
  const energy = 0.5 * mass * velocity * velocity;
  self.postMessage({ velocity, energy });
};
