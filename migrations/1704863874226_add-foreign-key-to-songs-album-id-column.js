/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.addConstraint('songs', 'fk_songs.song_albums.album_id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE SET NULL');
};

exports.down = (pgm) => {
    pgm.dropConstraint('songs', 'fk_songs.song_albums.album_id');
};
