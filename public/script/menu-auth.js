import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const menu = document.getElementById("menu");

if (menu) {
  const createLinkItem = (href, label, external = false, className = "") => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    if (className) link.className = className;

    if (external) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    item.appendChild(link);
    return item;
  };

  const createUserItem = (label) => {
    const item = document.createElement("li");
    const user = document.createElement("span");
    user.className = "menu-user";
    user.textContent = label;
    item.appendChild(user);
    return item;
  };

  const appendBaseLinks = () => {
    menu.appendChild(createLinkItem("index.html", "Página Inicial"));
    menu.appendChild(createLinkItem("animais_encontra.html", "Encontrados"));
    menu.appendChild(
      createLinkItem("https://www.anjosdajuda.org/adote", "Adoção", true),
    );
    menu.appendChild(createLinkItem("dicas.html", "Cuidados"));
    menu.appendChild(createLinkItem("contato.html", "Contato"));
  };

  onAuthStateChanged(auth, (user) => {
    menu.replaceChildren();
    appendBaseLinks();

    if (!user) {
      menu.appendChild(
        createLinkItem(
          "criar-conta.html",
          "Entrar / Cadastrar",
          false,
          "menu-login",
        ),
      );
      return;
    }

    const nomeExibicao =
      user.displayName || user.email?.split("@")[0] || "Usuário";
    menu.appendChild(createLinkItem("cadastrados.html", "Meus Pets"));
    menu.appendChild(createUserItem(nomeExibicao));

    const logoutItem = document.createElement("li");
    const logoutLink = document.createElement("a");
    logoutLink.className = "menu-logout";
    logoutLink.href = "#";
    logoutLink.textContent = "Sair";
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();
      signOut(auth).then(() => {
        localStorage.removeItem("usuarioLogado");
        window.location.reload();
      });
    });
    logoutItem.appendChild(logoutLink);
    menu.appendChild(logoutItem);
  });
}
