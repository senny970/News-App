// Custom Http Module
function customHttp() {
    return {
        get(url, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                xhr.send();
            } catch (error) {
                cb(error);
            }
        },
        post(url, body, headers, cb) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', url);
                xhr.addEventListener('load', () => {
                    if (Math.floor(xhr.status / 100) !== 2) {
                        cb(`Error. Status code: ${xhr.status}`, xhr);
                        return;
                    }
                    const response = JSON.parse(xhr.responseText);
                    cb(null, response);
                });

                xhr.addEventListener('error', () => {
                    cb(`Error. Status code: ${xhr.status}`, xhr);
                });

                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }

                xhr.send(JSON.stringify(body));
            } catch (error) {
                cb(error);
            }
        },
    };
}

// Init http module
const http = customHttp();

//Elements
const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const searchInput = form.elements['search'];
const submitBtnText = document.getElementById('submitBtnText');
const submitBtnSpinner = document.getElementById('submitBtnSpinner');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    loadNews();
})

const newsService = (function () {
    //https://newsapi.org/sources
    const apiKey = 'f8a92a36ea064c52ae43f8f6f654ec1d';
    // const apiUrl = 'https://news-api-v2.herokuapp.com';
    const apiUrl = 'https://newsapi.org/v2';

    return {
        topHeadlines(country = 'ua', cb) {
            http.get(`${apiUrl}/top-headlines?country=${country}&category=technology&apiKey=${apiKey}`, cb);
        },
        everything(query, cb) {
            http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
        }
    };
})();

//  init selects
document.addEventListener('DOMContentLoaded', function () {
    loadNews();
});

//Load news
function loadNews() {
    showPreloader();

    const country = countrySelect.value;
    const searchText = searchInput.value;

    if (!searchText) {
        newsService.topHeadlines(country, onGetResponse);
    } else {
        newsService.everything(searchText, onGetResponse);
    }
}

//On get response from server
function onGetResponse(err, res) {
    removePreloader();

    if (err) {
        console.error(err);
        showAlert(err, 'error-msg');
        return;
    }

    if (!res.articles.length) {
        showAlert('News not found!', 'error-msg');
        return;
    }

    renderNews(res.articles)
}

//Render news
function renderNews(news) {
    const newsContainer = document.querySelector('.news-container .row');

    if (newsContainer.children.length) {
        clearContainer(newsContainer);
    }

    let fragment = '';
    news.forEach(newsItem => {
        const element = newsTemplate(newsItem);
        fragment += element;
    });

    newsContainer.insertAdjacentHTML('afterbegin', fragment);
}

//News item template
function newsTemplate({urlToImage, title, url, description}) {
    return `
        <div class="col col-lg-3 col-bottom-buffer">
            <div class="card news-card">
                <img src="${urlToImage}" class="card-img-top news-card-img" alt="preview">
                <div class="card-body news-card-body">
                    <h5 class="card-title news-card-title">${title}</h5>
                    <p class="card-text news-card-text">${description}</p>
                    <a href="${url}" class="btn btn-primary news-card-link" target="_blank">More details</a>
                </div>
            </div>
        </div>
    `
}

//Message
function showAlert(msg, type = 'success') {
    M.toast({html: msg, classes: type});
}

//Clear container
function clearContainer(container) {
    //container.innerHTML = '';
    let child = container.lastElementChild;

    while (child) {
        container.removeChild(child);
        child = container.lastElementChild;
    }
}

//Preloader
function showPreloader() {
    submitBtnText.textContent = 'Loading...';
    submitBtnSpinner.style.display = 'inline-block';
}

//Remove Preloader
function removePreloader() {
    submitBtnText.textContent = 'Submit';
    submitBtnSpinner.style.display = 'none';
}