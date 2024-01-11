class PlaylistsHandler {
    constructor(playlistsService, songsService, activitiesService, validator) {
        this._playlistsService = playlistsService;
        this._songsService = songsService;
        this._activitiesService = activitiesService;
        this._validator = validator;
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);

        const { name } = request.payload;

        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this._playlistsService.addPlaylist({
            name,
            owner: credentialId,
        });

        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistsHandler(request) {
        const { id: credentialId } = request.auth.credentials;

        const playlists = await this._playlistsService.getPlaylists(credentialId);

        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistByIdHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(id, credentialId);

        await this._playlistsService.deletePlaylistById(id);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }

    async postSongToPlaylistHandler(request, h) {
        this._validator.validateSongToPlaylistPayload(request.payload);

        const { id: playlistId } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._songsService.validateSongExistence(songId);
        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

        const playlistSongsId = await this._playlistsService.addSongToPlaylist(playlistId, songId);

        await this._activitiesService.addActivityToPlaylist({
            playlistId,
            songId,
            userId: credentialId,
            action: 'add',
        });

        const response = h.response({
            status: 'success',
            message: 'Lagu berhasil ditambahkan ke playlist',
            data: {
                playlistSongsId,
            },
        });
        response.code(201);
        return response;
    }

    async getSongsFromPlaylistByIdHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(id, credentialId);

        const playlist = await this._playlistsService.getSongsFromPlaylistById(id);

        return {
            status: 'success',
            data: {
                playlist,
            },
        };
    }

    async deleteSongFromPlaylistByIdHandler(request) {
        const { id: playlistId } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

        await this._playlistsService.deleteSongFromPlaylistById(playlistId, songId);

        await this._activitiesService.addActivityToPlaylist({
            playlistId,
            songId,
            userId: credentialId,
            action: 'delete',
        });

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus dari playlist',
        };
    }

    async getPlaylistActivitiesById(request) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

        const activities = await this._activitiesService.getActivitiesFromPlaylist(playlistId);

        return {
            status: 'success',
            data: activities,
        };
    }
}

module.exports = PlaylistsHandler;
