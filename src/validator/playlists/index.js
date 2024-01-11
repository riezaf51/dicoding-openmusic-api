const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistsPayloadSchema, SongsToPlaylistPayloadSchema } = require('./schema');

const PlaylistsValidator = {
    validatePlaylistPayload: (payload) => {
        const validationResult = PlaylistsPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
    validateSongToPlaylistPayload: (payload) => {
        const validationResult = SongsToPlaylistPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = PlaylistsValidator;
