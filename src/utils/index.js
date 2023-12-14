/* eslint-disable camelcase */

const mapDBToSongModel = ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    album_id,
    created_at,
    updated_at,
}) => ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId: album_id,
    createdAt: created_at,
    updatedAt: updated_at,
});

const mapDBToAlbumModel = ({
    id,
    name,
    year,
    songs,
    created_at,
    updated_at,
}) => ({
    id,
    name,
    year,
    songs,
    createdAt: created_at,
    updatedAt: updated_at,
});

const mapDBToAlbumWithSongsModel = (albumWithSongsData) => {
    const { album } = albumWithSongsData[0];
    const songs = albumWithSongsData
        .filter((row) => row.song)
        .map((row) => mapDBToSongModel(row.song));

    album.songs = songs;
    return mapDBToAlbumModel(album);
};

module.exports = {
    mapDBToSongModel,
    mapDBToAlbumModel,
    mapDBToAlbumWithSongsModel,
};
