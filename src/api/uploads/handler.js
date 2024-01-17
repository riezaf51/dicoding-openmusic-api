const config = require('../../utils/config');

class UploadsHandler {
    constructor(storageService, albumsService, validator) {
        this._storageService = storageService;
        this._albumsService = albumsService;
        this._validator = validator;
    }

    async postUploadImageHandler(request, h) {
        const { cover } = request.payload;
        this._validator.validateImageHeaders(cover.hapi.headers);

        const { id: albumId } = request.params;

        const filename = await this._storageService.writeFile(cover, cover.hapi);

        const coverUrl = `http://${config.app.host}:${config.app.port}/upload/images/${filename}`;

        await this._albumsService.addAlbumCover(albumId, coverUrl);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });
        response.code(201);
        return response;
        // `http://${config.app.host}:${config.app.port}/upload/images/${filename}`
    }
}

module.exports = UploadsHandler;
