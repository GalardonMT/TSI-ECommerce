const TOKEN_KEYS = ["access", "refresh", "token"];

type TokenMap = Partial<Record<(typeof TOKEN_KEYS)[number], string>>;

export const persistTokens = (data: TokenMap) => {
  try {
    Object.entries(data).forEach(([key, value]) => {
      if (value) localStorage.setItem(key, value);
    });
  } catch {
    /* ignore */
  }
};

export const clearTokens = () => {
  try {
    TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* ignore */
  }
};
