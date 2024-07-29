let isLoading = false;
let isEndOfResults = false;

const makeRequest = (url, successCallback) => {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      return response.json();
    })
    .then(successCallback)
    .catch((error) => console.error(error));
};

const displayData = (elementId, data) => {
  document.getElementById(elementId).innerHTML = data;
  lazyLoadImagesAndVideos();
};

const appendData = (elementId, data) => {
  document.getElementById(elementId).insertAdjacentHTML("beforeend", data);
};

const lazyLoadImagesAndVideos = () => {
  const elements = document.querySelectorAll("[data-src]");
  elements.forEach((element) => {
    if (isElementInViewport(element)) {
      element.src = element.getAttribute("data-src");
      element.removeAttribute("data-src");
    }
  });
};

const isElementInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

const getPosts = () => {
  if (isLoading || isEndOfResults) return;

  isLoading = true;
  const randomPage = Math.floor(Math.random() * 5000) + 1;
  const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&limit=10&json=1&pid=${randomPage}`;

  makeRequest(url, (posts) => {
    if (posts.length === 0) {
      isEndOfResults = true;
      appendData("posts", "<p class='infinite-scroll-error'>No more posts available.</p>");
      return;
    }

    const html = posts.map(post => {
      const mediaElement = post.file_url.endsWith(".mp4") ?
        `<video controls width='100%' height='auto' data-src='${post.file_url}' poster='${post.preview_url}' alt='Post Video'>
          <source src='${post.file_url}' type='video/mp4'>
          Your browser does not support the video tag.
         </video>` :
        `<img data-src='${post.file_url}' alt='Post Image'>`;

      return `<div class='post'>
        <div class='post-image'>
          <a href='${post.file_url}' target='_blank'>
            ${mediaElement}
          </a>
          <a class='btn-download' href='${post.file_url}' download>Download</a>
        </div>
        <div class='post-info'>
          <strong>Post ID:</strong> ${post.id}<br>
        </div>
      </div>`;
    }).join("");

    appendData("posts", html);
    isLoading = false;
    lazyLoadImagesAndVideos();
  });
};

const handleScroll = () => {
  if (document.documentElement.scrollHeight - (window.innerHeight + window.scrollY) < 4000) {
    getPosts();
  }
};

window.addEventListener("scroll", handleScroll);
window.addEventListener("DOMContentLoaded", () => {
  lazyLoadImagesAndVideos();
  getPosts();
});
