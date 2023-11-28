import { getLibs } from '../../scripts/utils.js';

function focusOnInput(media) {
  const input = media.querySelector('.prompt-text');
  input?.focus();
  input?.classList.add('blinking-cursor');
  if (input.classList.contains('light')) input?.classList.add('blink-light');
  input?.addEventListener('focusout', () => { input.classList.remove('blinking-cursor'); input.classList.remove('blink-light'); });
}

function eventOnGenerate(generateButton, media) {
  const btnConfigs = {
    TextToImage: ['SubmitTextToImage', 'SubmitTextToImageUserContent', 'goToFirefly'],
    TextEffects: ['SubmitTextEffects', 'SubmitTextEffectsUserContent', 'goToFireflyEffects'],
  };
  generateButton.addEventListener('click', async (e) => {
    const userprompt = media.querySelector('.prompt-text')?.value;
    const placeholderprompt = media.querySelector('.prompt-text')?.getAttribute('placeholder');
    const prompt = userprompt || placeholderprompt;
    const selected = media.querySelector('.selected');
    if (Object.keys(btnConfigs).includes(selected.id)) {
      const btnConfig = btnConfigs[selected.id];
      const dall = userprompt === '' ? btnConfig[0] : btnConfig[1];
      e.target.setAttribute('daa-ll', dall);
      const { signIn } = await import('./firefly-susi.js');
      signIn(prompt, btnConfig[2]);
    }
  });
}

async function createGenFillPrompt(element) {
  const { createTag } = await import(`${getLibs()}/utils/utils.js`);
  const genfillPrompt = createTag('div', { class: 'genfill-prompt' });
  const promptConfig = element?.innerText?.split('|')[0].split('[');
  const prompt = createTag('p', '', `${promptConfig[0]}`);
  const promptText = createTag('p', { class: 'genfill-promptused' }, `${promptConfig[1].replaceAll(']', '').trim()}`);
  genfillPrompt.append(prompt, promptText);
  return genfillPrompt;
}

function hideRemoveElements(option, media, mediaP) {
  media.querySelector('#promptbar')?.remove();
  media.querySelector('.genfill-prompt')?.remove();
  const selector = media.querySelector('.firefly-selectortray');
  let i = 0;
  [...selector.childNodes].forEach((el) => {
    if (el.id === option.id) {
      el.querySelector('img').classList.add('svgselected');
      el.classList.add('selected');
      mediaP[i].classList.remove('hide');
    } else {
      el.classList.remove('selected');
      el.querySelector('img').classList.remove('svgselected');
      mediaP[i].classList.add('hide');
    }
    i += 1;
  });
}

async function eventOnSelectorOption(selOption, promptDetail, allP, media, mediaP, createPromptField) {
  hideRemoveElements(selOption, media, mediaP);
  const promptText = allP[promptDetail.promptpos].innerText.split('|');
  if (selOption.id === 'GenerativeFill') {
    const genfilprompt = await createPromptField(`${promptText[0]}`, `${promptText[1]}`, promptDetail.promptmode, 'SubmitGenerativeFill');
    media.appendChild(genfilprompt);
    genfilprompt.classList.add('genfill-promptbar');
    const genFillButton = media.querySelector('#genfill');
    genFillButton.addEventListener('click', async () => {
      const { signIn } = await import('./firefly-susi.js');
      signIn('', 'goToFireflyGenFill');
    });
  } else {
    const prompt = await createPromptField(`${promptText[0]}`, `${promptText[1]}`, promptDetail.promptmode);
    media.appendChild(prompt);
    prompt.classList.add('firefly-prompt');
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton, media);
    focusOnInput(media);
  }
}

