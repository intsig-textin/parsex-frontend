export function copy(text: string) {
  const doc = document;
  const { body } = doc;
  const node = doc.createElement('textarea');
  const { style } = node;
  let ret;

  style.position = 'fixed';
  style.top = `${window.innerHeight / 2}px`;
  style.left = '101%';

  body.appendChild(node);

  node.value = text;
  node.focus();
  node.selectionStart = 0;
  node.selectionEnd = node.value.length;

  ret = doc.execCommand('copy');
  setTimeout(function () {
    body.removeChild(node);
  });

  return ret;
}
