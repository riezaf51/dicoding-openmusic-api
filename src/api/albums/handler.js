class AlbumsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;
    }

    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);

        const { name, year } = request.payload;

        const albumId = await this._service.addAlbum({ name, year });

        const response = h.response({
            status: 'success',
            data: {
                albumId,
            },
        });

        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request) {
        const { id } = request.params;

        const album = await this._service.getAlbumById(id);

        return {
            status: 'success',
            data: {
                album,
            },
        };
    }

    async putAlbumByIdHandler(request) {
        this._validator.validateAlbumPayload(request.payload);

        const { id } = request.params;

        await this._service.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    }

    async deleteAlbumByIdHandler(request) {
        const { id } = request.params;

        await this._service.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album berhasil dihapus',
        };
    }

    async postAlbumLikeByIdHandler(request, h) {
        const { id: albumId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.validateAlbumExistence(albumId);
        await this._service.verifyUserHasNotLikedAlbum(credentialId, albumId);
        await this._service.addAlbumLikeById(credentialId, albumId);

        const response = h.response({
            status: 'success',
            message: 'Berhasil menyukai album',
        });

        response.code(201);
        return response;
    }

    async deleteAlbumLikeByIdHandler(request) {
        const { id: albumId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.validateAlbumExistence(albumId);

        await this._service.deleteAlbumLikeById(credentialId, albumId);

        return {
            status: 'success',
            message: 'Batal menyukai album',
        };
    }

    async getAlbumLikesByIdHandler(request, h) {
        const { id } = request.params;

        const likes = await this._service.getAlbumLikesCountById(id);

        const response = h.response({
            status: 'success',
            data: {
                likes: likes.count,
            },
        });

        if (likes.isCache) {
            response.header('X-Data-Source', 'cache');
        }

        return response;
    }
}

module.exports = AlbumsHandler;
