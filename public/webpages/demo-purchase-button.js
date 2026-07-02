(function () {
  var script = document.currentScript;
  var root = script && script.parentElement;

  if (!root) return;

  var params = new URLSearchParams(window.location.search);
  var checkoutUrl = params.get('checkout');
  var price = params.get('price');
  var pageId = params.get('pageId');
  var paidPrices = ['5', '10', '15', '20', '35', '50'];
  var normalizedPrice = String(Number(price));
  var isPaidProduct = paidPrices.indexOf(normalizedPrice) !== -1;

  if (isPaidProduct) {
    var freeTrigger = document.querySelector(
      '[data-prompt-trigger], [data-free-download-trigger]'
    );
    var freeToolbar = freeTrigger && freeTrigger.closest('div');
    if (freeToolbar) freeToolbar.remove();
  }

  if (root === document.body) {
    root = document.createElement('div');
    root.style.cssText = [
      'position:fixed',
      'right:20px',
      'bottom:20px',
      'z-index:99999'
    ].join(';');
    document.body.appendChild(root);
  }

  function showFallback() {
    var link = document.createElement('a');
    link.href = checkoutUrl || '/prices';
    link.textContent = 'Comprar esta página';
    link.style.cssText = [
      'display:inline-flex',
      'align-items:center',
      'border-radius:999px',
      'background:#0057ff',
      'box-shadow:0 12px 32px rgba(0,0,0,.28)',
      'color:#fff',
      'font:600 15px/1.2 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'min-height:48px',
      'padding:0 22px',
      'text-decoration:none'
    ].join(';');
    root.appendChild(link);
  }

  if (!price) {
    showFallback();
    return;
  }

  fetch('/api/stripe/demo-buy-button?price=' + encodeURIComponent(price))
    .then(function (response) {
      if (!response.ok) throw new Error('Stripe button configuration unavailable');
      return response.json();
    })
    .then(function (config) {
      var stripeScript = document.createElement('script');
      stripeScript.src = 'https://js.stripe.com/v3/buy-button.js';
      stripeScript.async = true;
      stripeScript.onload = function () {
        var button = document.createElement('stripe-buy-button');
        button.setAttribute('buy-button-id', config.buyButtonId);
        button.setAttribute('publishable-key', config.publishableKey);
        if (pageId) {
          button.setAttribute('client-reference-id', 'guest___' + pageId);
        }
        root.appendChild(button);
      };
      stripeScript.onerror = showFallback;
      document.head.appendChild(stripeScript);
    })
    .catch(showFallback);
})();
