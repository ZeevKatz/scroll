export interface AnimateOptions {
  element: Element | Element[];
  time: number;
  from?: Partial<CSSStyleDeclaration>;
  to: Partial<CSSStyleDeclaration>;
  delay?: number;
  reverse?: boolean;
  ease?: string;
}