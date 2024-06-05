import { LitElement, css, html } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';

import '@shoelace-style/shoelace/dist/components/textarea/textarea.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';

import { fluentButton, fluentTextArea, provideFluentDesignSystem } from '@fluentui/web-components';

provideFluentDesignSystem().register(fluentButton(), fluentTextArea());

import { styles } from '../styles/shared-styles';

@customElement('app-home')
export class AppHome extends LitElement {

  // For more information on using properties and state in lit
  // check out this link https://lit.dev/docs/components/properties/
  @property() message = 'Welcome!';

  @state() transcribedText: string = '';
  @state() transcribing: boolean = false;
  @state() currentFileData: any = null;

  @state() copied: boolean = false;

  @state() currentText: string = '';
  @state() questionText: string = '';

  static styles = [
    styles,
    css`
      main {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      #main-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 16px;
      }

      fluent-button svg {
        width: 11px;
        height: 11px;
      }

      fluent-text-area {
        width: 100%;
        height: 100%;
      }

      fluent-text-area::part(control) {
        height: 50vh;
        border: none;
        border-radius: 8px;
        overflow-y: hidden;
      }

      #actions-menu {
        display: flex;
        gap: 8px;
        flex-direction: row;
        justify-content: space-between;
      }

      #main-action-block {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      #file-data-block {
        display: flex;
        gap: 4px;
      }

      #file-size {
        color: grey;
        font-size: 10px;
      }

      #file-name {
        color: grey;
        font-size: 12px;
        font-weight: bold;

        max-width: 169px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow-x: hidden;
      }

      #file-data-block {
        display: flex;
        flex-direction: column;
      }

      @media(prefers-color-scheme: dark) {
        fluent-text-area::part(control) {
            background: #ffffff0f;
            color: white;
        }

        fluent-button.neutral::part(control) {
          background: #ffffff14;
          color: white;
        }
      }

      @media(max-width: 640px) {
        main {
          display: flex;
          flex-direction: column-reverse;
          gap: 10px;
        }
      }
  `];

  async firstUpdated() {
    const { loadAnswerer } = await import('../services/whisper');
    await loadAnswerer();
  }

  async loadDocument() {
    const pickerOpts = {
      types: [
        {
          accept: {
            "text/*": [".txt"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    };
    // Open file picker and destructure the result the first handle
    // @ts-ignore
    const [fileHandle] = await window.showOpenFilePicker(pickerOpts);

    // get file contents
    const fileData = await fileHandle.getFile();

    const text = await fileData.text();
    this.currentFileData = fileData;
    console.log("text", text);

    this.currentText = text;
  }

  setQuestionText(e: any) {
    this.questionText = e.target.value;
  }

  async doGetAnswer() {
    const { getAnswer } = await import('../services/whisper');
    const answer = await getAnswer(this.questionText, this.currentText);
    console.log("answer", answer);
  }

  render() {
    return html`
      <app-header></app-header>

      <main>

        <section id="actions-menu">
          <div id="main-action-block">
            <fluent-button @click="${this.loadDocument}">Load Document</fluent-button>
            <fluent-button @click="${() => this.doGetAnswer()}" ?disabled="${this.currentText.length === 0}">Get Answer</fluent-button>
          </div>

          ${this.currentFileData ? html`<div id="file-data-block">
            <div id="file-name">${this.currentFileData.name}</div>
            <div id="file-size">${this.currentFileData.size} bytes</div>
          </div>` : null}
        </section>

        <section id="main-section">
          <div id="text">
            <p>${this.currentText}</p>
          </div>

          <fluent-text-area id="questionInput" @change="${($event: any) => this.setQuestionText($event)}" .value="${this.questionText}"></fluent-text-area>
        </section>
      </main>
    `;
  }
}
