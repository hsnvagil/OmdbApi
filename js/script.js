const apiKey = `cf2c918c`;
const requestUrl = `http://www.omdbapi.com/?apikey=${apiKey}`;
const paginationInfo = {
    totalResults: 0,
    resultPerPage: 10,
    currentPage: 1
};
const visiblePages = 6;
let movieName;
let movieType;

document.getElementById("search-name").addEventListener("keypress", function (event) {
    if (event.which === 13) {
        event.preventDefault();
        document.getElementById("search-button").click();
    }
});

function searchButtonClick() {
    movieName = document.getElementById("search-name").value;
    movieType = document.getElementById("movie-type").value;
    document.getElementById("movie-details").style.display = "none";
    paginationInfo.currentPage = 1;
    searchMovies();
}

function searchMovies() {
    const url = `${requestUrl}&s=${movieName}&type=${movieType}&page=${paginationInfo.currentPage}`;
    sendRequest(url).then((response) => {
        document.getElementById("error-message").style.display = "none";
        const movies = JSON.parse(response);
        paginationInfo.totalResults = (+movies.totalResults);
        makePaging(paginationInfo.totalResults, paginationInfo.resultPerPage, paginationInfo.currentPage, visiblePages);
        showMovies(movies);
    }).catch((reject) => {
        document.getElementById("error-message").innerHTML = reject;
        document.getElementById("error-message").style.display = "block";
        document.getElementById("result-box").style.display = "none";
        document.getElementById("movie-details").style.display = "none";
        document.getElementById("pagination").style.display = "none";
    });
}


async function sendRequest(url) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        xhr.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    reject(new Error(this.status));
                }
            }
        };

        xhr.onerror = () => {
            reject(new Error("network error occured"));
        }

        xhr.send();
    });
}

function showMovies(movies) {
    let html = ""
    for (const movie of movies.Search) {
        if (movie.Poster === "N/A") {
            html += `<li>
                    <img style="" src="img/No_image_available.png"><div><a>${movie.Type}</a>
                    <h4>${movie.Title}</h4><a>${movie.Year}</a><button id="details-btn">Details</button></div>
                </li>`;
        } else {
            html += `<li>
                    <img src=${movie.Poster}><div><a>${movie.Type}</a>
                    <h4>${movie.Title}</h4><a>${movie.Year}</a><button id="details-btn">Details</button></div>
                </li>`;
        }
    }

    document.getElementById("result-box").innerHTML = html;
    const items = document.getElementById("result-box").querySelectorAll("li button");
    for (let i = 0; i < movies.Search.length; i++) {
        items[i].addEventListener("click", () => {
            getMovieInfo(movies.Search[i].imdbID);
        });
    }
    document.getElementById("result-box").style.display = "flex";
}

function getMovieInfo(imdbID) {
    const url = `${requestUrl}&i=${imdbID}`;
    sendRequest(url).then((response) => {
        let data = JSON.parse(response);
        const infoObj = {
            "title": data.Title,
            "released": data.Released,
            "genre": data.Genre,
            "country": data.Country,
            "director": data.Director,
            "writer": data.Writer,
            "actors": data.Actors,
            "awards": data.Awards,
            "poster": data.Poster
        };
        showMovieInfo(infoObj);
    });

}

function showMovieInfo(infoObj) {
    document.getElementById("movie-details").style.display = "flex";
    document.getElementById("movie-details-img").src = infoObj.poster !== "N/A" ? infoObj.poster : "img/No_image_available.png";
    document.getElementById("movie-details-table").innerHTML = `<tr><th style="width: 150px"></th><th></th></tr>
                <tr><td class="t"><b>Title</b></td><td><a>${infoObj.title}</a></td></tr>
                <tr><td class="t"><b>Released</b></td><td><a>${infoObj.released}</a></td></tr>
                <tr><td class="t"><b>Genre</b></td><td><a>${infoObj.genre}</a></td></tr>
                <tr><td class="t"><b>Country</b></td><td><a>${infoObj.country}</a></td></tr>
                <tr><td class="t"><b>Director</b></td><td><a>${infoObj.director}</a></td></tr>
                <tr><td class="t"><b>Writer</b></td><td><a>${infoObj.writer}</a></td></tr>
                <tr><td class="t"><b>Actors</b></td><td><a>${infoObj.actors}</a></td></tr>
                <tr><td class="t"><b>Awards</b></td><td><a>${infoObj.awards}</a></td></tr>`;
    document.getElementById("movie-details").scrollIntoView();
}


function makePaging(totalResults, resultPerPage, currentPage) {
    const totalPages = Math.ceil(totalResults / resultPerPage);
    const pageObj = getPages(currentPage, totalPages);
    document.getElementById("pagination").style.display = "inline-block";
    document.getElementById('numberList').innerHTML = '';
    for (let i = 0; i < pageObj.pages.length; i++) {
        const e = document.createElement('a');
        e.innerHTML = pageObj.pages[i];
        if (currentPage === pageObj.pages[i]) {
            e.classList.add("active");
        }
        e.onclick = function (event) {
            paginationInfo.currentPage = parseInt(event.target.innerText);
            searchMovies();
        }
        document.getElementById('numberList').appendChild(e);
    }
    document.getElementById("result-box").scrollIntoView();
}

function goToPage(val) {
    const totalResult = Math.ceil(paginationInfo.totalResults / paginationInfo.resultPerPage);
    let currPage = 1;
    switch (val) {
        case 'previous':
            currPage = ((paginationInfo.currentPage - 1) < 1) ? 1 : paginationInfo.currentPage - 1;
            break;
        case 'next':
            currPage = (paginationInfo.currentPage + 1) >= totalResult ? totalResult : paginationInfo.currentPage + 1;
            break;
    }
    paginationInfo.currentPage = currPage;
    searchMovies();
}

function getPages(currentPage, totalPages) {
    const half = Math.floor(visiblePages / 2);
    let start = currentPage - half + 1 - visiblePages % 2;
    let end = currentPage + half;

    if (start <= 0) {
        start = 1;
        end = visiblePages;
    }
    if (end > totalPages) {
        start = (totalPages - visiblePages + 1) > 1 ? (totalPages - visiblePages + 1) : 1;
        end = totalPages;
    }

    let itPage = start;

    const pages = [];
    while (itPage <= end) {
        pages.push(itPage);
        itPage++;
    }

    return {
        "currentPage": currentPage,
        "pages": pages
    };
}

function prevClick() {
    goToPage('previous');
}

function nextClick() {
    goToPage('next');
}

























