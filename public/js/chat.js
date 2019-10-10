const socket = io();

//ELEMENT
const $messageform = document.querySelector('#message-form');
const $messageforminput = $messageform.querySelector('input');
const $messageformButton = $messageform.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messageContainer = document.querySelector('#messages');

//TEMPLATES
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const autoscroll = () => {
  //New Messafe aelemnt
  const $newMessage = $messageContainer.lastElementChild;

  //Height of the new message
  const newMessagestyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessagestyles.marginBottom);

  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //VISIBLE HEIGHT
  const visibleHeight = $messageContainer.offsetHeight;

  //heightof massage container
  const containerHeight = $messageContainer.scrollHeight;

  //HOW FAR I SCROLL?
  const scrollOffset = $messageContainer.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messageContainer.scrollTop = $messageContainer.scrollHeight;
  }

};

socket.on('message', msg => {
  console.log(msg);
  //const messageTemplate = '<p>mido</p>';
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format('h:mm a')
  });
  $messageContainer.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('LocationMessage', message => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  });
  $messageContainer.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

$messageform.addEventListener('submit', e => {
  e.preventDefault();

  $messageformButton.setAttribute('disabled', 'disabled');

  const msg = e.target.elements.msga.value;
  socket.emit('sendMessage', msg, error => {
    $messageformButton.removeAttribute('disabled');
    $messageforminput.value = '';
    $messageforminput.focus();
    if (error) return console.log(error);
    console.log('Message delivered');
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation)
    return alert('GeoLocation is not supported by your browser');
  $sendLocationButton.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition(position => {
    console.log(position);
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        $sendLocationButton.removeAttribute('disabled');
        console.log('location shred success');
      }
    );
  });
});

socket.emit('join', { username, room }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, { room, users });
  document.querySelector('#sidebar').innerHTML = html;
});

// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('Clicked');
//   socket.emit('increment');
// });
