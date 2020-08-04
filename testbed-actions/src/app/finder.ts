/**
 * Finds all elements that contains the text.
 * @param element The parent element to start the search.
 * @param text The text to find.
 * @returns The list of elements that contains the text.
 */
const _find = function(element: Element, text: string): Element[] {
  let nodes: Node[] = [];
  let elements: Element[] = [];
  _findHelper(element, text, nodes);
  for (const node of nodes) {
    elements.push(node.parentElement)
  }
  return elements;
};

/**
 * Helps recursively find the element and adds it to the list of found elements.
 * @param nodeOrElement The current node or element to recusively find the text.
 * @param text The text to find.
 * @param found The list of found elements.
 */
const _findHelper = function(nodeOrElement: Node|Element, text: string,
    found: Node[]) {
  if (!nodeOrElement) {
    return
  }
  // If the element contains the text, and the element to the found list and
  // remove the parent.
  if (nodeOrElement.textContent &&
      nodeOrElement.textContent.includes(text)) {
    if (nodeOrElement.nodeName == '#text') {
      found.push(nodeOrElement);
    }
    nodeOrElement.childNodes.forEach(childNode => {
      _findHelper(childNode, text, found);
    });
    if (nodeOrElement.nodeName == '#text' &&
        found.indexOf(nodeOrElement.parentNode) != -1) {
      found.splice(found.indexOf(nodeOrElement.parentNode), 1);
    }
  }
  // If it is an input element and the input value contains the text, add the
  // element to the found list and remove the parent.
  else if (nodeOrElement instanceof Element &&
      nodeOrElement.tagName === 'INPUT' &&
      (nodeOrElement as HTMLInputElement).value.includes(text)) {
    found.push(nodeOrElement);
    nodeOrElement.childNodes.forEach(childNode => {
      _findHelper(childNode, text, found);
    });
    found.splice(found.indexOf(nodeOrElement.parentNode), 1);
  }
};

enum Direction {
  LEFT, RIGHT, ABOVE, BELOW
};

/**
 * Finds all elements that contain the text relative to text.
 * @param element The element's boundaries are used to help find elements based
 *   on the input direction.
 * @param searchElement The search element is the top element to find the text.
 *   If this is null, it will default to the html body tag.
 * @param text The text to find.
 * @param direction The direction from the parent element.
 * @returns The list of elements that clear the element's boundaries based on
 *   the direction.
 */
const _relativeFind = function(element: Element, searchElement: Element,
    text: string, direction: Direction): Element[] {
  if (element) {
    return null;
  }
  const rect = element.getClientRects();
  if (!searchElement) {
    searchElement = document.querySelector('body');
  }
  const elementsWithText = _find(searchElement, text);
  const found = [];
  for (const elementWithText of elementsWithText) {
    const rectWithText = elementWithText.getClientRects();
    switch(direction) {
      case Direction.LEFT:
        if (rectWithText[0].right <= rect[0].left) {
          found.push(elementWithText);
        }
        break;
      case Direction.RIGHT:
        if (rect[0].right <= rectWithText[0].left) {
          found.push(elementWithText);
        }
        break;
      case Direction.BELOW:
        if (rectWithText[0].top <= rect[0].bottom) {
          found.push(elementWithText);
        }
        break;
      case Direction.ABOVE:
        if (rect[0].top <= rectWithText[0].bottom) {
          found.push(elementWithText);
        }
        break;
    }
  }
  return found;
}

export class Find {
  _elements =  [];

  /**
   * 
   * @param _element When set, it is the parent scope to find elements or
   *   relative elements. When this is not set, it will default to the body tag.
   */
  constructor(private _element: Element = null) {
    if (!this._element) {
      this._element = document.querySelector('body');
    }
  }

  see(text: string) {
    this._elements = _find(this._element, text);
  }

  leftOf(text: string) {
    this._elements = _relativeFind(this._elements[0], this._element, text,
      Direction.LEFT);
  }
}