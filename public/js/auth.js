function isAuthenticated() {
  if (!getToken()) {
    window.location.href = '/signin.html';
  } else {
    return true;
  }
}

function getToken() {
  return localStorage.getItem('@fichaApp:token');
}

function signin(token) {
  localStorage.setItem('@fichaApp:token', token);

  window.location.href = '/fichas.html';
}

function signout() {
  localStorage.removeItem('@fichaApp:token');

  window.location.href = '/signin.html';
}

export default { isAuthenticated, getToken, signin, signout };
