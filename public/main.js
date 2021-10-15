const socket = io();

const inboxPeople = document.querySelector('.inbox__people');
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");
const fallback = document.querySelector(".fallback");

let userName = '';

function getUserNameClass(userName) {
  return `${userName}-userlist`;
}

function addToUsersBox(userName) {
  const userNameClass = getUserNameClass(userName);

  if (!!document.querySelector(`.${userNameClass}`)) {
    return;
  }

  const userBox = `
    <div class="${userNameClass} chat_ib">
      <h5>${userName}</h5>
    </div>
  `;

  inboxPeople.innerHTML += userBox;
}

function handleNewUserConnection(user) {
  userName = user || `User${Math.floor(Math.random() * 1000000)}`;

  socket.emit('new user', userName);
}

handleNewUserConnection();


function addNewMessage({ user, message }) {
  const time = new Date();

  const formattedTime = time.toLocaleString('en-Us', {
    hour: 'numeric',
    minute: 'numeric'
  });

  const receivedMsg = `
    <div class="incoming__message>
      <div class="received__message>
        <p>${message}</p>
        <div class="message__info">
          <span class="message__author">${user}</span>
          <span class="time_date">${formattedTime}</span>
        </div>
      </div>
    </div>
  `;

  const myMsg = `
    <div class="outgoing__message">
      <div class="sent__message">
        <p>${message}</p>
        <div class="message__info">
          <span class="time_date">${formattedTime}</span>
        </div>
      </div>
    </div>
  `;

  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
}

messageForm.addEventListener('submit', e => {
  e.preventDefault();

  if (!inputField.value) {
    return;
  }

  socket.emit('chat message', {
    message: inputField.value,
    nickName: userName,
  });

  inputField.value = '';

  socket.emit("typing", {
    isTyping: false,
    nickName: userName,
  });
});

inputField.addEventListener("keyup", () => {
  socket.emit("typing", {
    isTyping: !!inputField.value.length,
    nickName: userName,
  });
});

socket.on('new user', data => {
  data.map(user => addToUsersBox(user));
});

socket.on('user disconnected', userName => {
  document.querySelector(`.${getUserNameClass(userName)}`).remove();
});

socket.on('chat message', data => {
  addNewMessage({ user: data.nickName, message: data.message });
});

socket.on('typing', data => {
  const { isTyping, nickName } = data;

  if (!isTyping) {
    fallback.innerHTML = '';
    return;
  }

  fallback.innerHTML = `<p>${nickName} is typing...</p>`;
})