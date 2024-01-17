const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToAlbumWithSongsModel } = require('../../utils');

class AlbumsService {
    constructor(cacheService) {
        this._cacheService = cacheService;
        this._pool = new Pool();
    }

    async addAlbum({ name, year }) {
        const id = `album-${nanoid(16)}`;
        const createdAt = new Date().toISOString();

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $4) RETURNING id',
            values: [id, name, year, createdAt],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT to_json(albums) AS album, to_json(songs) AS song FROM albums LEFT JOIN songs ON albums.id = songs.album_id WHERE albums.id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }

        return mapDBToAlbumWithSongsModel(result.rows);
    }

    async editAlbumById(id, { name, year }) {
        const updatedAt = new Date().toISOString();

        const query = {
            text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
            values: [name, year, updatedAt, id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }

    async validateAlbumExistence(id) {
        const query = {
            text: 'SELECT id FROM albums WHERE id = $1',
            values: [id],
        };

        const albumExists = (await this._pool.query(query)).rows.length !== 0;

        if (!albumExists) {
            throw new NotFoundError('Id album tidak ditemukan');
        }
    }

    async addAlbumCover(id, coverUrl) {
        const query = {
            text: 'UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id',
            values: [coverUrl, id],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Id album tidak ditemukan');
        }
    }

    async addAlbumLikeById(userId, albumId) {
        const id = `like-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Gagal menyukai album');
        }

        await this._cacheService.delete(`likes:${albumId}`);
    }

    async deleteAlbumLikeById(userId, albumId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 and album_id = $2',
            values: [userId, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new NotFoundError('Gagal batal menyukai album. Album belum disukai');
        }

        await this._cacheService.delete(`likes:${albumId}`);
    }

    async getAlbumLikesCountById(id) {
        try {
            const result = await this._cacheService.get(`likes:${id}`);
            return {
                count: JSON.parse(result),
                isCache: true,
            };
        } catch {
            const query = {
                text: 'SELECT id FROM user_album_likes WHERE album_id = $1',
                values: [id],
            };

            const result = await this._pool.query(query);

            await this._cacheService.set(`likes:${id}`, JSON.stringify(result.rows.length));

            return {
                count: result.rows.length,
                isCache: false,
            };
        }
    }

    async verifyUserHasNotLikedAlbum(userId, albumId) {
        const query = {
            text: 'SELECT id FROM user_album_likes WHERE user_id = $1 and album_id = $2',
            values: [userId, albumId],
        };

        const result = await this._pool.query(query);

        if (result.rows.length > 0) {
            throw new InvariantError('Gagal menyukai album. Album sudah disukai');
        }
    }
}

module.exports = AlbumsService;
