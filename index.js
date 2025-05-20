document.addEventListener('DOMContentLoaded', () => {
  // Initialize GSAP
  gsap.registerPlugin(ScrollTrigger);

  const canvas = document.getElementById('sequence-canvas');
  const canvasContainer = document.querySelector('.background-canvas-container');
  const ctx = canvas.getContext('2d');
  const content = document.getElementById('smooth-content');

  content.style.visibility = 'hidden';
  canvasContainer.style.opacity = '0';
  
  // Set canvas dimensions
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Redraw current frame if we have one
    if (window.currentImage) {
      drawImage(window.currentImage);
    }
  }
  
  // Initial canvas setup
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Function to draw the image with proper sizing
  function drawImage(img) {
    if (!img || !img.complete || img.naturalHeight === 0) return;
    
    window.currentImage = img;
    
    // Calculate dimensions to maintain aspect ratio while covering the canvas
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (canvasRatio > imgRatio) {
      // Canvas is wider than image ratio - adjust width
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgRatio;
      offsetY = (canvas.height - drawHeight) / 2;
    } else {
      // Canvas is taller than image ratio - adjust height
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgRatio;
      offsetX = (canvas.width - drawWidth) / 2;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }
  
  // Helper function for image sequence scrubbing
  function imageSequence(config) {
    let playhead = {frame: 0},
    images,
    updateImage = function() {
      if (images[Math.round(playhead.frame)]) {
        drawImage(images[Math.round(playhead.frame)]);
        config.onUpdate && config.onUpdate.call(this);
      }
    };
    
    images = config.urls.map((url, i) => {
      let img = new Image();
      img.src = url;
      i || (img.onload = updateImage);
      return img;
    });
    
    return gsap.to(playhead, {
      frame: images.length - 1,
      ease: "none",
      onUpdate: updateImage,
      scrollTrigger: config.scrollTrigger
    });
  }
  
  // Set up video parameters - 45 seconds at 12fps
  const fps = 12;
  const totalFrames = 541;
  
  // Create URL array for all frames
  const urls = Array(totalFrames).fill().map((_, i) => 
    `media/home/frames/frame_${i.toString().padStart(3, '0')}.jpg`
  );

  // Create/get preloader
  let preloader = document.querySelector('.preloader');
  if (!preloader) {
    preloader = document.createElement('div');
    preloader.className = 'preloader';
    
    const spinner = document.createElement('div');
    spinner.className = 'preloader-spinner';
    
    const text = document.createElement('div');
    text.id = 'preloader-text';
    text.textContent = 'Loading frames (0%)...';
    
    preloader.appendChild(spinner);
    preloader.appendChild(text);
    document.body.appendChild(preloader);
  }

  const preloaderText = document.getElementById('preloader-text');
  const frames = [];
  let loadedCount = 0;

  // Calculate how many frames to load before starting
  const requiredFramesToStart = Math.min(totalFrames, 24); // Load at least first 1 second

  // Load all frames sequentially
  for (let i = 0; i < totalFrames; i++) {
    frames[i] = new Image();
    frames[i].src = urls[i];
    
    frames[i].onload = () => {
      loadedCount++;
      const percent = Math.floor((loadedCount / totalFrames) * 100);
      
      if (preloaderText) {
        preloaderText.textContent = `Loading frames (${percent}%)...`;
      }
      
      // Start site after minimum required frames load
      if (loadedCount === requiredFramesToStart) {
        startSite();
      }
      
      // Log progress periodically
      if (loadedCount % 10 === 0) {
        console.log(`Loaded ${loadedCount}/${totalFrames} frames (${percent}%)`);
      }
    };
    
    frames[i].onerror = () => {
      frames[i].loadFailed = true;
      loadedCount++;
      
      if (loadedCount === requiredFramesToStart) {
        startSite();
      }
    };
  }

  // Start site after loading or timeout
  function startSite() {
    // Only start if not already started
    if (content.style.visibility === 'hidden') {
      console.log(`Starting site with ${loadedCount}/${totalFrames} frames loaded`);
      
      // Hide preloader with fade
      gsap.to(preloader, {
        opacity: 0, 
        duration: 0.5,
        onComplete: () => {
          preloader.style.display = 'none';
          
          // Reveal content
          content.style.visibility = 'visible';
          gsap.to(canvasContainer, {opacity: 1, duration: 0.5});
          
          // Initialize the scroll animation
          initAnimation();
        }
      });
    }
  }

  // Set a timeout for loader
  setTimeout(() => {
    if (content.style.visibility === 'hidden') {
      console.warn(`Loading timeout - starting anyway with ${loadedCount}/${totalFrames} frames`);
      startSite();
    }
  }, 15000);
  
  // Create a scroll-based animation
  function initAnimation() {
    // Get all sections
    const allSections = document.querySelectorAll('.fullscreen');
    
    // Create spacer for scrollable area
    const spacer = document.createElement('div');
    spacer.style.height = `${allSections.length * 100}vh`;
    spacer.style.position = 'absolute';
    spacer.style.width = '0.0625rem'; // Changed from '1px'
    spacer.style.bottom = '0';
    spacer.style.right = '0';
    spacer.style.pointerEvents = 'none';
    document.body.appendChild(spacer);
    
    // Define section ranges
    const sections = {
      intro: { startFrame: 1, endFrame: 60, selector: '.intro' }, 
      selfCare: { startFrame: 61, endFrame: 240, selector: '.self-care' }, 
      multitasking: { startFrame: 241, endFrame: 420, selector: '.multitasking' }, 
      memory: { startFrame: 421, endFrame: 540, selector: '.memory' }, 
      about: { startFrame: 541, endFrame: 541, selector: '.about' } 
    };
    
    // Pin each section
    allSections.forEach(section => {
      // Main pin ScrollTrigger
      ScrollTrigger.create({
        trigger: section,
        start: "top top", 
        end: "bottom top",
        pin: true,
        pinSpacing: true,
        markers: true
      });
      
      // Separate trigger for content visibility with earlier exit
      const content = section.querySelector('.content');
      if (content) {
        // Set initial state
        gsap.set(content, { opacity: 0, y: 3.125 }); // Changed from 50px to 3.125rem
        
        ScrollTrigger.create({
          trigger: section,
          start: "top 80%", 
          end: "center top", // Earlier exit point
          markers: false,
          onEnter: () => {
            gsap.to(content, {
              opacity: 1,
              y: 0,
              duration: 0.5
            });
          },
          onLeave: () => {
            gsap.to(content, {
              opacity: 0,
              y: -1.25, // Changed from -20px to -1.25rem
              duration: 0.3
            });
          },
          onEnterBack: () => {
            gsap.to(content, {
              opacity: 1,
              y: 0,
              duration: 0.5
            });
          },
          onLeaveBack: () => {
            gsap.to(content, {
              opacity: 0,
              y: 3.125, // Changed from 50px to 3.125rem
              duration: 0.2
            });
          }
        });
      }
    });
    
    // Create individual timeline animations for each video section
    
    // Intro section animation (ADDED THIS SECTION)
    const introSelector = document.querySelector(sections.intro.selector);
    if (introSelector) {
      const introSections = document.querySelectorAll(sections.intro.selector);
      
      // Calculate total height of all intro sections
      let introHeight = 0;
      introSections.forEach(section => {
        introHeight += section.offsetHeight;
      });
      
      imageSequence({
        urls: urls.slice(sections.intro.startFrame, sections.intro.endFrame + 1),
        scrollTrigger: {
          trigger: introSections[0],
          start: "top top",
          end: `+=${introHeight}`,
          scrub: 1,
          markers: {
            startColor: "red",
            endColor: "red",
            fontSize: "0.75rem", // Changed from 12px
            indent: 0
          },
          onUpdate: self => {
            const frameIndex = Math.floor(self.progress * (sections.intro.endFrame - sections.intro.startFrame)) + sections.intro.startFrame;
            console.log(`Intro: Frame ${frameIndex} | Progress: ${self.progress.toFixed(3)}`);
          }
        }
      });
    }
    
    // Self-care section animation
    const selfCareSelector = document.querySelector(sections.selfCare.selector);
    if (selfCareSelector) {
      const selfCareSections = document.querySelectorAll(sections.selfCare.selector);
      
      // Calculate total height of all self-care sections
      let selfCareHeight = 0;
      selfCareSections.forEach(section => {
        selfCareHeight += section.offsetHeight;
      });
      
      imageSequence({
        urls: urls.slice(sections.selfCare.startFrame, sections.selfCare.endFrame + 1),
        scrollTrigger: {
          trigger: selfCareSections[0],
          start: "top top",
          end: `+=${selfCareHeight}`,
          scrub: 1,
          markers: {
            startColor: "green",
            endColor: "green",
            fontSize: "0.75rem", // Changed from 12px
            indent: 0.625 // Changed from 10px
          },
          onUpdate: self => {
            const frameIndex = Math.floor(self.progress * (sections.selfCare.endFrame - sections.selfCare.startFrame)) + sections.selfCare.startFrame;
            console.log(`Self-care: Frame ${frameIndex} | Progress: ${self.progress.toFixed(3)}`);
          }
        }
      });
    }
    
    // Multitasking section animation
    const multitaskingSelector = document.querySelector(sections.multitasking.selector);
    if (multitaskingSelector) {
      const multitaskingSections = document.querySelectorAll(sections.multitasking.selector);
      
      // Calculate total height of all multitasking sections
      let multitaskingHeight = 0;
      multitaskingSections.forEach(section => {
        multitaskingHeight += section.offsetHeight;
      });
      
      imageSequence({
        urls: urls.slice(sections.multitasking.startFrame, sections.multitasking.endFrame + 1),
        scrollTrigger: {
          trigger: multitaskingSections[0],
          start: "top top",
          end: `+=${multitaskingHeight}`,
          scrub: 1,
          markers: {
            startColor: "blue",
            endColor: "blue",
            fontSize: "0.75rem", // Changed from 12px
            indent: 1.25 // Changed from 20px
          },
          onUpdate: self => {
            const frameIndex = Math.floor(self.progress * (sections.multitasking.endFrame - sections.multitasking.startFrame)) + sections.multitasking.startFrame;
            console.log(`Multitasking: Frame ${frameIndex} | Progress: ${self.progress.toFixed(3)}`);
          }
        }
      });
    }
    
    // Memory section animation
    const memorySelector = document.querySelector(sections.memory.selector);
    if (memorySelector) {
      const memorySections = document.querySelectorAll(sections.memory.selector);
      
      // Calculate total height of all memory sections
      let memoryHeight = 0;
      memorySections.forEach(section => {
        memoryHeight += section.offsetHeight;
      });
      
      imageSequence({
        urls: urls.slice(sections.memory.startFrame, sections.memory.endFrame + 1),
        scrollTrigger: {
          trigger: memorySections[0],
          start: "top top",
          end: `+=${memoryHeight}`,
          scrub: 1,
          markers: {
            startColor: "purple",
            endColor: "purple",
            fontSize: "0.75rem", // Changed from 12px
            indent: 1.875 // Changed from 30px
          },
          onUpdate: self => {
            const frameIndex = Math.floor(self.progress * (sections.memory.endFrame - sections.memory.startFrame)) + sections.memory.startFrame;
            console.log(`Memory: Frame ${frameIndex} | Progress: ${self.progress.toFixed(3)}`);
          }
        }
      });
    }
  }
});