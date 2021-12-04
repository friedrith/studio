export default (type: string, link: { href: string }, label: string) => {
  if (type === 'link') {
    return { label, href: link.href };
  }

  return null;
};
