interface Link {
  name: string;
  link: string;
}

export const links: { [k: string]: Link } = {
  home: { link: "/", name: "Home" },
  websocket: { link: "/ws", name: "Websocket" },
};

export const menus: { name: string; link: string }[] = Object.values(links);

export default links;
