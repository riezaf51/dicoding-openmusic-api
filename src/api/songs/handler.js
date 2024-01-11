class SongsHandler {
    constructor(songsService, albumsService, validator) {
        this._songsService = songsService;
        this._albumsService = albumsService;
        this._validator = validator;
    }

    async postSongHandler(request, h) {
        this._validator.validateSongPayload(request.payload);

        const {
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
        } = request.payload;

        if (albumId) {
            await this._albumsService.validateAlbumExistence(albumId);
        }

        const songId = await this._songsService.addSong({
            title,
            year,
            genre,
            performer,
            duration,
            albumId,
        });

        const response = h.response({
            status: 'success',
            data: {
                songId,
            },
        });

        response.code(201);
        return response;
    }

    async getSongsHandler(request) {
        const songs = await this._songsService.getSongs(request.query);

        return {
            status: 'success',
            data: {
                songs,
            },
        };
    }

    async getSongByIdHandler(request) {
        const { id } = request.params;

        const song = await this._songsService.getSongById(id);

        return {
            status: 'success',
            data: {
                song,
            },
        };
    }

    async putSongByIdHandler(request) {
        this._validator.validateSongPayload(request.payload);
        const { id } = request.params;
        const { albumId } = request.payload;

        if (albumId) {
            await this._albumsService.validateAlbumExistence(albumId);
        }

        await this._songsService.editSongById(id, request.payload);

        return {
            status: 'success',
            message: 'Lagu berhasil diperbarui',
        };
    }

    async deleteSongByIdHandler(request) {
        const { id } = request.params;

        await this._songsService.deleteSongById(id);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus',
        };
    }
}

module.exports = SongsHandler;
