(() => {
  console.log('Search script loaded');
  
  // Get the current language from the URL path
  const path = window.location.pathname;
  const lang = path.startsWith('/zh') ? 'zh' : 'en';
  const indexUrl = `${window.location.origin}/${lang}/index.json`;
  
  console.log('Current URL:', window.location.href);
  console.log('Loading search index from:', indexUrl);
  
  fetch(indexUrl)
  .then(response => {
    console.log('Search index response:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Search index loaded, items:', data.length);
    
    const fuse = new Fuse(data, {
      keys: ['title', 'content'],
      shouldSort: true,
      includeMatches: true,
      minMatchCharLength: 2,
      threshold: 0.3,
      ignoreLocation: true,
    })
  
    const searchForm = document.getElementById('search-form');
    console.log('Search form found:', !!searchForm);
    
    if (searchForm) {
      searchForm.addEventListener('submit', function (e) {
        console.log('Search form submitted');
        e.preventDefault();
        const formData = new FormData(e.target);
        const input = [...formData.entries()][0][1];
        console.log('Search input:', input);
        
        if (input && input.trim().length >= 2) {
          const results = fuse.search(input);
          console.log('Search results:', results.length);
          displayResults(input, results);
        }
      });
    }
  })
  .catch(error => {
    console.error('Error loading search index:', error);
  });
})();

function displayResults(input, results) {
  const searchResults = document.getElementById('search-result');
  if (!searchResults) {
    console.error('Search results container not found');
    return;
  }
  
  // Hide the main content
  const mainContent = document.querySelector('.application-main main');
  if (mainContent) {
    mainContent.style.display = 'none';
  }
  
  // Show search results
  searchResults.style.display = 'block';
  
  let html = renderResultsCountHtml(results.length, input);
  if (results.length > 0) {
    let li = renderResultsItemHtml(results);
    html += `<ul>${li}</ul>`;
  } else {
    html += '<div class="no-results">No results found for "' + input + '"</div>';
  }
  
  // Add a back button
  html += '<button onclick="clearSearch()" class="back-button">← Back to main content</button>';
  
  searchResults.innerHTML = html;
}

function clearSearch() {
  const searchResults = document.getElementById('search-result');
  const mainContent = document.querySelector('.application-main main');
  const searchInput = document.querySelector('#search-form input[name="q"]');
  
  if (searchResults) {
    searchResults.style.display = 'none';
  }
  
  if (mainContent) {
    mainContent.style.display = 'block';
  }
  
  if (searchInput) {
    searchInput.value = '';
  }
}

function renderResultsCountHtml(count, input) {
let html = `
<div class="search-results-count">
  <svg class="octicon octicon-search" viewBox="0 0 16 16" version="1.1" width="16" height="16">
    <path fill-rule="evenodd" d="M11.5 7a4.499 4.499 0 11-8.998 0A4.499 4.499 0 0111.5 7zM8 8a3 3 0 100-6 3 3 0 000 6zM9.5 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
  </svg>
  <strong>${count} results for "${input}"</strong>
</div>
`
  return html
}

function renderResultsItemHtml(results) {
  // modified from https://github.com/brunocechet/Fuse.js-with-highlight
  var highlighter = function(resultItem){
    resultItem.matches.forEach((matchItem) => {
      var text = resultItem.item[matchItem.key];
      var result = []
      var matches = [].concat(matchItem.indices);
      var pair = matches.shift()
      
      for (var i = 0; i < text.length; i++) {
        var char = text.charAt(i)
        if (pair && i == pair[0]) {
          result.push('<span style="color: red;">')
        }
        result.push(char)
        if (pair && i == pair[1]) {
          result.push('</span>')
          pair = matches.shift()
        }
      }
      resultItem.highlight = result.join('');
  
      if(resultItem.children && resultItem.children.length > 0){
        resultItem.children.forEach((child) => {
          highlighter(child);
        });
      }
    });
  };  

  let html = ``
  results.forEach(result => {
    highlighter(result)
    // truncated highlight content
    let truncated = result.highlight.substring(0, 2000)
    const reg = /(<span style="color: red;">[a-zA-Z0-9\u4e00-\u9fa5]+<\/span>)/g
    let array = truncated.split(reg)
    // drop unstable part
    array.pop()
    let content = ""
    if (array.length > 0) {
      content = array.join('')
    } else {
      // fallback to no highlighted truncated content
      content = result.item.content.substring(0, 2000)
    }
    html += `
<li class="search-result-item">
  <div class="search-result-header">
    <h3>
      <a href="${result.item.permalink}">${result.item.title}</a>
    </h3>
  </div>
  <div class="search-result-content">
    ${content} ...
  </div>
</li>
`
  })
  return html
}