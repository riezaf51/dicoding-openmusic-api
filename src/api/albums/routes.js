const routes = (handler) => [
    {
        method: 'POST',
        path: '/albums',
        handler: (request, h) => handler.postAlbumHandler(request, h),
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: (request) => handler.getAlbumByIdHandler(request),
    },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: (request) => handler.putAlbumByIdHandler(request),
    },
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: (request) => handler.deleteAlbumByIdHandler(request),
    },
    {
        method: 'POST',
        path: '/albums/{id}/likes',
        handler: (request, h) => handler.postAlbumLikeByIdHandler(request, h),
        options: {
            auth: 'openmusicapi_jwt',
        },
    },
    {
        method: 'DELETE',
        path: '/albums/{id}/likes',
        handler: (request) => handler.deleteAlbumLikeByIdHandler(request),
        options: {
            auth: 'openmusicapi_jwt',
        },
    },
    {
        method: 'GET',
        path: '/albums/{id}/likes',
        handler: (request, h) => handler.getAlbumLikesByIdHandler(request, h),
    },
];

module.exports = routes;
