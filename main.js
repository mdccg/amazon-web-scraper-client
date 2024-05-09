const form = document.getElementById('search');
const input = document.querySelector('input');
const button = document.querySelector('button');
const errorContainer = document.getElementById('error');
const resultsContainer = document.getElementById('results');
const resultsDetailsContainer = document.getElementById('results-details');

const startLoading = () => {
  input.disabled = true;
  button.disabled = true;
  button.innerHTML = `
    <img src="./assets/icons/loading.svg" alt="Carregando..." />
  `;
  resultsContainer.innerHTML = '';
  resultsDetailsContainer.innerHTML = '';
}

const stopLoading = () => {
  input.disabled = false;
  button.disabled = false;
  button.innerHTML = `
    <i class="fa-solid fa-magnifying-glass"></i>
  `;
}

const displayDetails = (total, search, isFake) => {
  if (total === 0) {
    resultsDetailsContainer.innerHTML = `
      <div class="failure-panel">
        <img src="./assets/images/no-results.png" alt="Imagem de uma pasta com um X vermelho, lupa, cone de trânsito e símbolos matemáticos, representando um erro ou exclusão de arquivo e busca por solução." />
        <span>
          Nenhum resultado para "${search}"
          <br />
          foi encontrado
        </span>
      </div>
    `;

  } else {
    resultsDetailsContainer.innerHTML = `
      <h2>Resultados</h2>
      <span>Foram encontrados ${isFake ? 'fictícios' : ''} ${total} resultados para "${search}".</span>
    `;
  }
}

const displayError = (errorMessage) => {
  errorContainer.innerHTML = `
    <div class="failure-panel" id="server-error"> 
      <img src="./assets/images/server-error.png" alt="Imagem de uma pessoa vestindo uma blusa laranja, com o cabelo preso em um coque, olhando para a tela de um laptop com uma expressão preocupada." />
      <span>${errorMessage}</span>
      <div id="retry-button-area">
        <div class="retry-button-loading-area"></div>
        <button id="retry-button">Tentar novamente</button>
        <div class="retry-button-loading-area">
          <img id="retry-button-loading" src="./assets/icons/loading.svg" alt="Carregando..." />
        </div>
      </div>
    </div>
  `;

  const retryButton = document.getElementById('retry-button');
  const retryButtonLoading = document.getElementById('retry-button-loading');

  input.addEventListener('keyup', (event) => {
    retryButton.disabled = !Boolean(event.target.value.trim());
  });

  retryButton.addEventListener('click', () => {
    retryButton.disabled = true;
    retryButtonLoading.style.visibility = 'visible';
    button.click();
  });
}

const addProduct = ({ title, imageURL, rating, numberOfReviews }) => {
  let hasFractionalPart;
  let regularStars;
  let solidStars;
  
  if (rating) {
    const integer = Math.trunc(rating);

    hasFractionalPart = rating - integer !== 0;
    regularStars = 5 - integer;
    solidStars = integer - (hasFractionalPart ? 1 : 0);
  }

  const shortTitle = title.length >= 64 ? title.slice(0, 64) + '...' : title;

  const htmlContent = `
    <li>
      <img src="${imageURL}" alt="Imagem de ${title}" />
      <div class="product-details">
        <div>
          <span class="title" title="${title}">${shortTitle}</span>
        </div>
        <div class="reviews-details">
          ${rating ? `
            <div class="stars">
              ${Array(solidStars).fill(null).map(() => '<i class="fa-solid fa-star"></i>').join('')}${hasFractionalPart ? '<i class="fa-solid fa-star-half-stroke"></i>' : ''}${Array(regularStars).fill(null).map(() => '<i class="fa-regular fa-star"></i>').join('')}
            </div>
            <span>${rating.toLocaleString('pt-BR')}</span>
          ` : ''}
        </div>
        ${!rating ? '<small>Avaliação por estrelas não disponível</small><br />' : ''}
        ${numberOfReviews ? `<span>${numberOfReviews.toLocaleString('pt-BR')} avaliações</span>` : '<small>Número de avaliações não disponível</small>'}
      </div>
    </li>
  `;

  resultsContainer.innerHTML += htmlContent;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const search = form.search.value;

  if (!search.trim()) {
    return;
  }

  startLoading();

  fetch(`http://localhost:3001/api/scrape?keyword=${search}`)
    .then((res) => res.json())
    .then((res) => {
      if (res.error) {
        displayError(res.error);
        button.focus();

      } else {
        errorContainer.innerHTML = '';

        const { products, total, isFake } = res;

        products.forEach((product) => addProduct(product));
        displayDetails(total, search, isFake);
      }
    })
    .finally(stopLoading);
});