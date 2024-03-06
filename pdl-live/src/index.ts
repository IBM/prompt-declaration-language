function component() {
  const element = document.createElement('div');

  element.innerHTML = 'Hello';

  return element;
}

document.body.appendChild(component());
