export const withBasePath = (p: string) => `${process.env.BASE_PATH ?? ""}${p}`;
