import * as ReactDOMClient from 'react-dom/client';
import EntityList from './components/EntityList';
import EntityForm from './components/EntityForm';

class MicrofrontendListElement extends HTMLElement {
  private root: ReactDOMClient.Root | null = null;

  connectedCallback() {
    this.root = ReactDOMClient.createRoot(this);
    this.root.render(<EntityList />);
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

class MicrofrontendFormElement extends HTMLElement {
  private root: ReactDOMClient.Root | null = null;

  connectedCallback() {
    this.root = ReactDOMClient.createRoot(this);
    this.root.render(<EntityForm />);
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

if (!customElements.get('mfe-entity-list')) {
  customElements.define('mfe-entity-list', MicrofrontendListElement);
}

if (!customElements.get('mfe-entity-form')) {
  customElements.define('mfe-entity-form', MicrofrontendFormElement);
}
