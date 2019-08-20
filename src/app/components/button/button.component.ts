import { CustomElement } from 'custom-elements-ts';

@CustomElement({
  tag: 'app-button',
  template: `<slot></slot>`,
  style: require('./button.component.scss')
})
export class ButtonComponent extends HTMLElement {}
