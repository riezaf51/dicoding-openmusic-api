class SongsHandler {
    constructor(service, validator) {
        this._service = service;
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

        await this._service.validateAlbumExistence(albumId);

        const songId = await this._service.addSong({
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
        const songs = await this._service.getSongs(request.query);

        return {
            status: 'success',
            data: {
                songs,
            },
        };
    }

    async getSongByIdHandler(request) {
        const { id } = request.params;

        const song = await this._service.getSongById(id);

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

        await this._service.validateAlbumExistence(albumId);

        await this._service.editSongById(id, request.payload);

        return {
            status: 'success',
            message: 'Lagu berhasil diperbarui',
        };
    }

    async deleteSongByIdHandler(request) {
        const { id } = request.params;

        await this._service.deleteSongById(id);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus',
        };
    }
}

module.exports = SongsHandler;