export default async function setInteractiveFirefly(el) {
  const buttons = el.querySelectorAll('.con-button');
  [...buttons].forEach((button) => { if (button.innerText.includes('Firefly')) button.setAttribute('daa-ll', 'getfirefly'); });
  const media = el.querySelector('.media');
  const allP = media.querySelectorAll('p:not(:empty)');
  const allAnchorTag = media.querySelectorAll('a');
  [...allP].forEach((s) => { if (!s.querySelector('picture') && !s.querySelector('video')) s.remove(); });
  const mediaP = media.querySelectorAll('p:not(:empty');
  const enticementMode = allP[0].innerText.split('(')[1]?.replaceAll(')', '');
  const selectorTrayMode = allP[3].innerText.split('(')[1]?.replaceAll(')', '');

  const { createSelectorTray, createEnticement, createPromptField } = await import('../interactive-elements/interactive-elements.js');
  // Set Enticement
  const enticementText = allAnchorTag[0].textContent.trim();
  const enticementIcon = allAnchorTag[0].href;
  const enticementDiv = await createEnticement(`${enticementText}|${enticementIcon}`, enticementMode);
  media.appendChild(enticementDiv, media.firstChild);

  // Set InteractiveSelection
  const selections = [];
  let j = 5;
  let k = 1;
  for (let i = 4; i <= allP.length - 3; i += 6) {
    const optionPromptMode = allP[j].innerText.split('(')[1]?.replaceAll(')', '');
    const selectorValues = allP[i].innerText.split('|');
    const option = {
      id: `${selectorValues[0]}`,
      text: `${allAnchorTag[k].textContent.trim()}`,
      svg: `${allAnchorTag[k].href}`,
      analytics: `Select${selectorValues[0]}`,
      promptmode: `${optionPromptMode}`,
      promptpos: i + 2,
    };
    j += 6;
    k += 1;
    selections.push(option);
  }
  const textToImageDetail = {};
  const genFillDetail = {};
  const textEffectDetail = {};
  selections.forEach((item) => {
    if (item.id === 'TextToImage') {
      textToImageDetail.promptmode = item.promptmode;
      textToImageDetail.promptpos = item.promptpos;
    } else if (item.id === 'GenerativeFill') {
      genFillDetail.promptmode = item.promptmode;
      genFillDetail.promptpos = item.promptpos;
    } else if (item.id === 'TextEffects') {
      textEffectDetail.promptmode = item.promptmode;
      textEffectDetail.promptpos = item.promptpos;
    }
  });

  const fireflyOptions = await createSelectorTray(selections, selectorTrayMode);
  fireflyOptions.classList.add('firefly-selectortray');
  media.append(fireflyOptions);

  const ttiOption = media.querySelector('#TextToImage');
  const genFillOption = media.querySelector('#GenerativeFill');
  const teOption = media.querySelector('#TextEffects');
  const firstOption = media.querySelector('.selector-tray > button');

  hideRemoveElements(firstOption, media, mediaP);

  const genfillPrompt = await createGenFillPrompt(allP[genFillDetail.promptpos]);

  // Create prompt field for first option on page load
  let fireflyPrompt = '';
  const firstOptionDetail = allP[6].innerText.split('|');
  const firstOptionPromptMode = allP[5].innerText.split('(')[1]?.replaceAll(')', '');
  fireflyPrompt = await createPromptField(`${firstOptionDetail[0]}`, `${firstOptionDetail[1]}`, firstOptionPromptMode);
  if (firstOption.getAttribute('id') === 'TextToImage' || firstOption.getAttribute('id') === 'TextEffects') {
    fireflyPrompt.classList.add('firefly-prompt');
    media.appendChild(fireflyPrompt);
    const generateButton = media.querySelector('#promptbutton');
    eventOnGenerate(generateButton, media);
  } else if (firstOption.getAttribute('id') === 'GenerativeFill') {
    fireflyPrompt.classList.add('genfill-promptbar');
    media.append(genfillPrompt, fireflyPrompt);
    const genFillButton = media.querySelector('#genfill');
    genFillButton.addEventListener('click', async () => {
      const { signIn } = await import('./firefly-susi.js');
      signIn('', 'goToFireflyGenFill');
    });
  }

  focusOnInput(media);
  /* Handle action on click of each firefly option button */

  ttiOption.addEventListener('click', () => {
    eventOnSelectorOption(ttiOption, textToImageDetail, allP, media, mediaP, createPromptField);
  });

  genFillOption.addEventListener('click', () => {
    eventOnSelectorOption(genFillOption, genFillDetail, allP, media, mediaP, createPromptField);
    media.appendChild(genfillPrompt);
  });

  teOption.addEventListener('click', () => {
    eventOnSelectorOption(teOption, textEffectDetail, allP, media, mediaP, createPromptField);
  });
}
