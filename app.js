document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Navigation & Mobile Menu
  // ==========================================
  const navbar = document.getElementById('navbar');
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const navLinks = document.getElementById('nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  });

  hamburgerMenu.addEventListener('click', () => {
    hamburgerMenu.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close nav on click of link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburgerMenu.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  // Scroll to explore prompt
  const scrollPrompt = document.getElementById('scroll-prompt');
  if (scrollPrompt) {
    scrollPrompt.addEventListener('click', () => {
      document.getElementById('about-company').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ==========================================
  // 2. Scroll Animation (Intersection Observer)
  // ==========================================
  const reveals = document.querySelectorAll('.reveal, .feature-card, .section-header, .timeline-item');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
        
        // Trigger statistics count-up if this is the intro block
        if (entry.target.classList.contains('intro-text')) {
          animateStats();
        }
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(element => {
    revealObserver.observe(element);
  });

  // Stats Counter Animation
  function animateStats() {
    const statsNumbers = document.querySelectorAll('.stat-number');
    statsNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      let count = 0;
      const duration = 2000; // 2 seconds
      const increment = target / (duration / 16); // ~60fps
      
      const updateCount = () => {
        count += increment;
        if (count < target) {
          stat.innerText = Math.floor(count) + (target === 15 ? '+' : '+');
          requestAnimationFrame(updateCount);
        } else {
          stat.innerText = target + '+';
        }
      };
      
      updateCount();
    });
  }

  // ==========================================
  // 3. Interactive Master Plan (SVG plots)
  // ==========================================
  const plots = document.querySelectorAll('.plot');
  const infoPlotTitle = document.getElementById('info-plot-title');
  const infoPlotBadge = document.getElementById('info-plot-badge');
  const infoPlotSize = document.getElementById('info-plot-size');
  const infoPlotFacing = document.getElementById('info-plot-facing');
  const infoPlotPrice = document.getElementById('info-plot-price');
  const infoPlotCta = document.getElementById('info-plot-cta');

  // Set initial selected state
  const defaultPlot = document.querySelector('.plot[data-plot-id="2"]');
  if (defaultPlot) {
    defaultPlot.classList.add('active-select');
  }

  plots.forEach(plot => {
    plot.addEventListener('click', (e) => {
      const status = plot.getAttribute('data-plot-status');
      
      // Update selected class
      plots.forEach(p => p.classList.remove('active-select'));
      plot.classList.add('active-select');

      // Extract details
      const plotId = plot.getAttribute('data-plot-id');
      const size = plot.getAttribute('data-plot-size');
      const price = plot.getAttribute('data-plot-price');
      const facing = plot.getAttribute('data-plot-facing');

      // Update Panel Text
      infoPlotTitle.innerText = `Plot ${plotId}`;
      infoPlotSize.innerText = `${size} Sq. Yd.`;
      infoPlotFacing.innerText = facing;
      infoPlotPrice.innerText = price;

      // Status Badge classes
      infoPlotBadge.className = 'info-status-badge'; // reset
      infoPlotBadge.innerText = status;
      
      if (status === 'available') {
        infoPlotBadge.classList.add('badge-available');
        infoPlotCta.innerText = 'Inquire About Plot';
        infoPlotCta.disabled = false;
        infoPlotCta.style.opacity = '1';
      } else if (status === 'reserved') {
        infoPlotBadge.classList.add('badge-reserved');
        infoPlotCta.innerText = 'Join Waiting List';
        infoPlotCta.disabled = false;
        infoPlotCta.style.opacity = '1';
      } else {
        infoPlotBadge.classList.add('badge-sold');
        infoPlotCta.innerText = 'Sold Out';
        infoPlotCta.disabled = true;
        infoPlotCta.style.opacity = '0.5';
      }
    });
  });

  // Inquiry form connection
  if (infoPlotCta) {
    infoPlotCta.addEventListener('click', () => {
      const plotTitle = infoPlotTitle ? infoPlotTitle.innerText : 'a plot';
      const interestDropdown = document.getElementById('contact-interest');
      if (interestDropdown) {
        // Find matching option or add a temporary one
        interestDropdown.value = "General Investment Query";
        // Scroll to contact form
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        
        // Focus name field
        const nameInput = document.getElementById('contact-name');
        if (nameInput) {
          nameInput.focus();
          // prefill message
          document.getElementById('contact-message').value = `I am interested in inquiring about ${plotTitle} (${infoPlotSize ? infoPlotSize.innerText : ''}, ${infoPlotFacing ? infoPlotFacing.innerText : ''} facing).`;
        }
      }
    });
  }

  // ==========================================
  // 4. Before/After Infrastructure Slider
  // ==========================================
  const slider = document.getElementById('ba-slider');
  const afterImg = document.getElementById('ba-after-img');
  const handle = document.getElementById('ba-handle');

  if (slider && afterImg && handle) {
    let isSliding = false;

    const setSliderPosition = (x) => {
      const rect = slider.getBoundingClientRect();
      let position = ((x - rect.left) / rect.width) * 100;
      
      // Limit bounds between 0% and 100%
      if (position < 0) position = 0;
      if (position > 100) position = 100;
      
      afterImg.style.clipPath = `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)`;
      handle.style.left = `${position}%`;
    };

    // Mouse Events
    slider.addEventListener('mousedown', (e) => {
      isSliding = true;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isSliding) return;
      setSliderPosition(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isSliding = false;
    });

    // Touch Events for Mobile
    slider.addEventListener('touchstart', (e) => {
      isSliding = true;
      setSliderPosition(e.touches[0].clientX);
    });

    window.addEventListener('touchmove', (e) => {
      if (!isSliding) return;
      setSliderPosition(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => {
      isSliding = false;
    });
  }

  // ==========================================
  // 5. Timeline Progress Line
  // ==========================================
  const timelineProgress = document.getElementById('timeline-progress');
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  if (timelineItems.length > 0 && timelineProgress) {
    window.addEventListener('scroll', () => {
      let activeIndex = -1;
      
      timelineItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.7) {
          activeIndex = index;
          item.classList.add('active-timeline');
        } else {
          item.classList.remove('active-timeline');
        }
      });
      
      if (activeIndex !== -1) {
        const progressPercent = ((activeIndex) / (timelineItems.length - 1)) * 100;
        timelineProgress.style.height = `${progressPercent}%`;
      } else {
        timelineProgress.style.height = '0%';
      }
    });
  }

  // ==========================================
  // 6. Investment ROI Calculator
  // ==========================================
  const sizeSlider = document.getElementById('calc-size-slider');
  const yearsSlider = document.getElementById('calc-years-slider');
  const growthSlider = document.getElementById('calc-growth-slider');
  
  const sizeVal = document.getElementById('calc-size-val');
  const yearsVal = document.getElementById('calc-years-val');
  const growthVal = document.getElementById('calc-growth-val');
  
  const initialDisplay = document.getElementById('calc-initial-val');
  const projectedDisplay = document.getElementById('calc-projected-val');
  const netYieldDisplay = document.getElementById('calc-net-yield');
  
  const presetBtns = document.querySelectorAll('.calc-preset-btn');

  function calculateAppreciation() {
    const size = sizeSlider ? parseFloat(sizeSlider.value) : 413.21;
    const years = parseInt(yearsSlider.value, 10);
    const cagr = parseFloat(growthSlider.value) / 100;
    
    // Base land rate is ₹10,043.32 per Sq. Yd.
    const baseRate = 10043.32;
    const initialPrice = size * baseRate;
    
    // Future value compound interest equation: FV = PV * (1 + r)^n
    const futureValue = initialPrice * Math.pow(1 + cagr, years);
    const netYieldPercent = Math.round(((futureValue - initialPrice) / initialPrice) * 100);
    
    // Formatter for Indian Rupees
    const rupeeFormatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
    
    // Update Text displays
    if (sizeVal) sizeVal.innerText = size;
    yearsVal.innerText = years;
    growthVal.innerText = Math.round(cagr * 100);
    
    initialDisplay.innerText = rupeeFormatter.format(initialPrice);
    projectedDisplay.innerText = rupeeFormatter.format(futureValue);
    netYieldDisplay.innerText = `${netYieldPercent}%`;
  }

  if (yearsSlider && growthSlider) {
    if (sizeSlider) {
      sizeSlider.addEventListener('input', calculateAppreciation);
    }
    yearsSlider.addEventListener('input', calculateAppreciation);
    growthSlider.addEventListener('input', calculateAppreciation);
    
    if (presetBtns) {
      presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          presetBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (sizeSlider) sizeSlider.value = btn.getAttribute('data-val');
          calculateAppreciation();
        });
      });
    }
    
    // Initial compute
    calculateAppreciation();
  }

  // ==========================================
  // 7. FAQ Accordion
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer');
    
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all FAQs
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });
      
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ==========================================
  // 8. Premium Gallery Filter & Lightbox
  // ==========================================
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  
  let currentLightboxIndex = 0;
  let activeGalleryItems = [...galleryItems];

  // Filters
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      
      activeGalleryItems = [];
      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          activeGalleryItems.push(item);
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Open Lightbox
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      // Find index within current active items
      currentLightboxIndex = activeGalleryItems.indexOf(item);
      if (currentLightboxIndex === -1) return;
      
      openLightbox(activeGalleryItems[currentLightboxIndex]);
    });
  });

  function openLightbox(item) {
    const imgSrc = item.getAttribute('data-src');
    const altText = item.querySelector('img').getAttribute('alt');
    
    lightboxImg.src = imgSrc;
    lightboxCaption.innerText = altText;
    lightbox.classList.add('active');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
  }

  function navigateLightbox(direction) {
    currentLightboxIndex += direction;
    
    if (currentLightboxIndex < 0) {
      currentLightboxIndex = activeGalleryItems.length - 1;
    } else if (currentLightboxIndex >= activeGalleryItems.length) {
      currentLightboxIndex = 0;
    }
    
    const nextItem = activeGalleryItems[currentLightboxIndex];
    const imgSrc = nextItem.getAttribute('data-src');
    const altText = nextItem.querySelector('img').getAttribute('alt');
    
    // Soft transition swap
    lightboxImg.style.opacity = '0';
    setTimeout(() => {
      lightboxImg.src = imgSrc;
      lightboxCaption.innerText = altText;
      lightboxImg.style.opacity = '1';
    }, 200);
  }

  if (lightbox) {
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard bindings
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
  }

  // ==========================================
  // 9. Modals (Brochure / Booking Forms)
  // ==========================================
  const brochureModal = document.getElementById('brochure-modal');
  const bookingModal = document.getElementById('booking-modal');
  
  const brochureBtn = document.getElementById('hero-brochure-btn');
  const visitBtn = document.getElementById('hero-visit-btn');
  const navBookBtn = document.getElementById('nav-book-btn');
  
  const modalCloseBtns = document.querySelectorAll('.modal-close-btn');

  function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  if (brochureBtn) brochureBtn.addEventListener('click', () => openModal(brochureModal));
  if (visitBtn) visitBtn.addEventListener('click', () => openModal(bookingModal));
  if (navBookBtn) navBookBtn.addEventListener('click', () => openModal(bookingModal));

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(brochureModal);
      closeModal(bookingModal);
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === brochureModal) closeModal(brochureModal);
    if (e.target === bookingModal) closeModal(bookingModal);
  });

  // Handle Form Submissions with success status
  const brochureForm = document.getElementById('brochure-lead-form');
  const bookingForm = document.getElementById('visit-booking-form');
  const contactForm = document.getElementById('investor-contact-form');

  if (brochureForm) {
    brochureForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('lead-name').value;
      const phone = document.getElementById('lead-phone').value;
      const email = document.getElementById('lead-email').value;

      try {
        await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'brochure', name, phone, email })
        });
        if (typeof fbq === 'function') fbq('track', 'Lead');
        if (typeof gtag === 'function') gtag('event', 'generate_lead');
      } catch (err) { console.error('Form submission failed', err); }
      
      brochureForm.innerHTML = `
        <div style="text-align: center; padding: 2rem 0;">
          <svg viewBox="0 0 24 24" style="width: 50px; height: 50px; fill: var(--accent-green); margin-bottom: 1.5rem;">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <h4 style="font-family: var(--font-serif-header); font-size: 1.8rem; margin-bottom: 0.5rem;">Thank you, ${name}</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Your brochure download is initiating. An investment manager will connect with you shortly.</p>
        </div>
      `;

      // Trigger a mock file download
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = 'images/hero.png'; // Mock brochure download
        link.download = 'LRK_Vistara_Brochure.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 1500);

      setTimeout(() => {
        closeModal(brochureModal);
      }, 5000);
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('book-name').value;
      const phone = document.getElementById('book-phone').value;
      const date = document.getElementById('book-date').value;

      try {
        await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'visit', name, phone, visit_date: date })
        });
        if (typeof fbq === 'function') fbq('track', 'Lead');
        if (typeof gtag === 'function') gtag('event', 'generate_lead');
      } catch (err) { console.error('Form submission failed', err); }
      
      bookingForm.innerHTML = `
        <div style="text-align: center; padding: 2rem 0;">
          <svg viewBox="0 0 24 24" style="width: 50px; height: 50px; fill: var(--accent-green); margin-bottom: 1.5rem;">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <h4 style="font-family: var(--font-serif-header); font-size: 1.8rem; margin-bottom: 0.5rem;">Site Visit Reserved</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Site visit schedule confirmed for <strong>${date}</strong>. Our logistics manager will call you to coordinate private pick-up logistics.</p>
        </div>
      `;

      setTimeout(() => {
        closeModal(bookingModal);
      }, 5000);
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      const phone = document.getElementById('contact-phone').value;
      const email = document.getElementById('contact-email').value;
      const interest = document.getElementById('contact-interest').value;
      const message = document.getElementById('contact-message').value;

      try {
        await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'contact', name, phone, email, interest, message })
        });
        if (typeof fbq === 'function') fbq('track', 'Lead');
        if (typeof gtag === 'function') gtag('event', 'generate_lead');
      } catch (err) { console.error('Form submission failed', err); }
      
      contactForm.innerHTML = `
        <div style="text-align: center; padding: 3rem 0;">
          <svg viewBox="0 0 24 24" style="width: 60px; height: 60px; fill: var(--accent-green); margin-bottom: 1.5rem;">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <h4 style="font-family: var(--font-serif-header); font-size: 2rem; margin-bottom: 0.5rem; color: var(--text-charcoal);">Consultation Registered</h4>
          <p style="color: var(--text-muted); font-size: 1rem; max-width: 400px; margin: 0 auto;">Thank you for registering, ${name}. A senior investment officer from our Signature office will contact you within 2 business hours.</p>
        </div>
      `;
    });
  }

  // ==========================================
  // 10. AI Chat Assistant Widget
  // ==========================================
  const aiTrigger = document.getElementById('ai-chat-trigger');
  const aiWidget = document.getElementById('ai-widget');
  const aiClose = document.getElementById('ai-widget-close');
  const aiSend = document.getElementById('ai-chat-send');
  const aiInput = document.getElementById('ai-chat-input');
  const aiFeed = document.getElementById('ai-chat-feed');
  const aiBadge = document.getElementById('ai-badge');

  // Trigger Badge Notification after 4 seconds
  setTimeout(() => {
    if (!aiWidget.classList.contains('active')) {
      aiBadge.style.display = 'block';
    }
  }, 4000);

  function toggleAiChat() {
    aiWidget.classList.toggle('active');
    aiBadge.style.display = 'none';
    
    if (aiWidget.classList.contains('active')) {
      setTimeout(() => aiInput.focus(), 300);
    }
  }

  aiTrigger.addEventListener('click', toggleAiChat);
  aiClose.addEventListener('click', toggleAiChat);

  // Suggested Queries
  aiFeed.addEventListener('click', (e) => {
    if (e.target.classList.contains('bubble-suggested')) {
      const query = e.target.getAttribute('data-query');
      handleUserMessage(query);
    }
  });

  aiSend.addEventListener('click', () => {
    const text = aiInput.value.trim();
    if (text) {
      handleUserMessage(text);
      aiInput.value = '';
    }
  });

  aiInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const text = aiInput.value.trim();
      if (text) {
        handleUserMessage(text);
        aiInput.value = '';
      }
    }
  });

  function appendChatBubble(text, sender) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble bubble-${sender}`;
    bubble.innerText = text;
    aiFeed.appendChild(bubble);
    aiFeed.scrollTop = aiFeed.scrollHeight;
    return bubble;
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'chat-bubble bubble-consultant bubble-typing';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    aiFeed.appendChild(indicator);
    aiFeed.scrollTop = aiFeed.scrollHeight;
    return indicator;
  }

  // Store chat history in memory for session continuity
  const chatHistory = [];

  async function handleUserMessage(message) {
    // Append user message
    appendChatBubble(message, 'user');
    
    // Remove suggestion buttons
    const suggestions = aiFeed.querySelectorAll('.bubble-suggested');
    suggestions.forEach(btn => btn.remove());

    // Show Typing indicator
    const typingIndicator = showTypingIndicator();
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          history: chatHistory
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const responseText = data.reply;

      // Update chat history
      chatHistory.push({ text: message, sender: 'user' });
      chatHistory.push({ text: responseText, sender: 'consultant' });

      // Remove typing indicator and append consultant reply
      typingIndicator.remove();
      appendChatBubble(responseText, 'consultant');
    } catch (error) {
      console.error('Chat error:', error);
      typingIndicator.remove();
      appendChatBubble("I apologize, but my secure communication channel is currently offline. Please try again in a few moments, or connect with our investment desks directly.", 'consultant');
    }

    // Append followup options
    const buttonGrid = [
      { label: "Book a Site Visit", query: "Book a site visit" },
      { label: "Show Payment Plans", query: "Show payment plans" }
    ];
    
    buttonGrid.forEach(btnInfo => {
      const optionBtn = document.createElement('button');
      optionBtn.className = 'bubble-suggested';
      optionBtn.setAttribute('data-query', btnInfo.query);
      optionBtn.innerText = btnInfo.label;
      aiFeed.appendChild(optionBtn);
    });
    
    aiFeed.scrollTop = aiFeed.scrollHeight;
  }

  // ==========================================
  // Dholera Investment Hub Tab Switching
  // ==========================================
  const hubTabBtns = document.querySelectorAll('.hub-tab-btn');
  const hubTabContents = document.querySelectorAll('.hub-tab-content');

  hubTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      // Update button active states
      hubTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update content active states
      hubTabContents.forEach(content => {
        if (content.id === targetTab) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });

  // ==========================================
  // Dholera Map Lightbox Zoom Modal
  // ==========================================
  const mapLightboxModal = document.getElementById('map-lightbox-modal');
  const lightboxMapImg = document.getElementById('lightbox-map-img');
  const lightboxMapCaption = document.getElementById('lightbox-map-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const zoomableWrappers = document.querySelectorAll('.zoomable-map-wrapper');

  if (mapLightboxModal && lightboxMapImg && zoomableWrappers) {
    zoomableWrappers.forEach(wrapper => {
      wrapper.addEventListener('click', () => {
        const img = wrapper.querySelector('img');
        const caption = wrapper.nextElementSibling ? wrapper.nextElementSibling.innerText : '';
        
        if (img) {
          lightboxMapImg.src = img.src;
          lightboxMapImg.alt = img.alt;
          if (lightboxMapCaption) {
            lightboxMapCaption.innerText = caption || img.alt;
          }
          openModal(mapLightboxModal);
        }
      });
    });

    const closeMapLightbox = () => {
      closeModal(mapLightboxModal);
      if (lightboxMapImg) lightboxMapImg.src = "";
    };

    if (lightboxCloseBtn) {
      lightboxCloseBtn.addEventListener('click', closeMapLightbox);
    }

    mapLightboxModal.addEventListener('click', (e) => {
      if (e.target === mapLightboxModal) {
        closeMapLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mapLightboxModal.classList.contains('active')) {
        closeMapLightbox();
      }
    });
  }

});
