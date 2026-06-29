(function(){
  var saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.classList.toggle('dark', saved === 'dark');
  document.addEventListener('DOMContentLoaded', function(){
    var btn = document.getElementById('theme-toggle');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  });
})();
