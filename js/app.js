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
        showAlert(err, 'alert-danger');
        return;
    }

    if (!res.articles.length) {
        showAlert('News not found!', 'alert-warning');
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
                <img src="${urlToImage || 'https://via.placeholder.com/350x250'}" class="card-img-top news-card-img" alt="preview">
                <div class="card-body news-card-body">
                    <h5 class="card-title news-card-title">${title || 'Title'}</h5>
                    <p class="card-text news-card-text">${description || 'Description'}</p>
                    <a href="${url || '#'}" class="btn btn-primary news-card-link" target="_blank">More details</a>
                </div>
            </div>
        </div>
    `
}

//Message
function showAlert(msg, type = 'alert-danger', title = '') {
    document.body.innerHTML += `
        <div class="alert ${type} alert-dismissible fade show" role="alert" style="position: fixed; left: 84.8%; top: 70px">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">\n' +
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>\n' +
            </svg>
            <strong>${title}</strong> ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        `;
return 0;
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