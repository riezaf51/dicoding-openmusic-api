const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToPlaylistWithSongsModel, mapDBToPlaylistWithoutSongsModel } = require('../../utils');

class PlaylistsService {
    constructor() {
        this._pool = new Pool();
    }

    async addPlaylist({ name, owner }) {
        const id = `playlist-${nanoid(16)}`;
        const createdAt = new Date().toISOString();

        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $4) RETURNING id',
            values: [id, name, owner, createdAt],
        };

        const playlistId = (await this._pool.query(query)).rows[0].id;

        if (!playlistId) {
            throw new InvariantError('Playlist gagal ditambahkan');
        }

        return playlistId;
    }

    async getPlaylists(owner) {
        const query = {
            text: 'SELECT playlists.id, playlists.name, users.username FROM playlists INNER JOIN users ON users.id = playlists.owner WHERE owner = $1',
            values: [owner],
        };

        const result = await this._pool.query(query);

        return result.rows.map(mapDBToPlaylistWithoutSongsModel);
    }

    async deletePlaylistById(id) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }

    async addSongToPlaylist(playlistId, songId) {
        const id = `playlist_song-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }

        return result.rows[0].id;
    }

    async getSongsFromPlaylistById(id) {
        const query = {
            text: 'SELECT to_json(playlists) AS playlist, to_json(songs) AS song, users.username FROM playlists LEFT JOIN users ON users.id = playlists.owner LEFT JOIN playlist_songs ON playlists.id = playlist_songs.playlist_id LEFT JOIN songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        return mapDBToPlaylistWithSongsModel(result.rows);
    }

    async deleteSongFromPlaylistById(playlistId, songId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new InvariantError('Lagu gagal dihapus dari playlist');
        }
    }

    async verifyPlaylistOwner(id, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Playlist tidak ditemukan');
        }

        const playlist = result.rows[0];

        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
        }
    }

    async verifyPlaylistExistence(id) {
        const query = {
            text: 'SELECT id FROM playlists WHERE id = $1',
            values: [id],
        };

        const playlistExists = (await this._pool.query(query)).rows.length !== 0;

        if (!playlistExists) {
            throw new NotFoundError('Id playlist tidak ditemukan');
        }
    }
}

module.exports = PlaylistsService;
