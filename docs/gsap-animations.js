document.addEventListener('DOMContentLoaded', function() {
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not loaded');
    return;
  }

  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  gsap.from('.hero-content', {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    delay: 0.2
  });

  gsap.from('.feature-card', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.features-section',
      start: 'top 80%',
      once: true
    }
  });

  gsap.from('h1, h2', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: 'article',
      start: 'top 70%',
      once: true
    }
  });

  gsap.to('pre', {
    boxShadow: '0 0 20px rgba(212, 201, 110, 0.2)',
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
  });

  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', () => {
      gsap.to(link, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out'
      });
    });
    link.addEventListener('mouseleave', () => {
      gsap.to(link, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    });
  });

  console.log('GSAP animations initialized');
});

  // Stagger cards animation
  gsap.from('.feature-card', {
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.features-section',
      start: 'top 80%',
      once: true,
    },
  });

  // Section headers animation
  gsap.from('h1, h2', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: 'article',
      start: 'top 70%',
      once: true,
    },
  });

  // Code blocks subtle glow
  gsap.to('pre', {
    boxShadow: '0 0 20px rgba(212, 201, 110, 0.2)',
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut',
  });

  // Links hover animation
  document.querySelectorAll('a').forEach((link) => {
    link.addEventListener('mouseenter', () => {
      gsap.to(link, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out',
      });
    });
    link.addEventListener('mouseleave', () => {
      gsap.to(link, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      });
    });
  });

  console.log('🎬 GSAP animations initialized');
});
