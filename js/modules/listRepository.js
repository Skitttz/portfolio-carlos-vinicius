import { marked } from 'marked';
import * as DOMPurify from 'dompurify';

export default class RepositoryGit {
  constructor(bodyRepository) {
    this.bodyRepository = document.querySelectorAll(bodyRepository);
    this.slideContainer = document.querySelector('.slide');
  }

  renderizeCodeTag() {
    var codeElements = document.querySelectorAll('code');
    codeElements.forEach(function (codeElement) {
      var liElement = codeElement.parentElement;
      liElement.classList.add('liDoCode');
    });
  }

  transformArchorToVideo(src) {
    var linkElement = document.querySelector(`a[href="${src}"]`);
    if (linkElement) {
      var videoURL = linkElement.href;
      var videoElement = document.createElement('video');
      videoElement.src = videoURL;
      videoElement.controls = true;
      videoElement.width = 360;
      videoElement.height = 270;
      linkElement.parentNode.replaceChild(videoElement, linkElement);
    } else {
      console.error('Elemento <a> não encontrado.');
    }
  }

  allLinksBlank(tagName) {
    let links = document.querySelectorAll(tagName);
    links.forEach((link) => {
      if (link.href) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    });
  }

  async getDataUserGit(username) {
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      const data = await response.json();
      const numRepos = data.public_repos;
      return numRepos;
    } catch (error) {
      console.error(error);
    }
  }

  async createElements(username) {
    try {
      const response = await fetch(
        `https://pinned.berrysauce.me/get/${username}`,
      );
      const data = await response.json();
      for (let index = 0; index < data.length; index++) {
        //Criar Li
        var listItem = document.createElement('li');
        listItem.className = 'content-body-repository';
        //Criar Div
        var divElement = document.createElement('div');
        divElement.className = 'body-repository';

        //Colocar div dentro do Li
        listItem.appendChild(divElement);

        //Colocar Li dentro do UL slide
        this.slideContainer.appendChild(listItem);
      }
    } catch (error) {
      console.error('[Error Criar Elementos do Slide]:', error);
    } finally {
      this.bodyRepository = document.querySelectorAll('.body-repository');
    }
  }

  async getDataPinnedRepository(username) {
    try {
      const response = await fetch(
        `https://pinned.berrysauce.me/get/${username}`,
      );
      const data = await response.json();

      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        if (item.name && username) {
          await this.getDataReadmeRepository(
            username,
            item.name,
            'main',
            index,
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getDataReadmeRepository(owner, repo, branch, index) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
      );
      const data = await response.text();
      const sanitizedData = DOMPurify.sanitize(marked.parse(data));
      if (this.bodyRepository[index]) {
        this.bodyRepository[index].innerHTML = sanitizedData;
        return sanitizedData;
      }
      return console.error('Elemento não encontrado para o índice:', index);
    } catch (error) {
      console.error(
        '[Catch] problema no índice:',
        index,
        '[Api Error]:',
        error,
      );
    }
  }

  searchLiGuide() {
    var olELement = document.querySelector('ol');
    if (olELement) {
      var liElements = olELement.querySelectorAll('li');

      for (var i = 0; i < liElements.length; i++) {
        var liElement = liElements[i];

        // Verifique se este <li> contém um elemento <ul>
        var pElement = liElement.querySelector('p');

        // Se este <li> contém um <ul>, verifique se contém um <a> dentro do <ul>
        var ulElement = liElement.querySelector('ul');

        if (pElement && ulElement) {
          var li2ndElement = ulElement.querySelector('li');
          pElement.classList.add('stepStepP');
          ulElement.classList.add('stepStepUL');
          li2ndElement.classList.add('stepStepLI');
        }
      }
    }
  }

  async init() {
    const username = 'skitttz';
    if (username) {
      await Promise.allSettled([
        this.getDataPinnedRepository(username),
        this.createElements(username),
      ]);
      this.searchLiGuide();
      this.renderizeCodeTag();
      this.transformArchorToVideo(
        'https://github.com/Skitttz/Cats/assets/94083688/bcd0c656-1773-4e9c-9add-68d0176c3b36',
      );
      this.allLinksBlank('a');
    }
  }
}
