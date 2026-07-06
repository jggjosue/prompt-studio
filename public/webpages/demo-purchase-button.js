(function () {
  var script = document.currentScript;
  var container = script && script.parentElement;
  if (!container) return;

  var params = new URLSearchParams(window.location.search);
  var checkoutUrl = params.get('checkout');
  var rawPrice = params.get('price');
  var supportedPrices = ['5', '10', '15', '20', '35', '50'];
  var price = String(Number(rawPrice));
  var hasSupportedPrice = supportedPrices.indexOf(price) !== -1;

  if (hasSupportedPrice) {
    var freeAction = document.querySelector(
      '[data-prompt-trigger], [data-free-download-trigger]'
    );
    var freeActionWrapper = freeAction && freeAction.closest('div');
    if (freeActionWrapper) freeActionWrapper.remove();
  }

  if (container === document.body) {
    container = document.createElement('div');
    container.style.cssText = [
      'position:fixed',
      'right:20px',
      'bottom:20px',
      'z-index:99999',
    ].join(';');
    document.body.appendChild(container);
  }

  var link = document.createElement('a');
  link.href = checkoutUrl || '/prices';
  link.textContent = hasSupportedPrice
    ? 'Comprar $' + price + ' USD'
    : 'Comprar esta página';
  link.setAttribute('aria-label', link.textContent);
  link.style.cssText = [
    'display:inline-flex',
    'align-items:center',
    'justify-content:center',
    'border-radius:12px',
    'background:#0057ff',
    'box-shadow:0 12px 32px rgba(0,0,0,.28)',
    'color:#fff',
    'font:600 16px/1.2 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    'min-height:52px',
    'padding:0 24px',
    'text-decoration:none',
  ].join(';');
  container.appendChild(link);
})();
