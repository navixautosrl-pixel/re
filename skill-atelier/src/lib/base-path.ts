// next/image preloads and metadata icon routes don't get the basePath prefix
// under a subpath static export, so local asset URLs go through this.
export const withBasePath = (p: string) => `${process.env.BASE_PATH ?? ""}${p}`;
