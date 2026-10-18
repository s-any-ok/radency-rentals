type Shades<K extends string | number> = Record<K, string>;

export declare const palette: {
  primary: Shades<50 | 100 | 200 | 500 | 600 | 700>;
  ink: Shades<50 | 100 | 200 | 300 | 400 | 500 | 700 | 900>;
  success: Shades<50 | 600 | 700>;
  warning: Shades<50 | 500 | 700>;
  danger: Shades<50 | 500 | 600 | 700>;
  info: Shades<50 | 600 | 700>;
  white: string;
  black: string;
  backdrop: string;
};
