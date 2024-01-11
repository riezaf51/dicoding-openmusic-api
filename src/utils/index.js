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

const mapDBToLiteSongModel = ({
    id,
    title,
    performer,
}) => ({
    id,
    title,
    performer,
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

const mapDBToPlaylistModel = ({
    id,
    name,
    username,
    songs,
    created_at,
    updated_at,
}) => ({
    id,
    name,
    username,
    songs,
    createdAt: created_at,
    updatedAt: updated_at,
});

const mapDBToPlaylistWithoutSongsModel = ({
    id,
    name,
    username,
}) => ({
    id,
    name,
    username,
});

const mapDBToAlbumWithSongsModel = (albumWithSongsData) => {
    const { album } = albumWithSongsData[0];
    const songs = albumWithSongsData
        .filter((row) => row.song)
        .map((row) => mapDBToSongModel(row));

    album.songs = songs;
    return mapDBToAlbumModel(album);
};

const mapDBToPlaylistWithSongsModel = (playlistWithSongsData) => {
    const { playlist, username } = playlistWithSongsData[0];
    const songs = playlistWithSongsData
        .filter((row) => row.song)
        .map((row) => mapDBToLiteSongModel(row.song));

    playlist.songs = songs;
    playlist.username = username;
    return mapDBToPlaylistModel(playlist);
};

const mapDBToPlaylistActivitiesModel = (playlistWithActivitiesData) => {
    const { playlist_id: playlistId } = playlistWithActivitiesData[0];
    const activities = playlistWithActivitiesData
        .filter((row) => row.action)
        .map((row) => ({
            username: row.username,
            title: row.title,
            action: row.action,
            time: row.time,
        }));

    return {
        playlistId,
        activities,
    };
};

module.exports = {
    mapDBToSongModel,
    mapDBToAlbumModel,
    mapDBToAlbumWithSongsModel,
    mapDBToPlaylistWithoutSongsModel,
    mapDBToPlaylistWithSongsModel,
    mapDBToPlaylistActivitiesModel,
};
