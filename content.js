function initExtension() {
  const currentURL = window.location.hostname;
  if (currentURL.includes('bsky.app')) {
    initBluesky();
  }
}

function initBluesky() {
  console.log('initBluesky');
  
  // Wait for feed container to be available
  function initFeedObserver() {
    const feedContainer = document.querySelector('[data-testid="customFeedPage-feed-flatlist"]');
    if (feedContainer) {
      console.log('Found feed container, initializing observer');
      // Initial run on existing posts
      addBlockButtons();

      // Observe only the feed container for changes
      
      const observer = new MutationObserver(addBlockButtons);
      observer.observe(document.body, { 
        childList: true, 
        subtree: true 
      });
    } else {
      // If feed container isn't available yet, retry after a short delay
      setTimeout(initFeedObserver, 1000);
    }
  }

  function addBlockButtons() {
    const feedContainer = document.querySelector('[data-testid="customFeedPage-feed-flatlist"]');
    if (!feedContainer) return;
    //console.log('feedContainer', feedContainer);
    const posts = Array.from(feedContainer.children).flatMap(div => Array.from(div.children)).flatMap(div => Array.from(div.children));
    //console.log('posts 2', posts);
    posts.forEach(post => {
      if (!post.querySelector('.custom-block-button')) {
        const likeButton = post.querySelector('[data-testid="likeBtn"]');
        if (!likeButton) return;

        const buttonBlockContainer = document.createElement('div');
        buttonBlockContainer.className = 'css-175oi2r';
        buttonBlockContainer.style.cssText = 'flex: 1 1 0%; align-items: flex-start;';

        const buttonLessContainer = document.createElement('div');
        buttonLessContainer.className = 'css-175oi2r';
        buttonLessContainer.style.cssText = 'flex: 1 1 0%; align-items: flex-start;';

        const buttonBothContainer = document.createElement('div');
        buttonBothContainer.className = 'css-175oi2r';
        buttonBothContainer.style.cssText = 'flex: 1 1 0%; align-items: flex-start;';

        const seeLessButton = createSeeLessButton(post);
        const blockButton = createBlockButton(post);
        const bothButton = createBothButton(post);
        buttonBlockContainer.appendChild(seeLessButton)
        buttonLessContainer.appendChild(blockButton);
        buttonBothContainer.appendChild(bothButton);
        
        likeButton.parentElement.parentElement.insertBefore(buttonBothContainer, likeButton.parentElement.nextSibling);
        likeButton.parentElement.parentElement.insertBefore(buttonLessContainer, likeButton.parentElement.nextSibling);
        likeButton.parentElement.parentElement.insertBefore(buttonBlockContainer, likeButton.parentElement.nextSibling);
      }
    });
  }

  function createBlockButton(post) {
    const button = document.createElement('button');
    button.className = 'custom-block-button';
    button.setAttribute('aria-label', 'Block user');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.style.cssText = `
      display: flex;
      gap: 4px;
      border-radius: 999px;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      padding: 5px;
      background: none;
      border: none;
      cursor: pointer;
    `;

    button.innerHTML = `
    <svg fill="none" viewBox="0 0 24 24" width="20" height="20"><path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd" d="M12 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM7.5 6.5a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM5.679 19c.709-2.902 3.079-5 6.321-5 .302 0 .595.018.878.053a1 1 0 0 0 .243-1.985A9.235 9.235 0 0 0 12 12c-4.3 0-7.447 2.884-8.304 6.696-.29 1.29.767 2.304 1.902 2.304H12a1 1 0 1 0 0-2H5.679Zm9.614-3.707a1 1 0 0 1 1.414 0L18 16.586l1.293-1.293a1 1 0 0 1 1.414 1.414L19.414 18l1.293 1.293a1 1 0 0 1-1.414 1.414L18 19.414l-1.293 1.293a1 1 0 0 1-1.414-1.414L16.586 18l-1.293-1.293a1 1 0 0 1 0-1.414Z"></path></svg>
    `;

    button.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      performBlockAction(post);
    });

    return button;
  }

  function createSeeLessButton(post) {
    const button = document.createElement('button');
    button.className = 'custom-block-button';
    button.setAttribute('aria-label', 'Block user');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.style.cssText = `
      display: flex;
      gap: 4px;
      border-radius: 999px;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      padding: 5px;
      background: none;
      border: none;
      cursor: pointer;
    `;

    button.innerHTML = `
    <svg fill="none" viewBox="0 0 24 24" width="20" height="20"><path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd" d="M6.343 6.343a8 8 0 1 1 11.314 11.314A8 8 0 0 1 6.343 6.343ZM19.071 4.93c-3.905-3.905-10.237-3.905-14.142 0-3.905 3.905-3.905 10.237 0 14.142 3.905 3.905 10.237 3.905 14.142 0 3.905-3.905 3.905-10.237 0-14.142Zm-3.537 9.535a5 5 0 0 0-7.07 0 1 1 0 1 0 1.413 1.415 3 3 0 0 1 4.243 0 1 1 0 0 0 1.414-1.415ZM16 9.5c0 .828-.56 1.5-1.25 1.5s-1.25-.672-1.25-1.5.56-1.5 1.25-1.5S16 8.672 16 9.5ZM9.25 11c.69 0 1.25-.672 1.25-1.5S9.94 8 9.25 8 8 8.672 8 9.5 8.56 11 9.25 11Z"></path></svg>
    `;

    button.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      performSeeLessAction(post);
    });

    return button;
  }

  function createBothButton(post) {
    const button = document.createElement('button');
    button.className = 'custom-block-button';
    button.setAttribute('aria-label', 'Block user');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.style.cssText = `
      display: flex;
      gap: 4px;
      border-radius: 999px;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      padding: 5px;
      background: none;
      border: none;
      cursor: pointer;
    `;

    button.innerHTML = `
    <svg fill="none" viewBox="0 0 24 24" width="20" height="20"><path fill="hsl(211, 20%, 64.8%)" fill-rule="evenodd" clip-rule="evenodd" d="M11.14 4.494a.995.995 0 0 1 1.72 0l7.001 12.008a.996.996 0 0 1-.86 1.498H4.999a.996.996 0 0 1-.86-1.498L11.14 4.494Zm3.447-1.007c-1.155-1.983-4.019-1.983-5.174 0L2.41 15.494C1.247 17.491 2.686 20 4.998 20h14.004c2.312 0 3.751-2.509 2.587-4.506L14.587 3.487ZM13 9.019a1 1 0 1 0-2 0v2.994a1 1 0 1 0 2 0V9.02Zm-1 4.731a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z"></path></svg>
    `;

    button.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      performBothAction(post);
    });

    return button;
  }

  function performSeeLessAction(post) {
    const moreButton = post.querySelector('[data-testid="postDropdownBtn"]');
    if (moreButton) {
      moreButton.click();
      setTimeout(() => {
        const blockOption = document.querySelector('[data-testid="postDropdownShowLessBtn"]');

        if (blockOption) {
          blockOption.click();
        }

      }, 50);
    }
  }

  function performBlockAction(post) {
    const moreButton = post.querySelector('[data-testid="postDropdownBtn"]');
    if (moreButton) {
      moreButton.click();
      setTimeout(() => {
        const blockOption = document.querySelector('[data-testid="postDropdownBlockBtn"]');
        
        if (blockOption) {
          blockOption.click();
          
          setTimeout(() => {
            const confirmButton = document.querySelector('[data-testid="confirmBtn"]');
            if (confirmButton) {
              confirmButton.click();
            }
          }, 50);
        }
      }, 50);
    }
  }

  function performBothAction(post) {
    performSeeLessAction(post);
    setTimeout(function() {
      performBlockAction(post);
    }, 500);

  }
  // Add Bluesky-specific styles
  const blueskyStyle = document.createElement('style');
  blueskyStyle.textContent = `
    .custom-block-button {
      color: rgb(120, 142, 165);
    }
    .custom-block-button:hover {
      color: rgb(239, 68, 68);
    }
    .custom-block-button svg {
      fill: currentColor;
    }
  `;
  document.head.appendChild(blueskyStyle);

  // Start the initialization
  initFeedObserver();
}

initExtension();