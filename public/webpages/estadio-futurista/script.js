(function () {
  'use strict'

  const loadingScreen = document.getElementById('loading-screen')
  const animatedSection = document.getElementById('animated-section')
  const heroBg = document.getElementById('heroBg')
  const particlesContainer = document.getElementById('particles')

  const IMAGES = {
    hero: 'images/Colossal_futuristic_stadium_entr…_202606091528.jpeg',
    heroFallback: 'images/Colossal_futuristic_stadium_entr…_202606091528_2.jpeg'
  }

  let isActive = false
  let transitionTimer = null

  function preloadImage (src) {
    return new Promise(function (resolve) {
      var img = new Image()
      img.onload = resolve
      img.onerror = resolve
      img.src = src
    })
  }

  function setHeroBackground (src) {
    heroBg.style.backgroundImage = 'url("' + src + '")'
  }

  function generateParticles () {
    var fragment = document.createDocumentFragment()
    for (var i = 0; i < 40; i++) {
      var p = document.createElement('div')
      p.className = 'particle'
      p.style.left = Math.random() * 100 + '%'
      p.style.animationDuration = (8 + Math.random() * 12) + 's'
      p.style.animationDelay = (Math.random() * 10) + 's'
      p.style.setProperty('--drift', (Math.random() - 0.5) * 200)
      p.style.width = p.style.height = (1 + Math.random() * 2) + 'px'
      fragment.appendChild(p)
    }
    particlesContainer.appendChild(fragment)
  }

  function activateScrollState () {
    if (isActive) return
    isActive = true

    loadingScreen.classList.add('hidden')
    animatedSection.classList.add('active')

    if (transitionTimer) clearTimeout(transitionTimer)
  }

  function handleWheel (e) {
    if (isActive) return
    if (Math.abs(e.deltaY) < 5) return
    activateScrollState()
  }

  function handleTouchMove (e) {
    if (isActive) return
    activateScrollState()
  }

  function handleKeyDown (e) {
    if (isActive) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ') {
      activateScrollState()
    }
  }

  function resetOnSmallScreen () {
    if (window.innerWidth <= 480) {
      setTimeout(activateScrollState, 4000)
    }
  }

  function init () {
    generateParticles()
    setHeroBackground(IMAGES.hero)

    preloadImage(IMAGES.hero).then(function () {
      heroBg.style.opacity = '1'
    })

    preloadImage(IMAGES.heroFallback).then(function () {
      var curr = heroBg.style.backgroundImage
      if (curr && curr.indexOf(IMAGES.hero) !== -1) return
      setHeroBackground(IMAGES.heroFallback)
    })

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    resetOnSmallScreen()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
