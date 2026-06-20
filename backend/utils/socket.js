let _io = null;

const init = (io) => { _io = io; };

const emit = (event, data) => {
  if (_io) _io.emit(event, data);
};

const emitToAdmin = (event, data) => {
  if (_io) _io.to('admin_room').emit(event, data);
};

module.exports = { init, emit, emitToAdmin };
