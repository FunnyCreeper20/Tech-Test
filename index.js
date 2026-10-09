const yearEl = document.getElementById('year');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

function setupTokenizationDemo() {
  const inputs = document.querySelectorAll('[data-demo="tokenization"]');
  const buttons = document.querySelectorAll('[data-demo-button="tokenization"]');
  const outputs = document.querySelectorAll('[data-demo-output="tokenization"]');

  if (!inputs.length || !buttons.length || !outputs.length) {
    return;
  }

  const renderTokens = (inputEl, outputEl) => {
    const rawText = inputEl.value.trim();

    if (!rawText) {
      outputEl.innerHTML = '<p>Type a sentence to see how it gets split into tokens.</p>';
      return;
    }

    const tokens = rawText.toLowerCase().match(/[a-z0-9']+/g) || [];
    const chips = tokens.length
      ? tokens
          .map((token) => `<span class="token-chip">${token}</span>`)
          .join('')
      : '<p>No valid tokens found.</p>';

    outputEl.innerHTML = `<div class="token-cloud">${chips}</div>`;
  };

  inputs.forEach((inputEl) => {
    const outputEl = inputEl.parentElement?.querySelector('[data-demo-output="tokenization"]');
    if (!outputEl) return;

    const buttonEl = inputEl.parentElement?.querySelector('[data-demo-button="tokenization"]');
    buttonEl?.addEventListener('click', () => renderTokens(inputEl, outputEl));
    inputEl.addEventListener('input', () => renderTokens(inputEl, outputEl));
    renderTokens(inputEl, outputEl);
  });

  buttons.forEach((buttonEl) => {
    const inputEl = buttonEl.parentElement?.parentElement?.querySelector('[data-demo="tokenization"]');
    const outputEl = buttonEl.parentElement?.parentElement?.querySelector('[data-demo-output="tokenization"]');
    if (inputEl && outputEl) {
      buttonEl.addEventListener('click', () => renderTokens(inputEl, outputEl));
    }
  });
}

function setupForwardPassDemo() {
  const sliders = Array.from(document.querySelectorAll('[data-forward]'));
  const buttonEl = document.querySelector('[data-forward-button="run"]');

  if (!sliders.length || !buttonEl) {
    return;
  }

  const sigmoid = (value) => 1 / (1 + Math.exp(-value));

  const update = () => {
    const values = {};
    sliders.forEach((slider) => {
      values[slider.dataset.forward] = Number(slider.value);
    });

    const weightedSum = values.x1 * values.w1 + values.x2 * values.w2 + values.bias;
    const activation = sigmoid(weightedSum);

    document.querySelector('[data-range-label="x1"]').textContent = values.x1.toFixed(1);
    document.querySelector('[data-range-label="x2"]').textContent = values.x2.toFixed(1);
    document.querySelector('[data-range-label="w1"]').textContent = values.w1.toFixed(1);
    document.querySelector('[data-range-label="w2"]').textContent = values.w2.toFixed(1);
    document.querySelector('[data-range-label="bias"]').textContent = values.bias.toFixed(1);

    document.querySelector('[data-forward-output="sum"]').textContent = weightedSum.toFixed(2);
    document.querySelector('[data-forward-output="activation"]').textContent = activation.toFixed(3);
  };

  buttonEl.addEventListener('click', update);
  sliders.forEach((slider) => slider.addEventListener('input', update));
  update();
}

function setupBackpropDemo() {
  const learningRate = document.querySelector('[data-backprop="learning-rate"]');
  const target = document.querySelector('[data-backprop="target"]');
  const buttonEl = document.querySelector('[data-backprop-button="run"]');

  if (!learningRate || !target || !buttonEl) {
    return;
  }

  let weight = 0.5;
  let prediction = 0.5;

  const updateReadout = () => {
    document.querySelector('[data-range-label="lr"]').textContent = Number(learningRate.value).toFixed(2);
    document.querySelector('[data-range-label="target"]').textContent = Number(target.value).toFixed(2);

    prediction = Number(target.value) * Number(learningRate.value) + 0.2;
    const error = Number(target.value) - prediction;
    weight = weight + Number(learningRate.value) * error * 0.2;

    document.querySelector('[data-backprop-output="prediction"]').textContent = prediction.toFixed(2);
    document.querySelector('[data-backprop-output="error"]').textContent = error.toFixed(2);
    document.querySelector('[data-backprop-output="weight"]').textContent = weight.toFixed(2);
  };

  buttonEl.addEventListener('click', updateReadout);
  [learningRate, target].forEach((element) => element.addEventListener('input', updateReadout));
  updateReadout();
}

function setupPromptDemo() {
  const inputEl = document.querySelector('[data-demo="prompt"]');
  const outputEl = document.querySelector('[data-demo-output="prompt"]');
  const buttonEl = document.querySelector('[data-demo-button="prompt"]');

  if (!inputEl || !outputEl || !buttonEl) {
    return;
  }

  const buildPrompt = (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      return 'Write a clear task, include context, and specify the format you want in return.';
    }

    return `You are an AI assistant helping a student learn. Task: ${trimmed}.\n\nContext: explain the idea clearly, give a short example, and describe the trade-offs or limitations.`;
  };

  buttonEl.addEventListener('click', () => {
    outputEl.textContent = buildPrompt(inputEl.value);
  });

  outputEl.textContent = buildPrompt(inputEl.value || 'Summarize how neural networks work in plain English.');
}

function setupResearchIdeas() {
  const buttonEl = document.querySelector('[data-research-button="next"]');
  const outputEl = document.querySelector('[data-research-output]');

  if (!buttonEl || !outputEl) {
    return;
  }

  const prompts = [
    'How does subword tokenization affect the way large language models handle rare words?',
    'What trade-offs appear when you increase model depth versus model width in a neural network?',
    'How can prompt structure change the quality and reliability of AI-generated explanations?',
    'How can AI tools help students brainstorm projects without replacing their own critical thinking?'
  ];

  buttonEl.addEventListener('click', () => {
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    outputEl.textContent = `Research question: ${randomPrompt}`;
  });
}

function getCourseState() {
  const defaultState = {
    activeTrack: 'creation',
    completed: {
      creation: {
        tokenization: false,
        'forward-pass': false,
        backpropagation: false,
      },
      usage: {
        'prompt-engineering': false,
        'ai-ethics': false,
        'research-ideas': false,
      },
    },
  };

  try {
    const raw = localStorage.getItem('tech-league-extra-course-state');
    if (!raw) {
      localStorage.setItem('tech-league-extra-course-state', JSON.stringify(defaultState));
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    return {
      activeTrack: parsed.activeTrack === 'usage' ? 'usage' : 'creation',
      completed: {
        creation: { ...defaultState.completed.creation, ...(parsed.completed?.creation || {}) },
        usage: { ...defaultState.completed.usage, ...(parsed.completed?.usage || {}) },
      },
    };
  } catch (error) {
    console.warn('Could not load course state:', error);
    localStorage.setItem('tech-league-extra-course-state', JSON.stringify(defaultState));
    return defaultState;
  }
}

function saveCourseState(state) {
  localStorage.setItem('tech-league-extra-course-state', JSON.stringify(state));
}

function setupCourseFlow() {
  const trackButtons = document.querySelectorAll('[data-track-button]');
  const panels = document.querySelectorAll('[data-track-panel]');
  const chapterToggles = document.querySelectorAll('[data-chapter-toggle]');
  const courseState = getCourseState();

  const applyState = () => {
    trackButtons.forEach((button) => {
      const isActive = button.dataset.trackButton === courseState.activeTrack;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', String(isActive));
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.trackPanel === courseState.activeTrack;
      panel.classList.toggle('active', isActive);
    });

    chapterToggles.forEach((button) => {
      const chapterKey = button.dataset.chapterToggle;
      const trackName = button.closest('[data-track]')?.dataset.track;
      const isComplete = !!courseState.completed?.[trackName]?.[chapterKey];
      button.classList.toggle('done', isComplete);
      button.textContent = isComplete ? 'Completed' : 'Mark complete';
      button.closest('.chapter-card')?.classList.toggle('is-complete', isComplete);
    });
  };

  trackButtons.forEach((button) => {
    button.addEventListener('click', () => {
      courseState.activeTrack = button.dataset.trackButton;
      saveCourseState(courseState);
      applyState();
    });
  });

  chapterToggles.forEach((button) => {
    button.addEventListener('click', () => {
      const chapterKey = button.dataset.chapterToggle;
      const trackName = button.closest('[data-track]')?.dataset.track;
      if (!trackName || !courseState.completed[trackName]) {
        return;
      }

      courseState.completed[trackName][chapterKey] = !courseState.completed[trackName][chapterKey];
      saveCourseState(courseState);
      applyState();
    });
  });

  applyState();
}

const NEWSLETTER_PASSCODE = 'TECHLEAGUE2026';
const NEWSLETTER_STORAGE_KEY = 'tech-league-newsletter-items';
const NEWSLETTER_UNLOCK_KEY = 'tech-league-newsletter-admin-enabled';

const defaultNewsletterEntries = [];

function getNewsletterEntries() {
  try {
    const stored = localStorage.getItem(NEWSLETTER_STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(defaultNewsletterEntries));
      return [...defaultNewsletterEntries];
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : [...defaultNewsletterEntries];
  } catch (error) {
    console.warn('Could not read newsletter entries:', error);
    return [...defaultNewsletterEntries];
  }
}

function saveNewsletterEntries(entries) {
  localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(entries));
}

function renderNewsletterEntries() {
  const listEl = document.querySelector('[data-newsletter-list]');

  if (!listEl) {
    return;
  }

  const entries = getNewsletterEntries();

  listEl.innerHTML = entries
    .map(
      (entry) => `
        <article class="newsletter-item">
          <div class="newsletter-meta">
            <span>${entry.category || 'Club update'}</span>
            <time>${entry.date || 'Just now'}</time>
          </div>
          <h3>${entry.title}</h3>
          <p>${entry.summary}</p>
        </article>
      `
    )
    .join('');
}

function attemptNewsletterUnlock() {
  const enteredCode = window.prompt('Enter the newsletter admin passcode:');

  if (enteredCode === null) {
    return false;
  }

  if (enteredCode.trim() === NEWSLETTER_PASSCODE) {
    sessionStorage.setItem(NEWSLETTER_UNLOCK_KEY, 'true');
    return true;
  }

  window.alert('Access denied. Incorrect passcode.');
  return false;
}

function setupNewsletterAccess() {
  const pageType = document.body.dataset.page;
  const form = document.getElementById('newsletter-form');
  const unlockButton = document.getElementById('newsletter-access-button');

  if (pageType === 'newsletter') {
    renderNewsletterEntries();

    if (form && sessionStorage.getItem(NEWSLETTER_UNLOCK_KEY) === 'true') {
      form.classList.remove('hidden');
    }

    if (unlockButton) {
      unlockButton.addEventListener('click', () => {
        if (attemptNewsletterUnlock()) {
          if (form) {
            form.classList.remove('hidden');
          }
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const title = String(formData.get('title') || '').trim();
        const category = String(formData.get('category') || 'Club update').trim();
        const summary = String(formData.get('summary') || '').trim();
        const statusNode = document.getElementById('newsletter-status');

        if (!title || !summary) {
          if (statusNode) {
            statusNode.textContent = 'Please add both a title and a summary.';
          }
          return;
        }

        const entries = getNewsletterEntries();
        entries.unshift({
          title,
          category,
          summary,
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        });

        saveNewsletterEntries(entries.slice(0, 12));
        renderNewsletterEntries();
        form.reset();

        if (statusNode) {
          statusNode.textContent = 'Newsletter entry added successfully.';
        }
      });
    }

    return;
  }

  if (pageType === 'newsletter-admin') {
    const form = document.getElementById('newsletter-form');

    if (sessionStorage.getItem(NEWSLETTER_UNLOCK_KEY) !== 'true') {
      if (!attemptNewsletterUnlock()) {
        window.location.href = 'newsletter.html';
        return;
      }
    }

    if (form) {
      form.classList.remove('hidden');
    }

    renderNewsletterEntries();

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const title = String(formData.get('title') || '').trim();
      const category = String(formData.get('category') || 'Club update').trim();
      const summary = String(formData.get('summary') || '').trim();
      const statusNode = document.getElementById('newsletter-status');

      if (!title || !summary) {
        if (statusNode) {
          statusNode.textContent = 'Please add both a title and a summary.';
        }
        return;
      }

      const entries = getNewsletterEntries();
      entries.unshift({
        title,
        category,
        summary,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      });

      saveNewsletterEntries(entries.slice(0, 12));
      renderNewsletterEntries();
      form.reset();

      if (statusNode) {
        statusNode.textContent = 'Newsletter entry added successfully.';
      }
    });
  }
}

const revealed = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

revealed.forEach((element) => observer.observe(element));
setupNewsletterAccess();
setupTokenizationDemo();
setupForwardPassDemo();
setupBackpropDemo();
setupPromptDemo();
setupResearchIdeas();
setupCourseFlow();
