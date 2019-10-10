const users = [];

//add user ,remove user,getuser,getusersinRoom

const addUser = ({ id, username, room }) => {
  //Clean the data
  username = username.toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'Username and room are required'
    };
  }

  //check for exisiting user
  const exisitingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  if (exisitingUser) {
    return {
      error: 'username is in use'
    };
  }
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => {
    return user.id === id;
  });

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUserInRoom = room => {
  return users.filter(user => {
    return user.room === room;
  });
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom
};
